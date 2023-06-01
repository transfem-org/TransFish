use model::entity::{
    access_token, antenna, app, emoji, gallery_post, hashtag, messaging_message, meta,
    newtype::{I32Vec, StringVec},
    note, note_edit, page, poll, registry_item, user, user_profile, webhook,
};
use sea_orm_migration::{
    prelude::*,
    sea_orm::{DbBackend, EntityTrait, Statement, TryGetable},
};
use serde_json::json;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Alias::new("reversi_game")).to_owned())
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("reversi_matching"))
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Sqlite {
            return Ok(());
        }

        let db = manager.get_connection();

        macro_rules! copy_data {
            ($data:ident, $ent:ident, $col:tt) => {
                let models: Vec<$ent::ActiveModel> = $data
                    .iter()
                    .map(|(id, r)| $ent::ActiveModel {
                        id: sea_orm::Set(id.to_owned()),
                        $col: sea_orm::Set(StringVec::from(r.to_owned())),
                        ..Default::default()
                    })
                    .collect();
                for model in models {
                    $ent::Entity::update(model).exec(db).await?;
                }
            };
        }

        macro_rules! convert_to_stringvec_json {
            ($table:expr, $id:expr, $col:expr, $ent:ident, $col_name:tt) => {
                let query = select_query($table, $id, $col);
                let res = get_vec::<Vec<String>>(db, query).await?;
                convert_col(manager, $table, $col).await?;
                copy_data!(res, $ent, $col_name);
            };
        }

        convert_to_stringvec_json!(
            AccessToken::Table,
            AccessToken::Id,
            AccessToken::Permission,
            access_token,
            permission
        );
        convert_to_stringvec_json!(Antenna::Table, Antenna::Id, Antenna::Users, antenna, users);
        convert_to_stringvec_json!(App::Table, App::Id, App::Permission, app, permission);
        convert_to_stringvec_json!(Emoji::Table, Emoji::Id, Emoji::Aliases, emoji, aliases);
        convert_to_stringvec_json!(
            GalleryPost::Table,
            GalleryPost::Id,
            GalleryPost::FileIds,
            gallery_post,
            file_ids
        );
        convert_to_stringvec_json!(
            GalleryPost::Table,
            GalleryPost::Id,
            GalleryPost::Tags,
            gallery_post,
            tags
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::MentionedUserIds,
            hashtag,
            mentioned_user_ids
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::MentionedLocalUserIds,
            hashtag,
            mentioned_local_user_ids
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::MentionedRemoteUserIds,
            hashtag,
            mentioned_remote_user_ids
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::AttachedUserIds,
            hashtag,
            attached_user_ids
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::AttachedLocalUserIds,
            hashtag,
            attached_local_user_ids
        );
        convert_to_stringvec_json!(
            Hashtag::Table,
            Hashtag::Id,
            Hashtag::AttachedRemoteUserIds,
            hashtag,
            attached_remote_user_ids
        );
        convert_to_stringvec_json!(
            MessagingMessage::Table,
            MessagingMessage::Id,
            MessagingMessage::Reads,
            messaging_message,
            reads
        );
        convert_to_stringvec_json!(Meta::Table, Meta::Id, Meta::Langs, meta, langs);
        convert_to_stringvec_json!(
            Meta::Table,
            Meta::Id,
            Meta::BlockedHosts,
            meta,
            blocked_hosts
        );
        convert_to_stringvec_json!(Meta::Table, Meta::Id, Meta::HiddenTags, meta, hidden_tags);
        convert_to_stringvec_json!(Meta::Table, Meta::Id, Meta::PinnedUsers, meta, pinned_users);
        convert_to_stringvec_json!(Meta::Table, Meta::Id, Meta::PinnedPages, meta, pinned_pages);
        convert_to_stringvec_json!(
            Meta::Table,
            Meta::Id,
            Meta::RecommendedInstances,
            meta,
            recommended_instances
        );
        convert_to_stringvec_json!(
            Meta::Table,
            Meta::Id,
            Meta::SilencedHosts,
            meta,
            silenced_hosts
        );
        convert_to_stringvec_json!(Note::Table, Note::Id, Note::FileIds, note, file_ids);
        convert_to_stringvec_json!(
            Note::Table,
            Note::Id,
            Note::AttachedFileTypes,
            note,
            attached_file_types
        );
        convert_to_stringvec_json!(
            Note::Table,
            Note::Id,
            Note::VisibleUserIds,
            note,
            visible_user_ids
        );
        convert_to_stringvec_json!(Note::Table, Note::Id, Note::Mentions, note, mentions);
        convert_to_stringvec_json!(Note::Table, Note::Id, Note::Emojis, note, emojis);
        convert_to_stringvec_json!(Note::Table, Note::Id, Note::Tags, note, tags);
        convert_to_stringvec_json!(
            NoteEdit::Table,
            NoteEdit::Id,
            NoteEdit::FileIds,
            note_edit,
            file_ids
        );
        convert_to_stringvec_json!(
            Page::Table,
            Page::Id,
            Page::VisibleUserIds,
            page,
            visible_user_ids
        );
        convert_to_stringvec_json!(
            RegistryItem::Table,
            RegistryItem::Id,
            RegistryItem::Scope,
            registry_item,
            scope
        );
        convert_to_stringvec_json!(User::Table, User::Id, User::Tags, user, tags);
        convert_to_stringvec_json!(User::Table, User::Id, User::Emojis, user, emojis);
        convert_to_stringvec_json!(Webhook::Table, Webhook::Id, Webhook::On, webhook, on);

        // Convert poll here because its primary key is not id, but note_id.
        let query = select_query(Poll::Table, Poll::NoteId, Poll::Choices);
        let res = get_vec::<Vec<String>>(db, query).await?;
        convert_col(manager, Poll::Table, Poll::Choices).await?;
        let models: Vec<poll::ActiveModel> = res
            .iter()
            .map(|(id, r)| poll::ActiveModel {
                note_id: sea_orm::Set(id.to_owned()),
                choices: sea_orm::Set(StringVec::from(r.to_owned())),
                ..Default::default()
            })
            .collect();
        for model in models {
            poll::Entity::update(model).exec(db).await?;
        }
        let query = select_query(Poll::Table, Poll::NoteId, Poll::Votes);
        let res = get_vec::<Vec<i32>>(db, query).await?;
        convert_col(manager, Poll::Table, Poll::Votes).await?;
        let models: Vec<poll::ActiveModel> = res
            .iter()
            .map(|(id, r)| poll::ActiveModel {
                note_id: sea_orm::Set(id.to_owned()),
                votes: sea_orm::Set(I32Vec::from(r.to_owned())),
                ..Default::default()
            })
            .collect();
        for model in models {
            poll::Entity::update(model).exec(db).await?;
        }

        // Convert user_profile here because its primary key is not id, but user_id.
        let query = select_query(
            UserProfile::Table,
            UserProfile::UserId,
            UserProfile::MutingNotificationTypes,
        );
        let res = get_vec::<Vec<String>>(db, query).await?;
        convert_col(
            manager,
            UserProfile::Table,
            UserProfile::MutingNotificationTypes,
        )
        .await?;
        let models: Vec<user_profile::ActiveModel> = res
            .iter()
            .map(|(id, r)| user_profile::ActiveModel {
                user_id: sea_orm::Set(id.to_owned()),
                muting_notification_types: sea_orm::Set(StringVec::from(r.to_owned())),
                ..Default::default()
            })
            .collect();
        for model in models {
            user_profile::Entity::update(model).exec(db).await?;
        }

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        Ok(())
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden, Clone)]
enum Antenna {
    Table,
    Id,
    Users,
}
#[derive(Iden, Clone)]
enum AccessToken {
    Table,
    Id,
    Permission,
}
#[derive(Iden, Clone)]
enum App {
    Table,
    Id,
    Permission,
}
#[derive(Iden, Clone)]
enum Emoji {
    Table,
    Id,
    Aliases,
}
#[derive(Iden, Clone)]
enum GalleryPost {
    Table,
    Id,
    FileIds,
    Tags,
}
#[derive(Iden, Clone)]
enum Hashtag {
    Table,
    Id,
    MentionedUserIds,
    MentionedLocalUserIds,
    MentionedRemoteUserIds,
    AttachedUserIds,
    AttachedLocalUserIds,
    AttachedRemoteUserIds,
}
#[derive(Iden, Clone)]
enum MessagingMessage {
    Table,
    Id,
    Reads,
}
#[derive(Iden, Clone)]
enum Meta {
    Table,
    Id,
    Langs,
    HiddenTags,
    BlockedHosts,
    PinnedUsers,
    PinnedPages,
    RecommendedInstances,
    SilencedHosts,
}
#[derive(Iden, Clone)]
enum Note {
    Table,
    Id,
    FileIds,
    AttachedFileTypes,
    VisibleUserIds,
    Mentions,
    Emojis,
    Tags,
}
#[derive(Iden, Clone)]
enum NoteEdit {
    Table,
    Id,
    FileIds,
}
#[derive(Iden, Clone)]
enum Page {
    Table,
    Id,
    VisibleUserIds,
}
#[derive(Iden, Clone)]
enum Poll {
    Table,
    NoteId,
    Choices,
    Votes, // I32Vec
}
#[derive(Iden, Clone)]
enum RegistryItem {
    Table,
    Id,
    Scope,
}
#[derive(Iden, Clone)]
enum User {
    Table,
    Id,
    Tags,
    Emojis,
}
#[derive(Iden, Clone)]
enum UserProfile {
    Table,
    UserId,
    MutingNotificationTypes,
}
#[derive(Iden, Clone)]
enum Webhook {
    Table,
    Id,
    On,
}

fn select_query<T: Iden + 'static>(table: T, id: T, col: T) -> String {
    Query::select()
        .column(id)
        .column(col)
        .from(table)
        .to_string(PostgresQueryBuilder)
}

async fn get_vec<'a, T: TryGetable>(
    db: &SchemaManagerConnection<'a>,
    query: String,
) -> Result<Vec<(String, T)>, DbErr> {
    let res: Vec<(String, T)> = db
        .query_all(Statement::from_string(DbBackend::Postgres, query))
        .await?
        .iter()
        .filter_map(|r| r.try_get_many_by_index().ok())
        .collect();
    Ok(res)
}

async fn convert_col<'a, T: Iden + Clone + 'static>(
    manager: &SchemaManager<'a>,
    table: T,
    col: T,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(table)
                .drop_column(col.to_owned())
                .add_column(
                    ColumnDef::new(col.to_owned())
                        .json_binary()
                        .not_null()
                        .default(json!([])),
                )
                .to_owned(),
        )
        .await
}
