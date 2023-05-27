extern crate model;

mod repository;

use chrono::Utc;
use model::entity::{antenna, sea_orm_active_enums::AntennaSrcEnum, user};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, DatabaseConnection, DbErr, EntityTrait, TransactionTrait,
};
use serde_json::json;
use std::env;
use util::{
    id::{create_id, init_id},
    random::gen_string,
};

/// Insert predefined entries in the database.
async fn prepare() {
    let conn_uri = env::var("DATABASE_URL")
        .unwrap_or("postgres://calckey:calckey@localhost/calckey".to_string());
    database::init_database(conn_uri)
        .await
        .expect("Unable to initialize database connection");
    let db = database::get_database().expect("Unable to get database connection from pool");
    setup_model(db).await;
}

/// Delete all entries in the database.
async fn cleanup() {
    let db = database::get_database().unwrap();
    db.transaction::<_, (), DbErr>(|txn| {
        Box::pin(async move {
            user::Entity::delete_many().exec(txn).await.unwrap();
            antenna::Entity::delete_many().exec(txn).await.unwrap();

            Ok(())
        })
    })
    .await
    .expect("Unable to delete predefined models");
}

async fn setup_model(db: &DatabaseConnection) {
    init_id(12);

    db.transaction::<_, (), DbErr>(|txn| {
        Box::pin(async move {
            let user_id = create_id().unwrap();
            let name = "Alice";
            let user_model = user::ActiveModel {
                id: Set(user_id.to_owned()),
                created_at: Set(Utc::now().into()),
                username: Set(name.to_lowercase().to_string()),
                username_lower: Set(name.to_lowercase().to_string()),
                name: Set(Some(name.to_string())),
                token: Set(Some(gen_string(16))),
                is_admin: Set(true),
                ..Default::default()
            };
            user_model.insert(txn).await?;
            let antenna_model = antenna::ActiveModel {
                id: Set(create_id().unwrap()),
                created_at: Set(Utc::now().into()),
                user_id: Set(user_id.to_owned()),
                name: Set("Test Antenna".to_string()),
                src: Set(AntennaSrcEnum::All),
                keywords: Set(json!([["foo", "bar"], ["foobar"]])),
                exclude_keywords: Set(json!([["abc"], ["def", "ghi"]])),
                with_file: Set(false),
                notify: Set(true),
                case_sensitive: Set(true),
                with_replies: Set(false),
                ..Default::default()
            };
            antenna_model.insert(txn).await?;

            Ok(())
        })
    })
    .await
    .expect("Unable to setup predefined models");
}

#[tokio::test]
async fn inte_common_prepare_and_cleanup() {
    prepare().await;
    cleanup().await;
}
