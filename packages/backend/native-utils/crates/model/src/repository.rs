pub mod antenna;

use async_trait::async_trait;
use schemars::JsonSchema;

use crate::error::Error;

#[async_trait]
pub trait Repository<T: JsonSchema> {
    async fn pack(self) -> Result<T, Error>;
    async fn pack_by_id(id: String) -> Result<T, Error>;
}

mod macros {
    macro_rules! impl_pack_by_id {
        ($a:ty, $b:ident) => {
            match <$a>::find_by_id($b).one(database::get_database()?).await? {
                None => Err(Error::NotFound),
                Some(m) => m.pack().await,
            }
        };
    }

    pub(crate) use impl_pack_by_id;
}
