## Install dev and compilation dependencies, build files
FROM node:20.5-bookworm as build
WORKDIR /firefish

# Install compilation dependencies
RUN apt-get update && apt-get install -y libvips42 python3 git wget curl build-essential
RUN mkdir -m777 /opt/rust /opt/cargo
ENV RUSTUP_HOME=/opt/rust CARGO_HOME=/opt/cargo PATH=/opt/cargo/bin:$PATH
RUN wget --https-only --secure-protocol=TLSv1_2 -O- https://sh.rustup.rs | sh /dev/stdin -y
RUN printf '#!/bin/sh\nexport CARGO_HOME=/opt/cargo\nexec /bin/sh "$@"\n' >/usr/local/bin/sh
RUN chmod +x /usr/local/bin/sh

# Copy only the cargo dependency-related files first, to cache efficiently
COPY packages/backend/native-utils/Cargo.toml packages/backend/native-utils/Cargo.toml
COPY packages/backend/native-utils/Cargo.lock packages/backend/native-utils/Cargo.lock
COPY packages/backend/native-utils/src/lib.rs packages/backend/native-utils/src/
COPY packages/backend/native-utils/migration/Cargo.toml packages/backend/native-utils/migration/Cargo.toml
COPY packages/backend/native-utils/migration/src/lib.rs packages/backend/native-utils/migration/src/

# Install cargo dependencies
RUN cargo fetch --locked --manifest-path /firefish/packages/backend/native-utils/Cargo.toml

# Copy only the dependency-related files first, to cache efficiently
COPY package.json pnpm*.yaml ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/sw/package.json packages/sw/package.json
COPY packages/firefish-js/package.json packages/firefish-js/package.json
COPY packages/megalodon/package.json packages/megalodon/package.json
COPY packages/backend/native-utils/package.json packages/backend/native-utils/package.json
COPY packages/backend/native-utils/npm/linux-x64-musl/package.json packages/backend/native-utils/npm/linux-x64-musl/package.json
COPY packages/backend/native-utils/npm/linux-arm64-musl/package.json packages/backend/native-utils/npm/linux-arm64-musl/package.json

# Configure pnpm, and install dev mode dependencies for compilation
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile

# Copy in the rest of the native-utils rust files
COPY packages/backend/native-utils packages/backend/native-utils/

# Compile native-utils
RUN pnpm run --filter native-utils build

# Copy in the rest of the files to compile
COPY . ./
RUN env NODE_ENV=production sh -c "pnpm run --filter '!native-utils' build && pnpm run gulp"

# Trim down the dependencies to only those for production
RUN pnpm i --prod --frozen-lockfile

## Runtime container
FROM node:20.5-bookworm
WORKDIR /firefish

# Install runtime dependencies
RUN apt-get update && apt-get install -y libvips-dev zip unzip tini ffmpeg

COPY . ./

COPY --from=build /firefish/packages/megalodon /firefish/packages/megalodon

# Copy node modules
COPY --from=build /firefish/node_modules /firefish/node_modules
COPY --from=build /firefish/packages/backend/node_modules /firefish/packages/backend/node_modules
COPY --from=build /firefish/packages/sw/node_modules /firefish/packages/sw/node_modules
COPY --from=build /firefish/packages/client/node_modules /firefish/packages/client/node_modules
COPY --from=build /firefish/packages/firefish-js/node_modules /firefish/packages/firefish-js/node_modules

# Copy the finished compiled files
COPY --from=build /firefish/built /firefish/built
COPY --from=build /firefish/packages/backend/built /firefish/packages/backend/built
COPY --from=build /firefish/packages/backend/assets/instance.css /firefish/packages/backend/assets/instance.css
COPY --from=build /firefish/packages/backend/native-utils/built /firefish/packages/backend/native-utils/built

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production
VOLUME "/firefish/files"
ENTRYPOINT [ "/usr/bin/tini", "--" ]
CMD [ "pnpm", "run", "migrateandstart" ]
