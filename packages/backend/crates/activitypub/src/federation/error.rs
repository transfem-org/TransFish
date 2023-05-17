// GNU Affero General Public License v3.0
// https://github.com/LemmyNet/activitypub-federation-rust

//! Error messages returned by this library

use displaydoc::Display;

/// Error messages returned by this library
#[derive(thiserror::Error, Debug, Display)]
pub enum Error {
    /// Requested object was not found in local database
    NotFound,
    /// Request limit was reached during fetch
    RequestLimit,
    /// Response body limit was reached during fetch
    ResponseBodyLimit,
    /// Object to be fetched was deleted
    ObjectDeleted,
    /// Url in object was invalid: {0}
    UrlVerificationError(&'static str),
    /// Incoming activity has invalid digest for body
    ActivityBodyDigestInvalid,
    /// Incoming activity has invalid signature
    ActivitySignatureInvalid,
    /// Failed to resolve actor via webfinger
    WebfingerResolveFailed,
    /// Other errors which are not explicitly handled
    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

impl Error {
    pub fn other<T>(error: T) -> Self
    where
        T: Into<anyhow::Error>,
    {
        Error::Other(error.into())
    }
}

impl PartialEq for Error {
    fn eq(&self, other: &Self) -> bool {
        std::mem::discriminant(self) == std::mem::discriminant(other)
    }
}
