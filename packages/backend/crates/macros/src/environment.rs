#![macro_use]

use std::env;

use lazy_static::lazy_static;

#[derive(PartialEq)]
pub enum EnvType {
    Release,
    Debug,
    Test,
}

lazy_static! {
    pub static ref NODE_ENV: EnvType = init_env_type();
}

#[macro_export]
macro_rules! node_env {
    () => {
        *macros::environment::NODE_ENV
    };
}

#[macro_export]
macro_rules! is_debug {
    () => {
        macros::node_env!() == macros::environment::EnvType::Debug
    };
}

#[macro_export]
macro_rules! is_release {
    () => {
        macros::node_env!() == macros::environment::EnvType::Release
    };
}

#[macro_export]
macro_rules! is_test {
    () => {
        macros::node_env!() == macros::environment::EnvType::Test
    };
}

fn init_env_type() -> EnvType {
    use EnvType::*;
    match env::var("NODE_ENV") {
        Ok(s) if s == *"production" => Release,
        Ok(s) if s == *"development" => Debug,
        Ok(s) if s == *"test" => Test,
        _ => Debug,
    }
}
