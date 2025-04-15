use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Insertable;
use crate::models::user;
use crate::models::user::User;
use crate::security::hash_password;
use crate::server::error::{CustomError, AUTH_USER_INSERT_ERROR, BODY_INVALID};
use crate::server::handler::Handler;
use crate::validation::password::PasswordValidator;
use crate::validation::{Field, ValidationSet};
use crate::validation::illegal_chars::IllegalCharsValidator;
use crate::validation::mail::MailValidator;
use crate::validation::required::RequiredValidator;

pub struct RegisterHandler;

impl Handler for RegisterHandler {
    type Body = User;
    type Path = ();
    type Query = ();
    type Resources = User;

    fn new() -> Self {
        RegisterHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet {
            rules: vec![
                Box::new(PasswordValidator::new(Field::Simple(
                    "password".to_string(),
                ))),
                Box::new(IllegalCharsValidator::new(Field::Simple(
                    "username".to_string(),
                ), user::USERNAME_ILLEGAL_CHARS.to_vec())),
                Box::new(MailValidator::new(Field::Simple(
                    "mail".to_string(),
                ))),
                Box::new(RequiredValidator::<String>::new(Field::Simple(
                    "firstname".to_string(),
                ))),
            ],
        };

        match rules.validate(content) {
            Ok(_) => Ok(()),
            Err(err) => {
                Err(BODY_INVALID.with_details(err.join("\n")))
            }
        }
    }

    async fn load_resources(&self, _req: HttpRequest, content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        Ok(content)
    }

    fn process_request(&self, _: HttpRequest, resources: &mut Self::Resources, _: Option<User>) -> Result<(), CustomError> {
        resources.set_uid().unwrap();

        resources.password = Some(hash_password(resources.password.clone().unwrap().as_str()));
        resources.active = Some(false);

        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.insert().await {
            Ok(user) => {
                *resources = user;
                Ok(())
            },
            Err(err) => Err(AUTH_USER_INSERT_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _: HttpRequest, resources: Self::Resources) -> impl Responder {
        HttpResponse::Ok().json(resources)
    }
}
