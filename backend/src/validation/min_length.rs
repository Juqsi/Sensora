use serde::de::DeserializeOwned;
use crate::validation::{Field, Validator};
use serde_json::Value;

pub struct MinLengthValidator<T> {
    pub(crate) field: Field,
    pub(crate) min_length: usize,
    pub(crate) _marker: std::marker::PhantomData<T>,
}

pub trait HasLength {
    fn length(&self) -> usize;
}

impl<T> MinLengthValidator<T> {
    pub fn new(field: Field, min_length: usize) -> Self {
        Self {
            field,
            min_length,
            _marker: std::marker::PhantomData,
        }
    }
}

/// Implementiert die Validationslogik, wobei T der Typ der zu prüfenden Variable und U der Typ des Objekts sind.
impl<T: DeserializeOwned, U> Validator<U> for MinLengthValidator<T> where T: HasLength {

    /// Prüft, ob das Feld mindestens die erforderliche Länge hat.
    fn validate(&self, object: &Value) -> Result<(), String> where T: DeserializeOwned {
        let value: Option<T> = self.field.get_value(&object);

        if value.is_none() {
            return Err(format!(
                "Validation failed: Field '{}' is required.",
                self.field
            ))
        }

        let length = value.unwrap().length();
        if length < self.min_length {
            return Err(format!("Validation failed: Field {} must have at least length {}, but only has length {}.", self.field, self.min_length, length));
        }

        Ok(())
    }
}

impl<T> HasLength for Vec<T> {
    fn length(&self) -> usize {
        self.len()
    }
}

impl HasLength for String {
    fn length(&self) -> usize {
        self.len()
    }
}
