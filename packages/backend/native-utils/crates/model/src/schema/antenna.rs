use jsonschema::JSONSchema;
use once_cell::sync::Lazy;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use super::Schema;

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Antenna {
    pub id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub name: String,
    pub keywords: Vec<Vec<String>>,
    pub exclude_keywords: Vec<Vec<String>>,
    #[schema(inline)]
    pub src: AntennaSrcEnum,
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

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum AntennaSrcEnum {
    Home,
    All,
    Users,
    List,
    Group,
    Instances,
}

impl Schema<Self> for Antenna {}

pub static VALIDATOR: Lazy<JSONSchema> = Lazy::new(|| Antenna::validator());

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::VALIDATOR;

    #[test]
    fn valid() {
        let instance = json!({
            "id": "9f4x0bkx1u",
            "createdAt": "2023-05-24T06:56:14.323Z",
            "name": "Valid Antenna",
            "keywords": [["first", "keyword"], ["second"]],
            "excludeKeywords": [["excluding", "keywrods"], ["from", "antenna"]],
            "src": "users",
            // "userListId" and "userGroupId" can be null or be omitted
            "userListId": null,
            "users": ["9f4yjw6m13", "9f4yk2cp6d"],
            "instances": [],
            // "caseSensitive", "notify", "withReplies", "withFile", and
            // "hasUnreadNote" are false if ommited
            "notify": false,
            "withReplies": false,
            "withFile": false,
            "hasUnreadNote": false,
        });

        assert!(VALIDATOR.is_valid(&instance));
    }

    #[test]
    fn invalid() {
        let instance = json!({
            // "id" is required
            "id": null,
            // trailing "Z" is missing
            "createdAt": "2023-05-24T07:36:34.389",
            // "name" is required
            // "keywords" must be an array
            "keywords": "invalid keyword",
            // "excludeKeywords" is required
            "excludeKeywords": null,
            // "src" should be one of "home", "all", "users", "list", "group", and
            // "instances"
            "src": "invalid_src",
            // "userListId" is string
            "userListId": ["9f4ziiqfxw"],
            // "users" must be an array of strings
            "users": [1, "9f4ykyuza6"],
            "instances": ["9f4ykyuybo"],
            // "caseSensitive" is boolean
            "caseSensitive": 0,
            "notify": true,
            "withReplies": true,
            "withFile": true,
            "hasUnreadNote": true,
        });

        let result = VALIDATOR
            .validate(&instance)
            .expect_err("validation must fail");
        let mut paths: Vec<String> = result.map(|e| e.schema_path.to_string()).collect();
        paths.sort();
        assert_eq!(
            paths,
            vec![
                "/properties/caseSensitive/type",
                "/properties/createdAt/format",
                "/properties/excludeKeywords/type",
                "/properties/id/type",
                "/properties/keywords/type",
                "/properties/src/enum",
                "/properties/userListId/type",
                "/properties/users/items/type",
                "/required"
            ]
        );
    }
}
