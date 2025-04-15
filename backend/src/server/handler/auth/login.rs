use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::configuration::CONF;
use crate::models::user::User;
use crate::server::error::{CustomError, AUTH_PASSWORT_MISMATCH_ERROR, BODY_INVALID, LOAD_USER_ERROR, LOAD_WITH_MAIL_ERROR, LOAD_WITH_USERNAME_ERROR, MAIL_NOT_VERIFIED_ERROR};
use crate::server::handler::Handler;
use crate::validation::required::RequiredValidator;
use crate::validation::{Field, ValidationSet};
use crate::validation::mail::MailValidator;
use crate::validation::one_of::OneOfValidator;
use crate::database::Selectable;
use crate::security::{generate_signed_token, verify_password};

pub struct LoginHandler;

pub struct LoginHandlerResources {
    database_user: User,
    sent_user: User
}

impl Handler for LoginHandler {
    type Body = User;
    type Path = ();
    type Query = ();
    type Resources = LoginHandlerResources;

    fn new() -> Self {
        LoginHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet::new(
            vec![
                Box::new(RequiredValidator::<String>::new(Field::Simple("password".to_string()))),
                Box::new(OneOfValidator::<String>::new(
                    vec![
                        Box::new(RequiredValidator::<String>::new(Field::Simple("username".to_string()))),
                        Box::new(MailValidator::new(Field::Simple("mail".to_string()))),
                    ]
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
        if let Some(username) = content.username.clone() {
            return match User::select(username).await {
                Ok(user) => Ok(LoginHandlerResources {
                    database_user: user,
                    sent_user: content,
                }),
                Err(err) => Err(LOAD_WITH_USERNAME_ERROR.with_details(err.to_string()))
            }
        } else if let Some(mail) = content.mail.clone() {
            return match User::select_by("mail".to_string(), mail).await {
                Ok(users) => Ok(LoginHandlerResources {
                    database_user: users[0].clone(),
                    sent_user: content,
                }),
                Err(err) => Err(LOAD_WITH_MAIL_ERROR.with_details(err.to_string()))
            }
        }

        Err(LOAD_USER_ERROR)
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {

        if !CONF.skip_mail_verification && !resources.database_user.active.unwrap() {
            return Err(MAIL_NOT_VERIFIED_ERROR)
        }

        if verify_password(resources.sent_user.password.clone().unwrap().as_str(), resources.database_user.password.clone().unwrap().as_str()) {
            return Ok(())
        }

        Err(AUTH_PASSWORT_MISMATCH_ERROR)
    }

    fn process_request(&self, _: HttpRequest, resources: &mut Self::Resources, _: Option<User>) -> Result<(), CustomError> {

        resources.database_user.password = None;
        resources.database_user.token = Some(generate_signed_token(resources.database_user.uid.clone().unwrap()));

        Ok(())
    }

    fn response(self, _: HttpRequest, resources: Self::Resources) -> impl Responder {
        HttpResponse::Ok().json(resources.database_user)
    }
}
