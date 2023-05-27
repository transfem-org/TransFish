pub mod error;

use sea_orm::{Database, DatabaseConnection};

use crate::error::Error;

static DB_CONN: once_cell::sync::OnceCell<DatabaseConnection> = once_cell::sync::OnceCell::new();

pub async fn init_database(connection_uri: impl Into<String>) -> Result<(), Error> {
    let conn = Database::connect(connection_uri.into()).await?;
    DB_CONN.get_or_init(move || conn);
    Ok(())
}

pub fn get_database() -> Result<&'static DatabaseConnection, Error> {
    DB_CONN.get().ok_or(Error::Uninitialized)
}

#[cfg(test)]
mod unit_test {
    use super::get_database;
    use crate::error::Error;

    #[test]
    fn error_uninitialized() {
        assert_eq!(get_database().unwrap_err(), Error::Uninitialized);
    }
}
