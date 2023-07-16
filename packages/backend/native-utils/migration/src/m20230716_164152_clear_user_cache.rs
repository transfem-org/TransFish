use redis::Commands;
use sea_orm_migration::prelude::*;
use std::env;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        let cache_url = env::var("CACHE_URL").unwrap();
        let prefix = env::var("CACHE_PREFIX").unwrap();
        let client = redis::Client::open(cache_url).unwrap();
        let mut redis_conn = client.get_connection().unwrap();
        let keys: Vec<String> = redis_conn
            .keys(format!("{prefix}:cache:userById:*")).unwrap();

        if !keys.is_empty() {
            println!("Deleting {} keys from the cache server.", keys.len());
            redis_conn.del::<_, i32>(keys).unwrap();
        }

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        Ok(())
    }
}
