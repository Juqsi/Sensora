use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::Value;
use crate::validation::{Field, Validator};

pub struct ForAllValidator<T> {
    pub(crate) rules: Vec<Box<dyn Validator<T>>>,
    pub(crate) field: Field,
    pub(crate) _marker: std::marker::PhantomData<T>,
}

impl<T> ForAllValidator<T>
where
    T: Serialize,
{
    pub fn new(field: Field, rules: Vec<Box<dyn Validator<T>>>) -> Self {
        Self {
            rules,
            field,
            _marker: std::marker::PhantomData,
        }
    }
}

/// Implementiert die Validationslogik, wobei T der Typ der enthaltenden Variable und U der Typ des Objekts sind.
/// Wenn ein Validator z.B. auf `Vec<String>` ausgeführt werden soll, dann muss T als `String` definiert sein.
impl<T: DeserializeOwned, U> Validator<U> for ForAllValidator<T> {

    /// Führt die Validationsregeln für alle Elemente eines Sets aus.
    fn validate(&self, object: &Value) -> Result<(), String> {

        let mut errors = Vec::new();
        if let Value::Array(array) = object {

            for (i, element) in array.iter().enumerate() {
                let mut elem_errors = Vec::new();
                for validator in &self.rules {
                    match validator.validate(element) {
                        Ok(_) => {},
                        Err(err) => elem_errors.push(err),
                    }
                }

                if !elem_errors.is_empty() {
                    errors.push(format!("validation failed at index {i}:\n{}", elem_errors.join("\n")));
                }
            }
        }

        if errors.is_empty() {
            return Ok(());
        }

        Err(format!(
            "Validation failed for field '{}': \n{}",
            self.field,
            errors.join("\n")
        ))
    }
}