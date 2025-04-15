use serde::de::DeserializeOwned;
use serde_json::Value;
use crate::validation::Validator;

pub struct IfThenElseValidator<T> {
    pub(crate) if_rules: Vec<Box<dyn Validator<T>>>,
    pub(crate) than_rules: Vec<Box<dyn Validator<T>>>,
    pub(crate) else_rules: Vec<Box<dyn Validator<T>>>,
    pub(crate) _marker: std::marker::PhantomData<T>,
}

impl<T> IfThenElseValidator<T> {
    pub fn new(
        if_rules: Vec<Box<dyn Validator<T>>>,
        than_rules: Vec<Box<dyn Validator<T>>>,
        else_rules: Vec<Box<dyn Validator<T>>>,
    ) -> Self {
        Self {
            if_rules,
            than_rules,
            else_rules,
            _marker: std::marker::PhantomData,
        }
    }
}

/// Implementiert die Validationslogik, wobei T der Typ der zu prüfenden Variable und U der Typ des Objekts sind.
impl<T: DeserializeOwned, U> Validator<U> for IfThenElseValidator<T> {

    /// Prüft, ob die Bedingungsregel zutreffen. Wenn sie zutreffen, ist die Validation nur erfolgreich, wenn die `than_rules` erfolgreich sind.
    /// Treffen die Bedingungsregeln nicht zu, ist die Validation nur erfolgreich, wenn die `else_rules` erfolgreich sind.
    fn validate(&self, object: &Value) -> Result<(), String> {

        let mut if_errors = Vec::new();

        for if_rule in &self.if_rules {
            match if_rule.validate(object) {
                Ok(_) => {}
                Err(err) => {
                    if_errors.push(err);
                },
            };
        }

        let mut than_errors = Vec::new();
        if if_errors.is_empty() {
            for than_rule in &self.than_rules {
                match than_rule.validate(object) {
                    Ok(_) => {}
                    Err(msg) => than_errors.push(msg),
                }
            }

            if than_errors.is_empty() {
                return Ok(());
            }

            return Err(format!("Validation failed: conditional validation succeeded, but the following validation failed:\n{}", than_errors.join("\n")))
        }

        let mut else_errors = Vec::new();
        for else_rule in &self.else_rules {
            match else_rule.validate(object) {
                Ok(_) => {}
                Err(msg) => else_errors.push(msg),
            }
        }

        if else_errors.is_empty() {
            return Ok(());
        }

        Err(format!("Validation failed: conditional validation failed and the following validation failed as well:\ncondition error: {}\nfollowing error: {}", if_errors.join("\n"), else_errors.join("\n")))
    }
}