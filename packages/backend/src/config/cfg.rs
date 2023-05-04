use serde::Deserialize;

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "camelCase")]
pub struct Config {
    pub url: String,
    pub port: u16,
    pub db: db::DbConfig,
}

pub mod db {
    use super::*;
    #[derive(Debug, PartialEq, Deserialize)]
    #[serde(rename = "camelCase")]
    pub struct DbConfig {
        pub host: String,
        pub port: u16,
        pub db: String,
        pub user: String,
        pub pass: String,
        #[serde(default = "true_fn")]
        pub disable_cache: bool,
        pub extra: Extra,
    }

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct Extra {
        #[serde(default = "true_fn")]
        pub extra: bool,
    }
}

fn true_fn() -> bool {
    true
}
