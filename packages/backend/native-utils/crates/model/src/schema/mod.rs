pub mod antenna;
pub mod app;

use jsonschema::JSONSchema;
use schemars::{schema_for, JsonSchema};

/// Structs of schema defitions implement this trait in order to
/// provide the JSON Schema validator [`jsonschema::JSONSchema`].
pub trait Schema<T: JsonSchema> {
    /// Returns the validator of [JSON Schema Draft
    /// 7](https://json-schema.org/specification-links.html#draft-7) with the
    /// default settings of [`schemars::gen::SchemaSettings`].
    fn validator() -> JSONSchema {
        let root = schema_for!(T);
        let schema = serde_json::to_value(&root).expect("Schema definition invalid");
        JSONSchema::options()
            .with_draft(jsonschema::Draft::Draft7)
            .compile(&schema)
            .expect("Unable to compile schema")
    }
}
