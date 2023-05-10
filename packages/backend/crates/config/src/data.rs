use serde::Deserialize;

type Port = u16;

#[derive(Debug, PartialEq, Deserialize)]
pub struct MaxNoteLength(pub u16);

#[derive(Debug, PartialEq, Deserialize)]
pub struct MaxCommentLength(pub u16);

#[derive(Debug, PartialEq)]
pub enum IpFamily {
    Both,
    IPv4,
    IPv6,
}

impl<'de> Deserialize<'de> for IpFamily {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct IpFamilyVisitor;

        use serde::de::Visitor;
        impl<'de> Visitor<'de> for IpFamilyVisitor {
            type Value = IpFamily;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("One of `4` `6` `0`")
            }

            fn visit_u8<E>(self, v: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                {
                    match v {
                        0 => Ok(IpFamily::Both),
                        4 => Ok(IpFamily::IPv4),
                        6 => Ok(IpFamily::IPv6),
                        _ => Err(E::unknown_variant(&v.to_string(), &["0", "4", "6"])),
                    }
                }
            }
        }

        deserializer.deserialize_u8(IpFamilyVisitor)
    }
}

impl Default for IpFamily {
    fn default() -> Self {
        Self::Both
    }
}

impl<'de> Deserialize<'de> for Host {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct HostVisitor;

        use serde::de::Visitor;
        impl<'de> Visitor<'de> for HostVisitor {
            type Value = Host;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("(proto://)host(.tld)(/)")
            }

            fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                let components: Vec<&str> = v.split("://").collect();

                match components.len() {
                    1 => Ok(Host(None, components[0].into())),
                    2 => Ok(Host(
                        Some(components[0].into()),
                        components[1].trim_end_matches('/').into(),
                    )),
                    _ => Err(E::custom(format!("Invalid url: {}", v))), // FIXME: more descriptive
                                                                        // error message
                }
            }
        }
        deserializer.deserialize_str(HostVisitor)
    }
}

#[derive(Debug, PartialEq, Default)]
// TODO: Convert to uri later and maybe some more enums
pub struct Host(pub Option<String>, pub String);

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "camelCase")]
pub struct Config {
    pub repository_url: Option<String>,
    pub feedback_url: Option<String>,
    pub url: Host,
    pub port: Port,
    pub db: db::DbConfig,
    pub redis: redis::RedisConfig,
    //    pub sonic: sonic::SonicConfig,
    //    pub elasticsearch: elasticsearch::ElasticsearchConfig,
    //    pub id: IdGenerator,
    #[serde(default)]
    pub max_note_length: MaxNoteLength,
    #[serde(default)]
    pub max_caption_length: MaxCommentLength,
    //    pub disable_hsts: bool,
    pub cluster_limit: Option<u16>,
    //    pub deliver_job_concurrency: u16,
    //    pub inbox_job_concurrency: u16,
    //    pub deliver_job_per_sec: u16,
    //    pub inbox_job_per_sec: u16,
    //    pub deliver_job_max_attempts: u16,
    //    pub inbox_job_max_attempts: u16,
    //    pub outgoing_address_family: IpFamily,
    //    pub syslog: syslog::SyslogConfig,
    //    pub proxy: Option<Host>,
    //    pub proxy_smtp: Option<Host>,
    //    pub proxy_bypass_hosts: Vec<Host>,
    //    pub allowed_private_networks: Vec<Host>,
    //    pub max_file_size: Option<u32>,
    //    pub media_proxy: Option<String>,
    //    pub proxy_remote_files: bool,
    //    pub twa: Option<twa::TWAConfig>,
    //    pub reserved_usernames: Vec<String>,
    //    pub max_user_signups: Option<u32>,
    //    pub is_managed_hosting: bool,
    //    pub deepl: Option<deepl::DeepLConfig>,
    //    pub libre_translate: Option<libre_translate::LibreTranslateConfig>,
    //    pub email: Option<email::Email>,
    //    pub object_storage: Option<object_storage::ObjectStorageConfig>,
    //    pub summaly_proxy_url: Option<Host>,
    #[serde(skip)]
    pub env: env::Environment,
}

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename = "lowercase")]
pub enum IdGenerator {
    AId,
    MeId,
    ULId,
    ObjectID,
}

/// database config
pub mod db {
    use super::*;
    #[derive(Debug, PartialEq, Deserialize)]
    #[serde(rename = "camelCase")]
    pub struct DbConfig {
        pub host: Host,
        pub port: Port,
        pub db: String,
        pub user: String,
        pub pass: String,
        #[serde(default = "true_fn")]
        pub disable_cache: bool,
        #[serde(default)]
        pub extra: Extra,
    }

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct Extra {
        #[serde(default = "true_fn")]
        pub ssl: bool,
    }

    impl Default for Extra {
        fn default() -> Self {
            Self { ssl: true }
        }
    }
}

/// redis config
pub mod redis {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    #[serde(rename = "camelCase")]
    pub struct RedisConfig {
        pub host: Host,
        pub port: Port,
        #[serde(default)]
        pub family: IpFamily,
        pub pass: Option<String>,
        pub prefix: Option<String>,
        #[serde(default)]
        pub db: u8,
    }
}

/// sonic search config
pub mod sonic {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct SonicConfig {
        pub host: Host,
        pub port: Port,
        #[serde(default)]
        pub auth: Option<String>,
        #[serde(default)]
        pub collection: Option<String>,
        #[serde(default)]
        pub bucket: Option<String>,
    }
}

/// elasticsearch config
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
        pub index: Option<String>,
    }
}

/// syslog configuration
pub mod syslog {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct SyslogConfig {
        host: Host,
        port: Port,
    }
}

/// TWA configuration
pub mod twa {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize)]
    pub struct TWAConfig {}
}

/// Environment variables set when initialized
pub mod env {
    use super::*;

    #[derive(Debug, PartialEq, Deserialize, Default)]
    pub struct Environment {}
}

impl Default for MaxNoteLength {
    fn default() -> Self {
        Self(3000)
    }
}

impl Default for MaxCommentLength {
    fn default() -> Self {
        Self(1500)
    }
}

fn true_fn() -> bool {
    true
}
