use napi::bindgen_prelude::*;
use napi_derive::napi;
use parse_display::FromStr;
use schemars::JsonSchema;
use utoipa::ToSchema;

use crate::model::entity::antenna::Model;
use crate::model::repository::Repository;

#[napi]
#[derive(Clone, Debug, PartialEq, Eq, JsonSchema, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Antenna {
    pub id: String,
    pub created_at: String,
    pub name: String,
    pub keywords: Vec<Vec<String>>,
    pub exclude_keywords: Vec<Vec<String>>,
    #[schema(inline)]
    pub src: AntennaSrc,
    pub user_list_id: Option<String>,
    pub user_group_id: Option<String>,
    pub users: Vec<String>,
    pub instances: Vec<String>,
    #[serde(default)]
    pub case_sensitive: bool,
    #[serde(default)]
    pub notify: bool,
    #[serde(default)]
    pub with_replies: bool,
    #[serde(default)]
    pub with_file: bool,
    #[serde(default)]
    pub has_unread_note: bool,
}

#[napi]
#[derive(Debug, FromStr, PartialEq, Eq, JsonSchema, ToSchema)]
#[serde(rename_all = "camelCase")]
#[display(style = "camelCase")]
#[display("'{}'")]
pub enum AntennaSrc {
    Home,
    All,
    Users,
    List,
    Group,
    Instances,
}

#[napi]
impl Antenna {
    #[napi]
    pub async fn pack_by_id(id: String) -> napi::Result<Antenna> {
        Model::pack_by_id(id).await.map_err(Into::into)
    }
}
