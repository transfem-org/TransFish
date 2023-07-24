use chrono::{Duration, TimeZone, Utc};
use scylla::{
    frame::value::Timestamp, prepared_statement::PreparedStatement, FromRow, Session,
    SessionBuilder,
};
use std::{cmp, fs, io, path::PathBuf};

use crate::{config::ScyllaConfig, error::Error};

pub(crate) struct Migrator {
    dir: PathBuf,
    session: Session,
    prep_up: PreparedStatement,
    prep_down: PreparedStatement,
}

#[derive(FromRow, Debug, Clone)]
struct Info {
    version: String,
    applied_at: Duration,
}

const MIGRATION_TABLE: &str = "ff_migrations";

impl Migrator {
    pub(crate) fn generate(dir: PathBuf, name: &str) -> Result<(), Error> {
        let now = Utc::now().timestamp_millis();
        let new_dir = dir.join(format!("{}_{}", now, name));
        fs::create_dir_all(&new_dir)?;
        fs::write(&new_dir.join("up.cql"), "")?;
        fs::write(&new_dir.join("down.cql"), "")?;

        println!(
            "Generated new migration in {}",
            new_dir.canonicalize()?.display()
        );

        Ok(())
    }

    pub(crate) async fn new(dir: PathBuf, config: &ScyllaConfig) -> Result<Self, Error> {
        let session = SessionBuilder::new()
            .known_nodes(&config.nodes)
            .build()
            .await?;

        session
            .query(
                format!("CREATE KEYSPACE IF NOT EXISTS {keyspace} WITH replication = {{'class': 'NetworkTopologyStrategy', 'replication_factor' : {factor}}}",
                keyspace = config.keyspace,
                factor = config.replication_factor), &[]
            )
            .await?;
        session.use_keyspace(&config.keyspace, true).await?;
        session
            .query(
                format!(
                    "CREATE TABLE IF NOT EXISTS {MIGRATION_TABLE} (
                    version text,
                    applied_at timestamp,
                    PRIMARY KEY(version, applied_at))"
                ),
                &[],
            )
            .await?;

        // Prepare for fast queries
        let prep_up = session
            .prepare(format!(
                "INSERT INTO {MIGRATION_TABLE} (version, applied_at) VALUES (?, ?)"
            ))
            .await?;
        let prep_down = session
            .prepare(format!("DELETE FROM {MIGRATION_TABLE} WHERE version = ?"))
            .await?;

        Ok(Self {
            dir,
            session,
            prep_up,
            prep_down,
        })
    }

    async fn last(&self) -> Result<Option<Info>, Error> {
        let info = self
            .session
            .query(format!("SELECT * FROM {MIGRATION_TABLE}"), &[])
            .await?
            .rows_typed_or_empty::<Info>()
            .filter_map(|e| e.ok());

        let mut info: Vec<Info> = info.collect();
        info.sort_unstable_by(|a, b| a.version.cmp(&b.version));

        let last = info.last();
        if let Some(last) = last {
            println!(
                "Last version is {} applied at {}.",
                last.version,
                Utc.timestamp_millis_opt(last.applied_at.num_milliseconds())
                    .latest()
                    .expect("Failed to get the latest timestamp")
            );
        } else {
            println!("No migration applied yet.")
        }

        Ok(last.cloned())
    }

    fn entries_fs(&self) -> Result<Vec<String>, io::Error> {
        // Get names of subdirectories in the migration directory.
        let mut entries: Vec<String> = self
            .dir
            .read_dir()?
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_ok_and(|t| t.is_dir()))
            .filter_map(|e| e.file_name().into_string().ok())
            .collect();

        // Sort by the directory names.
        entries.sort_unstable();

        Ok(entries)
    }

    fn cql_fs(&self, version: &str, filename: &str) -> Result<Vec<String>, io::Error> {
        let cql = fs::read_to_string(self.dir.join(version).join(filename))?;
        let queries: Vec<String> = cql
            .split_terminator(';')
            .filter_map(|q| {
                let query = q.trim();
                (!query.is_empty()).then_some(query.to_string())
            })
            .collect();

        Ok(queries)
    }

    pub(crate) async fn up(&self, num: Option<u32>) -> Result<(), Error> {
        let entries = self.entries_fs()?;
        let length = entries.len();

        let start_idx = match self.last().await? {
            Some(last) => entries.partition_point(|e| e.clone() <= last.version),
            None => 0,
        };
        if start_idx == length {
            println!("No pending migrations.");
            return Ok(());
        }
        let last_idx = match num {
            None => length,
            Some(n) => cmp::min(start_idx + n as usize, length),
        };

        println!(
            "{} out of {} pending migration(s) will be applied.",
            last_idx - start_idx,
            length - start_idx
        );

        for version in entries[start_idx..last_idx].iter() {
            println!("Applying {version}");

            let now = Utc::now().timestamp_millis();
            let cql = self.cql_fs(version, "up.cql")?;

            // Save migration history
            self.session
                .execute(
                    &self.prep_up,
                    (version, Timestamp(Duration::milliseconds(now))),
                )
                .await?;

            for query in cql {
                match self.session.query(query.to_owned(), &[]).await {
                    Err(e) => {
                        println!("{query}");
                        println!("Query failed. Rolling back...");
                        self.down(1).await?;

                        return Err(e.into());
                    },
                    Ok(_) => {}
                };
            }
        }

        Ok(())
    }

    pub(crate) async fn down(&self, num: u32) -> Result<(), Error> {
        if let Some(last) = self.last().await? {
            let entries = self.entries_fs()?;
            let last_idx = entries.partition_point(|e| e.clone() <= last.version);
            let start_idx = cmp::max(last_idx as i64 - num as i64, 0) as usize;

            println!("{} migration(s) will be reverted.", last_idx - start_idx);

            for version in entries[start_idx..last_idx].iter().rev() {
                println!("Reverting {version}.");

                let cql = self.cql_fs(version, "down.cql")?;

                for query in cql {
                    self.session.query(query, &[]).await?;
                }

                // Remove version from migration history
                self.session.execute(&self.prep_down, (version,)).await?;
            }
        }

        Ok(())
    }
}
