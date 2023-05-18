// GNU Affero General Public License v3.0
// https://github.com/LemmyNet/activitypub-federation-rust

//! Utilities for fetching data from other servers

use crate::error::Error;
use crate::federation::{
    config::Data, http_signature::sign_request, reqwest_shim::ResponseExt, traits::LocalActor,
    FEDERATION_CONTENT_TYPE,
};
use http::{HeaderMap, HeaderName, HeaderValue, StatusCode};
use httpdate::fmt_http_date;
use serde::de::DeserializeOwned;
use std::{sync::atomic::Ordering, time::SystemTime};
use tracing::info;
use url::Url;

/// Typed wrapper for collection IDs
pub mod collection_id;
/// Typed wrapper for Activitypub Object ID which helps with dereferencing and caching
pub mod object_id;
/// Resolves identifiers of the form `name@example.com`
pub mod webfinger;

/// Fetch a remote object over HTTP and convert to `Kind`.
///
/// [crate::fetch::object_id::ObjectId::dereference] wraps this function to add caching and
/// conversion to database type. Only use this function directly in exceptional cases where that
/// behaviour is undesired.
///
/// Every time an object is fetched via HTTP, [RequestData.request_counter] is incremented by one.
/// If the value exceeds [FederationSettings.http_fetch_limit], the request is aborted with
/// [Error::RequestLimit]. This prevents denial of service attacks where an attack triggers
/// infinite, recursive fetching of data.
pub async fn fetch_object_http<T: Clone, Kind: DeserializeOwned>(
    url: &Url,
    local_actor: &impl LocalActor,
    data: &Data<T>,
) -> Result<Kind, Error> {
    let config = &data.config;
    // dont fetch local objects this way
    debug_assert!(url.domain() != Some(&config.domain));
    config.verify_url_valid(url).await?;
    info!("Fetching remote object {}", url.to_string());

    let counter = data.request_counter.fetch_add(1, Ordering::SeqCst);
    if counter > config.http_fetch_limit {
        return Err(Error::RequestLimit);
    }

    let req = config
        .client
        .get(url.as_str())
        .header("Accept", FEDERATION_CONTENT_TYPE)
        .timeout(config.request_timeout);

    let signed_req = sign_request(
        req,
        local_actor.federation_id(),
        String::new(),
        LocalActor::private_key_pem(local_actor).to_string(),
        false,
    )
    .await?;

    let res = config
        .client
        .execute(signed_req)
        .await
        .map_err(Error::other)?;

    if res.status() == StatusCode::GONE {
        return Err(Error::ObjectDeleted);
    }

    res.json_limited().await
}

pub(crate) fn generate_request_headers(inbox_url: &Url) -> HeaderMap {
    let mut host = inbox_url.domain().expect("read inbox domain").to_string();
    if let Some(port) = inbox_url.port() {
        host = format!("{}:{}", host, port);
    }

    let mut headers = HeaderMap::new();
    headers.insert(
        HeaderName::from_static("content-type"),
        HeaderValue::from_static(FEDERATION_CONTENT_TYPE),
    );
    headers.insert(
        HeaderName::from_static("host"),
        HeaderValue::from_str(&host).expect("Hostname is valid"),
    );
    headers.insert(
        "date",
        HeaderValue::from_str(&fmt_http_date(SystemTime::now())).expect("Date is valid"),
    );
    headers
}
