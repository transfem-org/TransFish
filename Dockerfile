## Install dev and compilation dependencies, build files
FROM node:20-alpine as build
WORKDIR /calckey

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk python3 rust cargo vips

# Copy only the cargo dependency-related files first, to cache efficiently
COPY packages/backend/native-utils/Cargo.toml packages/backend/native-utils/Cargo.toml
COPY packages/backend/native-utils/Cargo.lock packages/backend/native-utils/Cargo.lock
COPY packages/backend/native-utils/migration/Cargo.toml packages/backend/native-utils/migration/Cargo.toml
COPY packages/backend/native-utils/src/*.rs packages/backend/native-utils/src/

# Install cargo dependencies
RUN cd packages/backend && \
    cargo fetch --locked --manifest-path ./native-utils/migration/Cargo.toml

# Copy only the dependency-related files first, to cache efficiently
COPY package.json pnpm*.yaml ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/calckey-js/package.json packages/calckey-js/package.json
COPY packages/backend/native-utils/package.json packages/backend/native-utils/package.json
COPY packages/backend/native-utils/npm/linux-x64-musl/package.json packages/backend/native-utils/npm/linux-x64-musl/package.json
COPY packages/backend/native-utils/npm/linux-arm64-musl/package.json packages/backend/native-utils/npm/linux-arm64-musl/package.json

# Configure corepack and pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Install dev mode dependencies for compilation
RUN pnpm i --frozen-lockfile

# Copy in the rest of the native-utils rust files
COPY packages/backend/native-utils/.cargo packages/backend/native-utils/.cargo
COPY packages/backend/native-utils/src packages/backend/native-utils/src
COPY packages/backend/native-utils/migration packages/backend/native-utils/migration
COPY packages/backend/native-utils/tests packages/backend/native-utils/tests
COPY packages/backend/native-utils/*.rs packages/backend/native-utils/

# native-utils cargo build
RUN pnpm run build:cargo

# Copy in the rest of the files, to compile from TS to JS
COPY . ./
RUN pnpm run build:recursive
RUN pnpm run gulp

# Trim down the dependencies to only the prod deps
RUN pnpm i --prod --frozen-lockfile

# Clean up the cargo deps
RUN rm -rf /calckey/packages/backend/native-utils/target/release/deps

## Runtime container
FROM node:20-alpine
WORKDIR /calckey

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg vips-dev zip unzip rust cargo

COPY . ./

# Copy node modules
COPY --from=build /calckey/node_modules /calckey/node_modules
COPY --from=build /calckey/packages/backend/node_modules /calckey/packages/backend/node_modules
COPY --from=build /calckey/packages/sw/node_modules /calckey/packages/sw/node_modules
COPY --from=build /calckey/packages/client/node_modules /calckey/packages/client/node_modules
COPY --from=build /calckey/packages/calckey-js/node_modules /calckey/packages/calckey-js/node_modules

# Copy the finished compiled files
COPY --from=build /calckey/built /calckey/built
COPY --from=build /calckey/packages/backend/built /calckey/packages/backend/built
COPY --from=build /calckey/packages/backend/assets/instance.css /calckey/packages/backend/assets/instance.css
COPY --from=build /calckey/packages/backend/native-utils/built /calckey/packages/backend/native-utils/built
COPY --from=build /calckey/packages/backend/native-utils/target/release /calckey/packages/backend/native-utils/target/release

RUN corepack enable
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "run", "migrateandstart" ]
