use serde::Deserialize;

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub scylla: Option<ScyllaConfig>,
}

#[derive(Debug, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScyllaConfig {
    pub nodes: Vec<String>,
    pub keyspace: String,
    pub replication_factor: i32,
}
