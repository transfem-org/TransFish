use serde::Deserialize;

type Port = u16;

#[derive(Debug, PartialEq, Deserialize)]
pub struct MaxNoteLength(pub u16);

#[derive(Debug, PartialEq, Deserialize)]
pub enum IpFamily {
    Both = 0,
    IPv4 = 4,
    IPv6 = 6,
}

#[derive(Debug, PartialEq, Deserialize, Default)]
pub struct Host(pub String);

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "camelCase")]
pub struct Config {
    pub url: Host,
    pub port: Port,
    pub db: db::DbConfig,
    pub redis: redis::RedisConfig,
    pub sonic: sonic::SonicConfig,
    pub elasticsearch: elasticsearch::ElasticsearchConfig,
    pub id: IdGenerator,
    pub max_note_length: MaxNoteLength,
    pub max_caption_length: MaxNoteLength,
    pub disable_hsts: bool,
    pub cluster_limit: u16,
    pub deliver_job_concurrency: u16,
    pub inbox_job_concurrency: u16,
    pub deliver_job_per_sec: u16,
    pub inbox_job_per_sec: u16,
    pub deliver_job_max_attempts: u16,
    pub inbox_job_max_attempts: u16,
    pub outgoing_address_family: IpFamily,
    pub syslog: syslog::SyslogConfig,
    pub proxy: Host,
}

#[derive(Debug, PartialEq, Deserialize)]
pub enum IdGenerator {
    AId,
    MeId,
    ULId,
    ObjectID,
}

pub mod db {
    use super::*;
    #[derive(Debug, PartialEq, Deserialize)]
    #[serde(rename = "camelCase")]
    pub struct DbConfig {
        pub host: String,
        pub port: Port,
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

pub mod redis {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    #[serde(rename = "camelCase")]
    pub struct RedisConfig {
        pub host: String,
        pub port: Port,
        #[serde(default = "ip_family_fn")]
        pub family: IpFamily,
        #[serde(default)]
        pub pass: Option<String>,
        #[serde(default)]
        pub prefix: Option<String>,
        #[serde(default)]
        pub db: Option<i32>,
    }
}

pub mod sonic {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct SonicConfig {
        pub host: Host,
        pub port: Port,
        pub auth: String,
        pub collection: String,
        pub bucket: Option<String>,
    }
}

pub mod elasticsearch {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct ElasticsearchConfig {
        pub host: Host,
        pub port: Port,
        #[serde(default)]
        pub ssl: bool,
        pub user: Option<String>,
        pub pass: Option<String>,
    }
}

pub mod syslog {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct SyslogConfig {}
}


fn true_fn() -> bool {
    true
}

fn ip_family_fn() -> IpFamily {
    IpFamily::Both
}
