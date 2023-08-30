pub use sea_orm_migration::prelude::*;

use basen::BASE36;

mod m20230531_180824_drop_reversi;
mod m20230627_185451_index_note_url;
mod m20230709_000510_move_antenna_to_cache;
mod m20230806_170616_fix_antenna_stream_ids;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20230531_180824_drop_reversi::Migration),
            Box::new(m20230627_185451_index_note_url::Migration),
            Box::new(m20230709_000510_move_antenna_to_cache::Migration),
            Box::new(m20230806_170616_fix_antenna_stream_ids::Migration),
        ]
    }
}

pub fn get_timestamp(id: &str) -> i64 {
    const TIME_2000: i64 = 946_684_800_000;
    let n: Option<u64> = BASE36.decode_var_len(&id[0..8]);
    match n {
        None => -1,
        Some(n) => n as i64 + TIME_2000,
    }
}
