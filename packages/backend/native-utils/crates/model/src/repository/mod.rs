pub mod antenna;

use async_trait::async_trait;
use schemars::JsonSchema;

use crate::error::Error;

#[async_trait]
trait Repository<T: JsonSchema> {
    async fn pack(self) -> Result<T, Error>;
}
