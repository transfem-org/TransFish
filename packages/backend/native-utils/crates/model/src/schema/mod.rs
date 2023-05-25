pub mod antenna;
pub mod app;

use jsonschema::JSONSchema;
use schemars::{schema_for, JsonSchema};
use serde_json::Value;

type Keyword = Vec<Vec<String>>;
type StringList = Vec<String>;

/// Structs of schema defitions implement this trait in order to
/// provide the JSON Schema validator [`jsonschema::JSONSchema`].
trait Schema<T: JsonSchema> {
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

pub(crate) fn json_to_keyword(value: &Value) -> Keyword {
    match value.as_array() {
        None => vec![vec![]],
        Some(or_vec) => or_vec
            .iter()
            .map(|and_val| match and_val.as_array() {
                None => vec![],
                Some(and_vec) => and_vec
                    .iter()
                    .map(|word| word.as_str().unwrap_or_default().to_string())
                    .collect(),
            })
            .collect(),
    }
}

pub(crate) fn json_to_string_list(value: &Value) -> StringList {
    match value.as_array() {
        None => vec![],
        Some(v) => v
            .iter()
            .map(|s| s.as_str().unwrap_or_default().to_string())
            .collect(),
    }
}
