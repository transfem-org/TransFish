use serde::Deserialize;
use std::env;
use std::fs;

use sea_orm_migration::prelude::*;

#[cfg(feature = "convert")]
mod vec_to_json;

#[async_std::main]
async fn main() {
    let cwd = env::current_dir().unwrap();
    let yml = fs::File::open(cwd.join("../../.config/default.yml"))
        .expect("Unable to read '.config/default.yml'");
    let config: Config = serde_yaml::from_reader(yml).expect("Unable to parse");

    env::set_var(
        "DATABASE_URL",
        format!(
            "postgres://{}:{}@{}:{}/{}",
            config.db.user, config.db.pass, config.db.host, config.db.port, config.db.db
        ),
    );

    cli::run_cli(migration::Migrator).await;

    #[cfg(feature = "convert")]
    vec_to_json::convert().await;
}

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "camelCase")]
pub struct Config {
    pub db: DbConfig,
}

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "camelCase")]
pub struct DbConfig {
    pub host: String,
    pub port: u32,
    pub db: String,
    pub user: String,
    pub pass: String,
}
