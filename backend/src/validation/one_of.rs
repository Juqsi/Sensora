use serde_json::Value;
use crate::validation::Validator;

pub struct OneOfValidator<T> {
    pub rules: Vec<Box<dyn Validator<T>>>
}

impl <T> OneOfValidator<T> {
    pub fn new(rules: Vec<Box<dyn Validator<T>>>) -> Self {Self {rules}}
}

/// Implementiert die Validationslogik, wobei T der Typ der zu prüfenden Variable und U der Typ des Objekts sind.
impl<T, U> Validator<U> for OneOfValidator<T> {

    /// Prüft, ob mindestens eine der spezifizierten Regeln zutrifft.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let mut errors = Vec::new();

        for validator in &self.rules {
            match validator.validate(object) {
                Ok(_) => return Ok(()),
                Err(err) => errors.push(err),
            }
        }

        Err(format!(
            "Validation failed: At least one validation must pass:\n{}",
            errors.join("\n")
        ))
    }
}
