use std::{
    env, fmt,
    path::{Path, PathBuf},
};
use tracing::debug;

#[macro_use]
extern crate macros;

fn main() -> anyhow::Result<()> {
    env::set_var(
        "CK_REPO_DIR",
        PathBuf::from(env!("PWD"))
            .parent()
            .and_then(|p| p.parent())
            .ok_or(fmt::Error)?,
    );

    // logging
    let is_debug = match env::var_os("NODE_ENV") {
        None => true,
        Some(val) => val != "production",
    };
    let subscriber = tracing_subscriber::fmt();
    if is_debug {
        subscriber
            .with_max_level(tracing::Level::DEBUG)
            .pretty()
            .init();
    } else {
        subscriber.with_max_level(tracing::Level::INFO).init();
    }

    // bootstrap

    // ENV

    // get config

    let config_path = &Path::new(&env::var("CK_REPO_DIR")?)
        .join(".config")
        .join("default.yml");
    debug!(target: "config", path = ?config_path, "Loading yaml file");
    config::init_config(config_path)?;

    eprintln!("{:?}", config::get_config()?);

    server::init()?;

    Ok(())
}
