#![macro_use]

#[macro_export]
macro_rules! setup_test_config {
    () => {
        #[cfg(test)]
        {
            let path = std::env::var("CK_TEST_CONFIG")
                .expect("CK_TEST_CONFIG environment variable not set");
            let path = std::path::Path::new(&path);

            config::init_config(&path).expect("Could not initialize test config");
        }
    };
}

#[cfg(test)]
#[allow(clippy::module_inception)]
mod tests {
    #[test]
    fn can_parse_test_config() {
        setup_test_config!();
    }
}
