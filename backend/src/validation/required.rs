use serde::de::DeserializeOwned;
use crate::validation::{Field, Validator};
use serde_json::Value;

pub struct RequiredValidator<T> {
    pub(crate) field: Field,
    pub(crate) _marker: std::marker::PhantomData<T>,
}

impl<T> RequiredValidator<T> {
    pub fn new(field: Field) -> Self {
        Self {
            field,
            _marker: std::marker::PhantomData,
        }
    }
}

/// Implementiert die Validationslogik, wobei T der Typ der zu prüfenden Variable und U der Typ des Objekts sind.
impl<T: DeserializeOwned, U> Validator<U> for RequiredValidator<T> {

    /// Prüft, ob das Feld existiert.
    fn validate(&self, object: &Value) -> Result<(), String> where T: DeserializeOwned {
        let value: Option<T> = self.field.get_value(&object);

        if value.is_some() {
            return Ok(());
        }

        Err(format!(
            "Validation failed: Field '{}' is required.",
            self.field
        ))
    }
}
