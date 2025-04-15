use crate::validation::{Field, Validator};
use serde_json::Value;
use regex::Regex;


pub struct PasswordValidator {
    pub(crate) field: Field,
}

const MIN_LENGTH: usize = 8;
const MAX_LENGTH: usize = 100;
const ILLEGAL_CHARS: [char; 1] = ['@'];

impl PasswordValidator {
    pub fn new(field: Field) -> Self {
        Self {
            field,
        }
    }
}

/// Implementiert die Validationslogik, wobei U der Typ des Objekts ist.
impl<U> Validator<U> for PasswordValidator {

    /// Prüft, ob das Passwort den Richtlinien entspricht.
    fn validate(&self, object: &Value) -> Result<(), String> {
        let value: Option<String> = self.field.get_value(object);

        if let Some(password) = value {
            let mut errors: Vec<String> = vec![];

            if password.is_empty() {
                errors.push("password is required".to_string());
            }

            if password.len() < MIN_LENGTH {
                errors.push(format!("password must contain at least {} characters, but it contains only {}", MIN_LENGTH, password.len()).to_string());
            }

            if password.len() > MAX_LENGTH {
                errors.push(format!("password mustn´t contain more than {} characters, but it contains {}", MAX_LENGTH, password.len()).to_string());
            }

            for c in ILLEGAL_CHARS {
                if password.contains(c) {
                    errors.push(format!("password contains illegal character: {}", c).to_string());
                }
            }

            let special_characters_regex = match Regex::new("[!\"#$%&'()*+,\\-./:;<=>?\\[\\]^_`{|}~]") {
                Ok(r) => r,
                Err(_) => return Err(format!("Validation failed: unable to pares special characters regex\n{}", errors.join("\n")).to_string()),
            };

            if !special_characters_regex.is_match(password.as_str()) {
                errors.push("password must contain at least one of this characters: !\"#$%&'()*+,-./:;<=>?[]^_`{|}~".to_string());
            }

            let normal_characters_regex = match Regex::new("^.*(([A-Z]+.*[a-z]+)|([a-z]+.*[A-Z])).*$") {
                Ok(r) => r,
                Err(e) => return Err(format!("Validation failed: unable to pares normal characters regex {}\n{}",e, errors.join("\n")).to_string()),
            };

            if !normal_characters_regex.is_match(password.as_str()) {
                errors.push("password must contain at least one uppercase letter and one lowercase letter".to_string());
            }

            let number_characters_regex = match Regex::new("\\d") {
                Ok(r) => r,
                Err(_) => return Err(format!("Validation failed: unable to pares number characters regex\n{}", errors.join("\n")).to_string()),
            };

            if !number_characters_regex.is_match(password.as_str()) {
                errors.push("password must contain at least one number".to_string());
            }

            if errors.is_empty() {
                return Ok(());
            }

            return Err(format!(
                "Validation failed: Field '{}' is not a valid password: {}",
                self.field, errors.join("\n")
            ));
        }

        Err(format!(
            "Validation failed: Field '{}' is empty.",
            self.field
        ))
    }
}
