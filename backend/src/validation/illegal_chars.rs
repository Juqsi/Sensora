use crate::validation::{Field, Validator};
use serde_json::Value;

pub struct IllegalCharsValidator {
    pub(crate) field: Field,
    illegal_chars: Vec<char>,
}

impl IllegalCharsValidator {
    pub fn new(field: Field, charset: Vec<char>) -> Self {
        Self {
            field,
            illegal_chars: charset,
        }
    }
}

/// Implementiert die Validationslogik, wobei U der Typ des Objekts ist.
impl<U> Validator<U> for IllegalCharsValidator {
    /// Prüft, ob das Feld unerlaubte Zeichen enthält.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let value: Option<String> = self.field.get_value(&object);

        if value.is_none() {
            return Err(format!(
                "Validation failed: Field '{}' is empty",
                self.field
            ));
        }

        let str = value.unwrap();

        let mut errors: Vec<String> = vec![];
        for c in self.illegal_chars.clone() {
            if str.contains(c) {
                errors.push(format!("string contains illegal character: {}", c).to_string());
            }
        }

        if errors.is_empty() {
            return Ok(());
        }

        Err(format!(
            "Validation failed: Field '{}' is not a valid string: {}",
            self.field,
            errors.join("\n")
        ))
    }
}
