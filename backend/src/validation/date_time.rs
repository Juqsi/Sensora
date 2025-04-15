use crate::validation::{Field, Validator};
use serde_json::Value;
use chrono::{NaiveDateTime};


pub struct DateTimeValidator {
    pub(crate) field: Field,
}

pub const FORMAT: &str = "%Y-%m-%dT%H:%M:%SZ";

impl DateTimeValidator {
    pub fn new(field: Field) -> Self {
        Self {
            field,
        }
    }
}

/// Implementiert die Validationslogik, wobei U der Typ des Objekts ist.
impl<U> Validator<U> for DateTimeValidator {

    /// Prüft, ob der String dem erwarteten Datumsformat entspricht.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let value: Option<String> = self.field.get_value(object);

        if let Some(value) = value {
            return match NaiveDateTime::parse_from_str(value.as_str(), FORMAT) {
                Ok(_) => {Ok(())}
                Err(err) => Err(format!("Validation failed: the string does not conform to the expected format {}: {}", FORMAT, err)),
            }
        }

        Err(format!(
            "Validation failed: Field '{}' is empty.",
            self.field
        ))
    }
}
