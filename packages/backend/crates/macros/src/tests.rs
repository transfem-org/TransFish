#![macro_use]

#[macro_export]
macro_rules! setup_test_config {
    () => {
        #[cfg(test)]
        config::init_config(Path::new(
            &env::var("CK_TEST_CONFIG").expect("CK_TEST_CONFIG environment variable not set"),
        )).expect("Could not initialize test config");
    }
}
