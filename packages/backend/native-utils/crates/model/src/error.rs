#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum Error {
    #[error("Failed to parse string")]
    ParseError(#[from] parse_display::ParseError),
    #[error("Failed to get database connection")]
    DbConnError(#[from] database::error::Error),
    #[error("Database operation error: {0}")]
    DbOperationError(#[from] sea_orm::DbErr),
    #[error("Requested entity not found")]
    NotFound,
}
