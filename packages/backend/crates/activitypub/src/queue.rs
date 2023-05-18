//! Used to queue sending activity

use crate::{
    error::Error,
    federation::{
        config::Data,
        http_signature::sign_request,
        reqwest_shim::ResponseExt,
        traits::{ActivityHandler, LocalActor},
        FEDERATION_CONTENT_TYPE,
    },
};
use anyhow::anyhow;
use async_trait::async_trait;
use dyn_clone::{clone_trait_object, DynClone};
use http::{header::HeaderName, HeaderMap, HeaderValue};
use httpdate::fmt_http_date;
use itertools::Itertools;
use reqwest_middleware::ClientWithMiddleware;
use serde::{Deserialize, Serialize};
use std::{
    fmt::Debug,
    time::{Duration, SystemTime},
};
use tracing::{debug, info, warn};
use url::Url;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SendActivityTask {
    actor_id: Url,
    activity_id: Url,
    activity: String,
    inbox: Url,
    private_key: String,
    http_signature_compat: bool,
}

#[async_trait]
pub trait QueueManager: DynClone + Send {
    /// Called in [crate::queue::send_activity], and would call
    /// [crate::queue::do_send] inside to send activity to remote servers.
    async fn queue_deliver(&self, task: SendActivityTask) -> Result<(), Error>;
}

clone_trait_object!(QueueManager);

/// Send a new activity to the given inboxes
///
/// - `activity`: The activity to be sent, gets converted to json
/// - `private_key`: Private key belonging to the actor who sends the activity, for signing HTTP
///                  signature. Generated with [crate::http_signatures::generate_actor_keypair].
/// - `inboxes`: List of actor inboxes that should receive the activity. Should be built by calling
///              [crate::federation::traits::Actor::shared_inbox_or_inbox] for each target actor.
pub async fn send_activity<Activity, Datatype, ActorType>(
    activity: Activity,
    actor: &ActorType,
    inboxes: Vec<Url>,
    data: &Data<Datatype>,
) -> Result<(), Error>
where
    Activity: ActivityHandler + Serialize,
    Datatype: Clone,
    ActorType: LocalActor,
{
    let config = &data.config;
    let actor_id = activity.actor();
    let activity_id = activity.id();
    let activity_serialized = serde_json::to_string_pretty(&activity)?;
    let private_key = actor.private_key_pem();
    let inboxes: Vec<Url> = inboxes
        .into_iter()
        .unique()
        .filter(|i| !config.is_local_url(i))
        .collect();

    for inbox in inboxes {
        if config.verify_url_valid(&inbox).await.is_err() {
            continue;
        }

        let message = SendActivityTask {
            actor_id: actor_id.clone(),
            activity_id: activity_id.clone(),
            inbox,
            activity: activity_serialized.clone(),
            private_key: private_key.to_string(),
            http_signature_compat: config.http_signature_compat,
        };
        if config.debug {
            let res = do_send(message, &config.client, config.request_timeout).await;
            // Don't fail on error, as we intentionally do some invalid actions in tests, to verify that
            // they are rejected on the receiving side. These errors shouldn't bubble up to make the API
            // call fail. This matches the behaviour in production.
            if let Err(e) = res {
                warn!("{}", e);
            }
        } else {
            debug!(task = ?message, "Queue sending activity");
            data.config.queue_manager.queue_deliver(message).await?;
        }
    }

    Ok(())
}

async fn do_send(
    task: SendActivityTask,
    client: &ClientWithMiddleware,
    timeout: Duration,
) -> Result<(), anyhow::Error> {
    debug!("Sending {} to {}", task.activity_id, task.inbox);
    let request_builder = client
        .post(task.inbox.to_string())
        .timeout(timeout)
        .headers(generate_request_headers(&task.inbox));
    let request = sign_request(
        request_builder,
        task.actor_id,
        task.activity,
        task.private_key,
        task.http_signature_compat,
    )
    .await?;
    let response = client.execute(request).await;

    match response {
        Ok(o) if o.status().is_success() => {
            info!(
                "Activity {} delivered successfully to {}",
                task.activity_id, task.inbox
            );
            Ok(())
        }
        Ok(o) if o.status().is_client_error() => {
            let text = o.text_limited().await.map_err(Error::other)?;
            info!(
                "Activity {} was rejected by {}, aborting: {}",
                task.activity_id, task.inbox, text,
            );
            Ok(())
        }
        Ok(o) => {
            let status = o.status();
            let text = o.text_limited().await.map_err(Error::other)?;
            Err(anyhow!(
                "Queueing activity {} to {} for retry after failure with status {}: {}",
                task.activity_id,
                task.inbox,
                status,
                text,
            ))
        }
        Err(e) => {
            info!(
                "Unable to connect to {}, aborting task {}: {}",
                task.inbox, task.activity_id, e
            );
            Ok(())
        }
    }
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
