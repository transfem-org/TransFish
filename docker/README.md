# Running a Calckey instance with Docker
It is simple to run an instance of calckey with docker and docker-compose - you can be running your own *fedi* server in no time.

## Pre-built docker container
[thatonecalculator/calckey](https://hub.docker.com/r/thatonecalculator/calckey)
## docker-compose
You can find a `docker-compose.yml` file in the same folder as this `README`, along with a folder called `config` containing two **example** files needed to get the instance running:
- config/docker.env (**db config settings**)
- config/default.yml (**calckey instance settings**)

## configuring calckey

Rename the files:

`mv config/default_example.yml default.yml`

`mv config/docker_example.env docker.env`

then edit them according to your environment.
You can configure `docker.env` with anything you like, but you will have to pay attention to the `default.yml` file:
- `url` should be set to the URL you will be hosting the web interface for the instance at.
- `host`, `db`, `user`, `pass` will have to be configured in the PostgreSQL configuration section - `host` is the name of the postgres container (eg: *calckey_db_1*), and the others should match your `docker.env`.
- `host`will need to be configured in the *Redis configuration* section - it is the name of the redis container (eg: *calckey_redis_1*)

Everything else can be left as-is; unless you are setting up elasticsearch. More on this below.
## Running docker-compose
This will take some time. The [prebuilt container for calckey](https://hub.docker.com/r/thatonecalculator/calckey) is fairly large, and may take a few minutes to download and extract using docker.

Copy `docker-compose.yml` and the `config/` to the directory from which you intend to run your instance, and then from that directory run the **docker-compose** command:
`docker-compose up -d`.

This will take some time to come fully online, even after download and extracting the container images, and it may emit some error messages before completing successfully. Specifically, the `db` container needs to initialize and so isn't available to the `web` container right away. Only once the `db` container comes online does the `web` container start building and initializing the calckey tables.

Once the instance is up you can use a web browser to access the web interface at `http://serverip:3000` (where `serverip` is the IP of the server you are running the calckey instance on).

## Securing your instance with a reverse proxy
On its own *calckey* serves itself with HTTP, and does not support SSL. In order to support encrypted connections via HTTPS - an absolute necessity if you intend to host an instance accessible from the public internet - you need to add a reverse proxy to your setup.
### Adding reverse proxy container
Only [swag](https://hub.docker.com/r/linuxserver/swag) has been tested, but a similar setup should be possible with [caddy](https://hub.docker.com/_/caddy), or [traefik](https://hub.docker.com/_/traefik) or a bare metal `nginx` install.
- Follow the instructions at [https://github.com/linuxserver/docker-swag](https://github.com/linuxserver/docker-swag) to set up a separate `swag` container.
- Add a second shared external docker network for the `calckey` and `swag` containers to talk to each other, ensure both are connected to it via their respective `docker-compose.yml` files.
- configure `<swag-root>/config/nginx/proxy-confs/calckey.subdomain.conf` with the following: 
```
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name yourdomain.whatever;
    include /config/nginx/ssl.conf;
    client_max_body_size 0;

    location / {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app calckey_web_1;
        set $upstream_port 3000;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;

    }
}
```
Note: Make sure you set `server_name` in the above to your domain, and `$upstream_app` to the name for your calckey container.

Once you bring up both the `swag` reverse proxy container with the above configuration, and the `calckey` containers, you should be serving your instance and be able to browse to it at `https://yourdomain.whatever`.

## Enabling elasticsearch
If you decide to enable `elasticsearch`, you can uncomment the configuration lines for it in the `docker-compose.yml`, but you will also need to configure the `Elasticsearch configuration` section of the `config/default.yml`.

This is disabled by default, as it uses a great deal of server memory and can increase the load for your instance significantly.  It is unlikely that you will need to enable this for a small server, and if you are running a giant server then you probably do not need this `README` to begin with.

## Enjoy being a fediverse server admin
