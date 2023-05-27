use jsonschema::JSONSchema;
use once_cell::sync::Lazy;
use schemars::JsonSchema;
use utoipa::ToSchema;

use super::Schema;

#[derive(Clone, Debug, PartialEq, Eq, JsonSchema, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct App {
    pub id: String,
    pub name: String,
    #[schemars(url)]
    pub callback_url: Option<String>,
    #[schema(inline)]
    pub permission: Vec<Permission>,
    pub secret: Option<String>,
    pub is_authorized: Option<bool>,
}

/// This represents `permissions` in `packages/calckey-js/src/consts.ts`.
#[derive(Clone, Debug, PartialEq, Eq, JsonSchema, ToSchema)]
pub enum Permission {
    #[serde(rename = "read:account")]
    ReadAccount,
    #[serde(rename = "write:account")]
    WriteAccount,
    #[serde(rename = "read:blocks")]
    ReadBlocks,
    #[serde(rename = "write:blocks")]
    WriteBlocks,
    #[serde(rename = "read:drive")]
    ReadDrive,
    #[serde(rename = "write:drive")]
    WriteDrive,
    #[serde(rename = "read:favorites")]
    ReadFavorites,
    #[serde(rename = "write:favorites")]
    WriteFavorites,
    #[serde(rename = "read:following")]
    ReadFollowing,
    #[serde(rename = "write:following")]
    WriteFollowing,
    #[serde(rename = "read:messaging")]
    ReadMessaging,
    #[serde(rename = "write:messaging")]
    WriteMessaging,
    #[serde(rename = "read:mutes")]
    ReadMutes,
    #[serde(rename = "write:mutes")]
    WriteMutes,
    #[serde(rename = "read:notes")]
    ReadNotes,
    #[serde(rename = "write:notes")]
    WriteNotes,
    #[serde(rename = "read:notifications")]
    ReadNotifications,
    #[serde(rename = "write:notifications")]
    WriteNotifications,
    #[serde(rename = "read:reactions")]
    ReadReactions,
    #[serde(rename = "write:reactions")]
    WriteReactions,
    #[serde(rename = "write:votes")]
    WriteVotes,
    #[serde(rename = "read:pages")]
    ReadPages,
    #[serde(rename = "write:pages")]
    WritePages,
    #[serde(rename = "read:page-likes")]
    ReadPageLikes,
    #[serde(rename = "write:page-likes")]
    WritePageLikes,
    #[serde(rename = "read:user-groups")]
    ReadUserGroups,
    #[serde(rename = "write:user-groups")]
    WriteUserGroups,
    #[serde(rename = "read:channels")]
    ReadChannels,
    #[serde(rename = "write:channels")]
    WriteChannels,
    #[serde(rename = "read:gallery")]
    ReadGallery,
    #[serde(rename = "write:gallery")]
    WriteGallery,
    #[serde(rename = "read:gallery-likes")]
    ReadGalleryLikes,
    #[serde(rename = "write:gallery-likes")]
    WriteGalleryLikes,
}

impl Schema<Self> for App {}

pub static VALIDATOR: Lazy<JSONSchema> = Lazy::new(|| App::validator());

#[cfg(test)]
mod unit_test {
    #[test]
    fn valid() {
        todo!();
    }

    #[test]
    fn invalid() {
        todo!();
    }
}
