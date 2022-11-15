<div align="center">
<a href="https://stop.voring.me/">
	<img src="./.github/title_float.svg" alt="Calckey logo" style="border-radius:50%" width="400"/>
</a>

**🌎 **[Calckey](https://stop.voring.me/)** is an open source, decentralized social media platform that's free forever! 🚀**

</div>

<div>

<img src="https://pool.jortage.com/voringme/misskey/e7cd2a17-8b23-4e1e-b5cf-709480c623e2.png" align="right" height="320px"/>

# ✨ About Calckey

- Calckey is based off of Misskey, a powerful microblogging server on ActivityPub with features such as emoji reactions, a customizable web ui, rich chatting, and much more!
- Calckey adds many quality of life changes and bug fixes for users and instance admins alike.
- Read **[this document](./CALCKEY.md)** all for current and future differences.
- Notable differences:
  - Improved UI/UX (especially on mobile)
  - Improved notifications
  - Improved instance security
  - Recommended Instances timeline
  - OCR image captioning
  - New and improved Groups
  - Better intro tutorial
  - Many more user and admin settings
  - [So much more!](./CALCKEY.md)

</div>

<div style="clear: both;"></div>

# 🥂 Links

- 💸 Liberapay: <https://liberapay.com/ThatOneCalculator>
- 💁 Matrix support room: <https://matrix.to/#/#calckey:matrix.fedibird.com>
- 📜 Instance list: <https://calckey.fediverse.observer/list>
- 📖 JoinFediverse Wiki: <https://joinfediverse.wiki/What_is_Calckey%3F>

# 🌠 Getting started

This guide will work for both **starting from scratch** and **migrating from Misskey**.

## 📦 Dependencies

- At least 🐢 [NodeJS](https://nodejs.org/en/) v16.15.0 (v18.12.1 recommended)

> ⚠️ NodeJS v19 is not supported as of right now because of [this issue](https://github.com/nodejs/node-gyp/issues/2757).

- 🐘 At least [PostgreSQL](https://www.postgresql.org/) v12

- 🍱 At least [Redis](https://redis.io/) v6 (v7 recommended)

- 🛰️ (Optional, for non-Docker) [pm2](https://pm2.io/)

## 👀 Get folder ready

```sh
git clone https://codeberg.org/thatonecalculator/calckey.git
cd calckey/
# git checkout main # if you want only stable versions
```

## 📩 Install dependencies

```sh
# nvm install 18 && nvm alias default 18 && nvm use 18
corepack enable
```

## 💅 Customize

- To add custom CSS for all users, edit `./custom/instance.css`.
- To add static assets (such as images for the splash screen), place them in the `./custom/` directory. They'll then be avaliable on `https://yourinstance.tld/static-assets/filename.ext`.

## 🧑‍🔬 Configuring a new instance

- Run `cp .config/example.yml .config/default.yml`
- Edit `.config/default.yml`, making sure to fill out required fields.
- Also copy and edit `.config/docker_example.env` to `.config/docker.env` if you're using Docker.

## 🚚 Migrating from Misskey to Calckey

> ⚠️ Because of their changes, migrating from Foundkey is not supported.

```sh
cp ../misskey/.config/default.yml ./.config/default.yml # replace `../misskey/` with misskey path, add `docker.env` if you use Docker
cp -r ../misskey/files . # if you don't use object storage
```

## 🍀 NGINX

<details>
<summary>Click to see an example NGINX config:</summary>

```nginx
# Replace example.tld with your domain

# For WebSocket
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=cache1:16m max_size=1g inactive=720m use_temp_path=off;

server {
    listen 80;
    listen [::]:80;
    server_name example.tld;

    # For SSL domain validation
    root /var/www/html;
    location /.well-known/acme-challenge/ { allow all; }
    location /.well-known/pki-validation/ { allow all; }
    location / { return 301 https://$server_name$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.tld;

    ssl_session_timeout 1d;
    ssl_session_cache shared:ssl_session_cache:10m;
    ssl_session_tickets off;

    # To use Let's Encrypt certificate
    ssl_certificate     /etc/letsencrypt/live/example.tld/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.tld/privkey.pem;

    # To use Debian/Ubuntu's self-signed certificate (For testing or before issuing a certificate)
    #ssl_certificate     /etc/ssl/certs/ssl-cert-snakeoil.pem;
    #ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    # SSL protocol settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Change to your upload limit
    client_max_body_size 80m;

    # Proxy to Node
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_redirect off;

        # If it's behind another reverse proxy or CDN, remove the following.
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # For WebSocket
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Cache settings
        proxy_cache cache1;
        proxy_cache_lock on;
        proxy_cache_use_stale updating;
        add_header X-Cache $upstream_cache_status;
    }
}
```

</details>

## 🚀 Build and launch!

### 🐢 NodeJS
#### `git pull` and run these steps to update Calckey in the future!

```sh
# git pull
yarn install
NODE_ENV=production yarn run build && yarn run migrate
pm2 start "NODE_ENV=production yarn start" --name Calckey
```

### 🐋 Prebuilt Docker image

```sh
docker pull thatonecalculator/calckey
docker up -d
```

### 🐳 Docker Compose

```sh
sudo docker compose build
sudo docker-compose run --rm web yarn run init
sudo docker compose up -d
```

## 😉 Tips & Tricks

- I'd ***strongly*** recommend against using CloudFlare, but if you do, make sure to turn code minification off. 
- For push notifications, run `npx web-push generate-vapid-keys`, the put the public and private keys into Control Panel > General > ServiceWorker.
- For translations, make a [DeepL](https://deepl.com) account and generate an API key, then put it into Control Panel > General > DeepL Translation.
<!-- - For link previews, go to Control Panel > Security > Summaly Proxy and put in `https://summaly.arkjp.net`. -->
- To add another admin account:
	- Go to the user's page > 3 Dots > About > Moderation > turn on "Moderator"
	- Go back to Overview > click the clipboard icon next to the ID
	- Run `psql -d calckey` (or whatever the database name is)
	- Run `UPDATE "user" SET "isAdmin" = true WHERE id='999999';` (replace 999999 with the copied ID)
	- Have the new admin log out and log back in 