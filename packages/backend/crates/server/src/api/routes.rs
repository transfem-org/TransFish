use axum::{routing::get, Router};

pub fn routes() -> Router {
    Router::new().route("/", get(|| async { "Hello world!" }))
}
