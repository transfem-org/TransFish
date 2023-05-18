pub(crate) mod config;
pub(crate) mod fetch;
pub(crate) mod http_signature;
pub(crate) mod protocol;
pub(crate) mod reqwest_shim;
pub(crate) mod traits;

/// Mime type for Activitypub data, used for `Accept` and `Content-Type` HTTP headers
pub(crate) static FEDERATION_CONTENT_TYPE: &str = "application/activity+json";
