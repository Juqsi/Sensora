use crate::validation::{Field, Validator};
use serde_json::Value;
use validator::ValidateEmail;


pub struct MailValidator {
    pub(crate) field: Field,
}

impl MailValidator {
    pub fn new(field: Field) -> Self {
        Self {
            field,
        }
    }
}

/// Implementiert die Validationslogik, wobei U der Typ des Objekts ist.
impl<U> Validator<U> for MailValidator {

    /// Prüft, ob das Feld eine E-Mail-Adresse ist.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let value: Option<String> = self.field.get_value(&object);

        if value.is_none() {
            return Err(format!("Validation failed: Field '{}' is empty", self.field));
        }

        let email = value.unwrap();

        if email.validate_email() {
            return Ok(());
        }

        return Err(format!("Validation failed: Field '{}' is not a valid email address.", self.field));
    }
}
