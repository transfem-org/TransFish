use clap::{Parser, Subcommand};
use std::{fs, path::PathBuf};

use crate::config::Config;
use crate::error::Error;
use crate::migrator::Migrator;

pub async fn run_cli() -> Result<(), Error> {
    let cli = Cli::parse();

    let migration_dir = cli
        .migration_dir
        .expect("Migration directory not specified");

    match cli.subcommand {
        MigrationCommand::Generate { migration_name } => {
            Migrator::generate(migration_dir, &migration_name)?;
            return Ok(());
        }
        _ => {}
    };

    let yml = fs::File::open(cli.config.expect("Path to 'default.yml' not specified"))
        .expect("Failed to open 'default.yml'");
    let config: Config = serde_yaml::from_reader(yml).expect("Failed to parse yaml");
    let config = config
        .scylla
        .expect("ScyllaDB config not found in 'default.yml'");

    match cli.subcommand {
        MigrationCommand::Up { num } => {
            Migrator::new(migration_dir, &config).await?.up(num).await?
        }
        MigrationCommand::Down { num } => {
            Migrator::new(migration_dir, &config)
                .await?
                .down(num)
                .await?
        }
        _ => {}
    };

    Ok(())
}

#[derive(Parser)]
#[clap(version, about = "ScyllaDB Migration Tool")]
pub(crate) struct Cli {
    #[clap(
        value_parser,
        global = true,
        short = 'c',
        long,
        help = "Path to 'default.yml'"
    )]
    pub config: Option<PathBuf>,

    #[clap(
        value_parser,
        global = true,
        short = 'd',
        long,
        help = "Directory to store migration files"
    )]
    pub migration_dir: Option<PathBuf>,

    #[clap(subcommand)]
    pub subcommand: MigrationCommand,
}

#[derive(Subcommand)]
pub(crate) enum MigrationCommand {
    #[clap(about = "Generate a new, empty migration", display_order = 10)]
    Generate {
        #[clap(
            value_parser,
            required = true,
            help = "Name of the new migration",
            display_order = 11
        )]
        migration_name: String,
    },
    #[clap(about = "Apply pending migrations", display_order = 20)]
    Up {
        #[clap(
            value_parser,
            short,
            long,
            help = "Number of pending migrations to apply"
        )]
        num: Option<u32>,
    },
    #[clap(
        value_parser,
        about = "Rollback applied migrations",
        display_order = 30
    )]
    Down {
        #[clap(
            value_parser,
            short,
            long,
            default_value = "1",
            help = "Number of applied migrations to be rolled back",
            display_order = 31
        )]
        num: u32,
    },
}
