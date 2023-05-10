use std::fmt::Display;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

use data::env::Environment;
use once_cell::sync::OnceCell;

mod data;

pub use data::*;

// Config Errors
#[derive(Debug)]
pub enum Error {
    Uninitialized,
    Deserialize(serde_yaml::Error),
    FileError(io::Error),
}

macro_rules! generate_error_impl {
    ($t:ident, $o:ty) => {
        impl From<$o> for Error {
            fn from(value: $o) -> Self {
                Self::$t(value)
            }
        }
    };
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use Error::*;

        f.write_str(&{
            match self {
                Uninitialized => {
                    format!("The configuration has not been initialized yet: {:?}", self)
                }
                Deserialize(e) => format!("Error when parsing config file: {}", e),
                FileError(e) => format!("Error when reading config file: {}", e),
            }
        })
    }
}

generate_error_impl!(FileError, io::Error);
generate_error_impl!(Deserialize, serde_yaml::Error);

impl std::error::Error for Error {}

// Functions
fn fetch_config(path: &Path) -> Result<Config, Error> {
    let mut buf = String::new();
    File::open(path)?.read_to_string(&mut buf)?;

    Ok(serde_yaml::from_str(&buf)?)
}

static CONFIG: OnceCell<Config> = OnceCell::new();

pub fn init_config(cfg_path: &Path) -> Result<(), Error> {
    let mut config = fetch_config(cfg_path)?;
    config.env = Environment {};

    CONFIG.get_or_init(move || config);
    Ok(())
}

pub fn get_config() -> Result<&'static Config, Error> {
    CONFIG.get().ok_or(Error::Uninitialized)
}

#[cfg(test)]
mod tests {
    use std::{
        fs::{remove_file, File},
        io::Write,
        path::PathBuf,
    };

    use super::*;

    #[test]
    fn errors_on_invalid_path() {
        assert!(init_config(Path::new("./invalid/path/does/not/exist")).is_err());
    }

    #[test]
    fn parses_test_config() {
        struct Guard(PathBuf);

        impl Drop for Guard {
            fn drop(&mut self) {
                println!("removing temp file...");
                match remove_file(&self.0) {
                    Ok(_) => println!("Successfully removed file"),
                    Err(e) => println!("Could not remove file: {}", e),
                }
            }
        }

        // setup test temp config
        let mut temp_file = std::env::temp_dir();
        temp_file.push(Path::new("calckey.test.config"));

        let err = File::create(&temp_file).unwrap().write_all(
            br"
url: https://example.tld/
port: 3000
db:
  host: localhost
  port: 5432
  db: calckey
  user: example-calckey-user
  pass: example-calckey-pass
redis:
  host: localhost
  port: 6379
",
        );

        let _g = Guard(temp_file.clone());

        err.unwrap();

        let config = fetch_config(temp_file.as_path()).unwrap();

        assert_eq!(
            config,
            Config {
                url: Host(Some("https".into()), "example.tld".into()),
                port: 3000,
                db: db::DbConfig {
                    host: Host(None, "localhost".into()),
                    port: 5432,
                    db: String::from("calckey"),
                    user: String::from("example-calckey-user"),
                    pass: String::from("example-calckey-pass"),
                    disable_cache: true,
                    extra: db::Extra { ssl: true }
                },
                repository_url: None,
                feedback_url: None,
                redis: redis::RedisConfig {
                    host: Host(None, "localhost".into()),
                    port: 6379,
                    family: IpFamily::Both,
                    pass: None,
                    prefix: None,
                    db: 0,
                },
                max_note_length: MaxNoteLength(3000),
                max_caption_length: MaxCommentLength(1500),
                cluster_limit: None,
                env: Environment {  },
            }
        );
    }
}
