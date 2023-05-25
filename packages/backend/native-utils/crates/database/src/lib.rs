pub mod error;

use once_cell::sync::{Lazy, OnceCell};
use sea_orm::{Database, DatabaseBackend, DatabaseConnection, MockDatabase};

use crate::error::Error;

static DB_CONN: OnceCell<DatabaseConnection> = OnceCell::new();
static DB_MOCK: Lazy<DatabaseConnection> =
    Lazy::new(|| MockDatabase::new(DatabaseBackend::Postgres).into_connection());

pub async fn init_database(connection_uri: impl Into<String>) -> Result<(), Error> {
    let conn = Database::connect(connection_uri.into()).await?;
    DB_CONN.get_or_init(move || conn);
    Ok(())
}

pub fn get_database() -> Result<&'static DatabaseConnection, Error> {
    if cfg!(test) {
        Ok(&DB_MOCK)
    } else {
        DB_CONN.get().ok_or(Error::Uninitialized)
    }
}

#[cfg(test)]
mod tests {
    use super::get_database;

    #[test]
    fn can_get_mock() {
        get_database().unwrap().as_mock_connection();
    }
}
