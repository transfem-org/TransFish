<div align="center">
<a href="https://stop.voring.me/">
	<img src="./assets/title_float.svg" alt="Calckey logo" style="border-radius:50%" width="400"/>
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
  - Recommended Instances timeline
  - Improved notifications
  - Many more user and admin settings

</div>

<div style="clear: both;"></div>

# 📝 Documentation

Misskey/Calckey documentation can be found at [Misskey Hub](https://misskey-hub.net/).

# 🚚 Migrating from Misskey to Calckey

You need at least 🐢 NodeJS v16.15.0 (v18.4.0 recommended!) and *exactly* 🧶 Yarn v3.2.2!

## 📩 Install dependencies

```sh
# nvm install 18.4.0 && nvm alias default 18.4.0 && nvm use 18.4.0
corepack enable
yarn set version berry
```

## 👀 Get folder ready

```sh
git clone https://codeberg.org/thatonecalculator/calckey.git
cd calckey/
# git checkout main # if you want only stable versions
cp ../misskey/.config/default.yml ./.config/default.yml # or wherever misskey folder is
# cp -r ../misskey/files . # if you don't use object storage
```

## 🚀 Build and launch!

### `git pull` and run these steps to update Calckey in the future!

```sh
# git pull
YARN_CHECKSUM_BEHAVIOR=update yarn install
NODE_ENV=production npm run build && npm run migrate
# Edit service to point to calckey folder and restart!
```

### 🐳 Docker

```sh
# git pull
sudo docker-compose build
sudo docker-compose stop && sudo docker-compose up -d
```

# 💸 Patrons

None yet! You can support of the development of this fork here, every little bit counts: https://liberapay.com/ThatOneCalculator/
