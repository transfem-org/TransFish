use axum::Router;

use config::get_config;
use tokio::runtime;

use tracing::info;

pub mod api {
    pub mod routes;
}

pub enum Error {}

pub fn init() -> anyhow::Result<()> {
    // initialize tokio runtime
    info!("Initializing tokio runtime");
    let mut rt = runtime::Builder::new_multi_thread();

    let rt = rt.enable_all();

    if let Some(n) = get_config()?.cluster_limit {
        rt.worker_threads(n);
    }

    let rt = rt.build()?;

    let app = Router::new().nest("/api", api::routes::routes());

    type Result = anyhow::Result<()>;

    rt.block_on(async {
        axum::Server::bind(&format!("127.0.0.1:{}", get_config()?.port).parse()?)
            .serve(app.into_make_service())
            .await?;
        Result::Ok(())
    })?;

    Ok(())
}

#[cfg(test)]
mod tests {

    //    #[test]
    //    fn test() {
    //            macros::setup_test_config!();
    //    }
}
