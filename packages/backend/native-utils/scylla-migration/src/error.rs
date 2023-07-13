use scylla::{
    cql_to_rust::FromRowError,
    transport::{
        errors::{NewSessionError, QueryError},
        query_result::SingleRowTypedError,
    },
};
use std::io;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Session error: {0}")]
    Session(#[from] NewSessionError),
    #[error("Query error: {0}")]
    Query(#[from] QueryError),
    #[error("Conversion error: {0}")]
    Conversion(#[from] FromRowError),
    #[error("Row error: {0}")]
    Row(#[from] SingleRowTypedError),
    #[error("File error: {0}")]
    File(#[from] io::Error),
}
