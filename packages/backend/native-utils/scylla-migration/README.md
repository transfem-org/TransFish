# ScyllaDB Migration Tool

```
$ cargo run -r -- help
ScyllaDB Migration Tool

Usage: scylla-migration [OPTIONS] <COMMAND>

Commands:
  generate  Generate a new, empty migration
  up        Apply pending migrations
  down      Rollback applied migrations
  help      Print this message or the help of the given subcommand(s)

Options:
  -c, --config <CONFIG>                Path to 'default.yml'
  -d, --migration-dir <MIGRATION_DIR>  Directory to store migration files
  -h, --help                           Print help
  -V, --version                        Print version
```

## CLI Commands

### Generate New Migration

```
cargo run -r -- -d ./cql generate <MIGRATION_NAME>
```

Edit `up.cql` and `down.cql` in `scylla-migration/cql/[timestamp]_<MIGRATION_NAME>`.

Note: `down.cql` is for rollback.

### Apply all pending migrations

```
cargo run -r -- -d ./cql -c ../../../.config/default.yml up
```

### Apply first 10 pending migrations

```
cargo run -r -- -d ./cql -c ../../../.config/default.yml up -n 10
```

### Rollback last applied migrations

```
cargo run -r -- -d ./cql -c ../../../.config/default.yml down
```

### Rollback last 10 applied migrations

```
cargo run -r -- -d ./cql -c ../../../.config/default.yml down -n 10
```
