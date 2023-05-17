use std::{
    env, fmt,
    path::{Path, PathBuf}, io::stdout,
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
    let subscriber = logging::Logger::new(if is_release!() {
        tracing::Level::INFO
    } else {
        tracing::Level::DEBUG
    }, stdout());

    tracing::subscriber::set_global_default(subscriber)?;

    // bootstrap

    // ENV

    // get config

    let config_path = &Path::new(&env::var("CK_REPO_DIR")?)
        .join(".config")
        .join("default.yml");
    debug!(target: "config", path = ?config_path, "Loading yaml file");
    config::init_config(config_path)?;

    debug!(config_file = ?config::get_config());

    server::init()?;

    Ok(())
}
