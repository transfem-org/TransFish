pub mod error;

use error::Error;
use sea_orm::{Database, DbConn};

static DB_CONN: once_cell::sync::OnceCell<DbConn> = once_cell::sync::OnceCell::new();

pub async fn init_database(connection_uri: impl Into<String>) -> Result<(), Error> {
    let conn = Database::connect(connection_uri.into()).await?;
    DB_CONN.get_or_init(move || conn);
    Ok(())
}

pub fn get_database() -> Result<&'static DbConn, Error> {
    DB_CONN.get().ok_or(Error::Uninitialized)
}

#[cfg(test)]
mod unit_test {
    use super::{error::Error, get_database};

    #[test]
    fn error_uninitialized() {
        assert_eq!(get_database().unwrap_err(), Error::Uninitialized);
    }
}
