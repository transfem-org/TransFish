use scylla_migration::{cli::run_cli, error::Error};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run_cli().await?;

    Ok(())
}
