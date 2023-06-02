use napi::bindgen_prelude::{FromNapiValue, ToNapiValue};
use napi_derive::napi;
use parse_display::FromStr;
use schemars::JsonSchema;
use utoipa::ToSchema;

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
