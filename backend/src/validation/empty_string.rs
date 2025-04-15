use crate::validation::{Field, Validator};
use serde_json::Value;


pub struct EmptyStringOrNoneValidator {
    pub(crate) field: Field,
}

impl EmptyStringOrNoneValidator {
    pub fn new(field: Field) -> Self {
        Self {
            field,
        }
    }
}

/// Implementiert die Validationslogik, wobei U der Typ des Objekts ist.
impl<U> Validator<U> for EmptyStringOrNoneValidator {

    /// Prüft, ob der String leer ist.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let value: Option<String> = self.field.get_value(object);

        if let Some(value) = value {

            if value.is_empty() {
                return Ok(())
            }

            return Err("Validation failed: the string is not empty".to_string())
        }

        Ok(())
    }
}
