use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Updatable;
use crate::models::user;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, USER_UPDATE_ERROR};
use crate::server::handler::Handler;
use crate::validation::{Field, ValidationSet};
use crate::validation::if_than_else::IfThenElseValidator;
use crate::validation::illegal_chars::IllegalCharsValidator;
use crate::validation::mail::MailValidator;
use crate::validation::required::RequiredValidator;

pub struct EditUserHandler;

impl Handler for EditUserHandler {
    type Body = User;
    type Path = ();
    type Query = ();
    type Resources = User;

    fn new() -> Self {
        EditUserHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet::<Self::Body>::new(
            vec![
                Box::new(IfThenElseValidator::<String>::new(
                    vec![
                        Box::new(RequiredValidator::<String>::new(Field::Simple("username".to_string())))
                    ],
                    vec![
                        Box::new(IllegalCharsValidator::new(Field::Simple("username".to_string()), user::USERNAME_ILLEGAL_CHARS.to_vec()))
                    ],
                    vec![]
                )),
                Box::new(IfThenElseValidator::<String>::new(
                    vec![
                        Box::new(RequiredValidator::<String>::new(Field::Simple("mail".to_string())))
                    ],
                    vec![
                        Box::new(MailValidator::new(Field::Simple("mail".to_string())))
                    ],
                    vec![]
                ))
            ]
        );

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

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        resources.active = None;
        resources.password = None;

        if resources.mail.is_some() {
            resources.active = Some(false);
        }


        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        let result = match resources.update(user.unwrap().username.unwrap()).await {
            Ok(user) => { *resources = user; Ok(()) },
            Err(err) => Err(USER_UPDATE_ERROR.with_details(err.to_string()))
        };

        resources.password = None;

        result
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources)
    }
}
