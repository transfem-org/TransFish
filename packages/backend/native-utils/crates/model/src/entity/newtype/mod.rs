mod macros;

use derive_more::From;
use schemars::JsonSchema;
use sea_orm::{sea_query, DbErr, QueryResult, TryGetError, TryGetable, Value};
use serde::{Deserialize, Serialize};

use crate::impl_json_newtype;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, JsonSchema, From)]
pub struct Keyword(pub Vec<Vec<String>>);
impl_json_newtype!(Keyword);

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, JsonSchema, From)]

pub struct StringVec(pub Vec<String>);
impl_json_newtype!(StringVec);
