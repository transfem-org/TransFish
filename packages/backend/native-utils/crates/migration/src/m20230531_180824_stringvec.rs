use model::entity::{antenna, newtype::StringVec};
use sea_orm_migration::{
    prelude::*,
    sea_orm::{DbBackend, EntityTrait, Statement},
};
use serde_json::json;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() == DbBackend::Sqlite {
            return Ok(());
        }

        let db = manager.get_connection();
        let query = Query::select()
            .column(Antenna::Id)
            .column(Antenna::Users)
            .from(Antenna::Table)
            .to_string(PostgresQueryBuilder);
        let res: Vec<(String, Vec<String>)> = db
            .query_all(Statement::from_string(DbBackend::Postgres, query))
            .await?
            .iter()
            .filter_map(|r| r.try_get_many_by_index().ok())
            .collect();

        manager
            .alter_table(
                Table::alter()
                    .table(Antenna::Table)
                    .drop_column(Antenna::Users)
                    .add_column(
                        ColumnDef::new(Antenna::Users)
                            .json_binary()
                            .not_null()
                            .default(json!([])),
                    )
                    .to_owned(),
            )
            .await?;

        let models: Vec<antenna::ActiveModel> = res
            .iter()
            .map(|(id, users)| antenna::ActiveModel {
                id: sea_orm::Set(id.to_owned()),
                users: sea_orm::Set(StringVec::from(users.to_owned())),
                ..Default::default()
            })
            .collect();

        for model in models {
            antenna::Entity::update(model).exec(db).await?;
        }

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        Ok(())
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum Antenna {
    Table,
    Id,
    Users,
}
