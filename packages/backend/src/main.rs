use std::{
    env, error, fmt,
    path::{Path, PathBuf},
};

extern crate config;

fn main() -> Result<(), Box<dyn error::Error>> {
    env::set_var(
        "CK_REPO_DIR",
        PathBuf::from(env!("PWD"))
            .parent()
            .and_then(|p| p.parent())
            .ok_or(fmt::Error)?,
    );
    // bootstrap

    // ENV

    // get config

    config::init_config(
        &Path::new(&env::var("CK_REPO_DIR")?)
            .join(".config")
            .join("default.yml"),
    )?;

    println!("{:?}", config::get_config()?);
    Ok(())
}
