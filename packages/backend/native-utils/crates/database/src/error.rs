use sea_orm::error::DbErr;

#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum Error {
    #[error("The database connections have not been initialized yet")]
    Uninitialized,
    #[error("ORM error: {0}")]
    OrmError(#[from] DbErr),
}
