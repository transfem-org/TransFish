pub mod error;

use sea_orm::{Database, DatabaseConnection};

use crate::error::Error;

static DB_CONN: once_cell::sync::OnceCell<DatabaseConnection> = once_cell::sync::OnceCell::new();

#[cfg(feature = "mock")]
static DB_MOCK: once_cell::sync::Lazy<DatabaseConnection> = once_cell::sync::Lazy::new(|| {
    sea_orm::MockDatabase::new(sea_orm::DatabaseBackend::Postgres).into_connection()
});

pub async fn init_database(connection_uri: impl Into<String>) -> Result<(), Error> {
    let conn = Database::connect(connection_uri.into()).await?;
    DB_CONN.get_or_init(move || conn);
    Ok(())
}

pub fn get_database() -> Result<&'static DatabaseConnection, Error> {
    #[cfg(feature = "mock")]
    return Ok(&DB_MOCK);
    #[cfg(not(feature = "mock"))]
    DB_CONN.get().ok_or(Error::Uninitialized)
}

#[cfg(test)]
mod tests {
    use super::get_database;
    use crate::{error::Error, init_database};

    #[test]
    fn error_uninitialized() {
        assert_eq!(get_database().unwrap_err(), Error::Uninitialized);
    }

    #[tokio::test]
    async fn connect_in_memory_sqlite() -> Result<(), Error> {
        init_database("sqlite::memory:").await?;
        get_database()?;
        Ok(())
    }
}
