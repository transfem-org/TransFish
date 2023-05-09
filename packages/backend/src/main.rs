
use std::{path::Path, error::Error};

#[cfg(debug_assertions)]
extern crate config;

fn main() -> Result<(), Box<dyn Error>> {
    // bootstrap

    // ENV

    // get config

    config::init_config(Path::new(""))?;

    Ok(())
}
