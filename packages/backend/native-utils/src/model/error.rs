#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum Error {
    #[error("Failed to parse string")]
    ParseError(#[from] parse_display::ParseError),
    #[error("Failed to get database connection")]
    DbConnError(#[from] crate::database::error::Error),
    #[error("Database operation error: {0}")]
    DbOperationError(#[from] sea_orm::DbErr),
    #[error("Requested entity not found")]
    NotFound,
}

#[cfg(feature = "napi")]
impl Into<napi::Error> for Error {
    fn into(self) -> napi::Error {
        napi::Error::from_reason(self.to_string())
    }
}
