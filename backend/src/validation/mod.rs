pub mod required;
pub mod one_of;
pub mod mail;
pub mod illegal_chars;
pub mod password;
pub mod min_length;
pub mod for_all;
pub mod if_than_else;
pub mod date_time;
pub mod empty_string;

use std::fmt::{Display, Formatter};
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::{from_value, Value};

/// Implementiert die Funktionen zum Überprüfen des Objekts, wobei T der Typ des Objekts ist.
pub trait Validator<T> {

    /// Prüft, ob der Wert des Felds der definierten Regel entspricht.
    fn validate(&self, object: &Value) -> Result<(), String>;
}

pub enum Field {
    Simple(String),
    Nested(Vec<String>),
    Root,
}

impl Display for Field {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", match &self {
            Field::Simple(name) => name.clone(),
            Field::Nested(path) => path.join("."),
            Field::Root => "object".to_string(),
        })
    }
}

impl Field {
    fn get_value<T>(&self, value: &Value) -> Option<T>
    where
        T: DeserializeOwned,
    {
        match self{
            Field::Simple(field_name) => value
                .get(field_name)
                .and_then(|v| from_value(v.clone()).ok()),

            Field::Nested(path) => {
                let mut current = value;
                for segment in path {
                    current = current.get(segment)?;
                }
                from_value(current.clone()).ok()
            }
            Field::Root => from_value(value.clone()).ok(),
        }
    }
}

pub struct ValidationSet<T> {
    pub(crate) rules: Vec<Box<dyn Validator<T>>>,
}

impl<T> ValidationSet<T> {

    pub fn new(rules: Vec<Box<dyn Validator<T>>>) -> Self {
        Self { rules }
    }

    pub fn validate(&self, obj: &T) -> Result<(), Vec<String>>
    where
        T: Serialize,
    {
        let json_value: Value = match serde_json::to_value(obj) {
            Ok(val) => {val}
            Err(err) => return Err(vec![format!("unable to serialize object: {err}")])
        };

        let mut errors = Vec::new();

        for rule in &self.rules {
            if let Err(err) = rule.validate(&json_value.clone()) {
                errors.push(err);
            }
        }

        if errors.is_empty() {
            return Ok(())
        }

        Err(errors)
    }
}
