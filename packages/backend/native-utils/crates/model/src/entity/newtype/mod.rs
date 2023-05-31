mod macros;

use cfg_if::cfg_if;
use derive_more::{From, Into};
use sea_orm::{sea_query, DbErr, QueryResult, TryGetError, TryGetable, Value};
use serde::{Deserialize, Serialize};

use crate::impl_json_newtype;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, From, Into)]
pub struct JsonKeyword(pub Vec<Vec<String>>);
impl_json_newtype!(JsonKeyword);

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, From, Into)]
pub struct JsonStringVec(pub Vec<String>);
impl_json_newtype!(JsonStringVec);

cfg_if! {
    if #[cfg(feature = "compat")] {
        pub type StringVec = Vec<String>;
    } else {
        pub type StringVec = JsonStringVec;
    }
}
