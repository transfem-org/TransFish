pub mod config;
pub mod fetch;
pub mod http_signature;
pub mod protocol;
pub mod reqwest_shim;
pub mod traits;

/// Mime type for Activitypub data, used for `Accept` and `Content-Type` HTTP headers
pub static FEDERATION_CONTENT_TYPE: &str = "application/activity+json";
