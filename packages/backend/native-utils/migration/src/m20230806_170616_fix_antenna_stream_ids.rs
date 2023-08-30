use std::env;

use redis::Commands;
use sea_orm_migration::prelude::*;

use crate::get_timestamp;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        let cache_url = env::var("CACHE_URL").unwrap();
        let prefix = env::var("CACHE_PREFIX").unwrap();

        let client = redis::Client::open(cache_url).unwrap();
        let mut redis_conn = client.get_connection().unwrap();

        let keys: Vec<String> = redis_conn
            .keys(format!("{}:antennaTimeline:*", prefix))
            .unwrap();
        let key_len = keys.len();

        println!(
            "Fixing corrupted stream IDs: {} timelines to be fixed",
            key_len
        );

        for (i, key) in keys.iter().enumerate() {
            let all_elems: Vec<Vec<Vec<String>>> = redis_conn.xrange_all(key).unwrap(); // Get all post IDs in stream
            let stream_ids = all_elems
                .iter()
                .map(|v| format!("{}-*", get_timestamp(&v[1][1]))); // Get correct stream id with timestamp
            redis_conn.del::<_, ()>(key).unwrap();
            for (j, v) in stream_ids.enumerate() {
                redis_conn
                    .xadd(key, v, &[("note", &all_elems[j][1][1])])
                    .unwrap_or(());
            }

            if i % 10 == 0 {
                println!(
                    "Fixing streams [{:.2}%]",
                    (i as f64 / key_len as f64) * 100_f64
                );
            }
        }

        println!("Fixing streams [100.00%]");

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        Ok(())
    }
}
