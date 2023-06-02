use sea_orm_migration::prelude::*;

mod vec_to_json;

#[async_std::main]
async fn main() {
    cli::run_cli(migration::Migrator).await;

    #[cfg(feature = "convert")]
    vec_to_json::convert().await;
}
