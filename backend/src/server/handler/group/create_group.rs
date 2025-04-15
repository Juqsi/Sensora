use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::{Insertable,Selectable};
use crate::models::group::Group;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, GROUP_CREATE_ERROR, LOAD_WITH_MAIL_ERROR, UID_PARSING_ERROR, USER_NOT_FOUND_ERROR};
use crate::server::handler::Handler;
use crate::validation::required::RequiredValidator;
use crate::validation::{Field, ValidationSet};
use crate::validation::for_all::ForAllValidator;
use crate::validation::if_than_else::IfThenElseValidator;
use crate::validation::mail::MailValidator;
use crate::validation::min_length::MinLengthValidator;
use crate::validation::one_of::OneOfValidator;

pub struct CreateGroupHandler;

impl Handler for CreateGroupHandler {
    type Body = Group;
    type Path = ();
    type Query = ();
    type Resources = Group;

    fn new() -> Self {
        CreateGroupHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet::<Self::Body>::new(
            vec![
                Box::new(RequiredValidator::<String>::new(Field::Simple(
                    "name".to_string(),
                ))),
                Box::new(IfThenElseValidator::<Group>::new(
                    vec![Box::new(MinLengthValidator::<Vec<User>>::new(
                        Field::Simple("members".to_string()),
                        1,
                    ))],
                    vec![Box::new(ForAllValidator::<User>::new(
                        Field::Simple("members".to_string()),
                        vec![Box::new(OneOfValidator::<User>::new(vec![
                            Box::new(RequiredValidator::<String>::new(Field::Simple(
                                "username".to_string(),
                            ))),
                            Box::new(MailValidator::new(Field::Simple("mail".to_string()))),
                            Box::new(RequiredValidator::<String>::new(Field::Simple(
                                "uid".to_string(),
                            ))),
                        ]))],
                    ))],
                    vec![],
                )),
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

        let mut group = content.clone();

        if let Some(members) = group.members.as_mut() {
            for member in members.iter_mut() {
                if member.username.is_some() {
                    continue
                } else if let Some(mail) = member.mail.clone() {
                    *member = match User::select_by("mail".to_string(), mail).await {
                        Ok(user) => {
                            if user.is_empty() {
                                return Err(USER_NOT_FOUND_ERROR)
                            }
                            user[0].clone()
                        },
                        Err(err) => return Err(LOAD_WITH_MAIL_ERROR.with_details(err.to_string()))
                    }
                } else if let Some(uid) = member.uid.clone() {
                    let (username, mail) = match User::pars_uid(uid) {
                        Ok(parsed) => parsed,
                        Err(err) => return Err(UID_PARSING_ERROR.with_details(err.to_string()))
                    };

                    member.username = Some(username);
                    member.mail = Some(mail);
                }
            }
        }

        Ok(group)
    }

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if let Some(members) = resources.members.as_mut() {
            members.push(user.unwrap());
        }
        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        let result = match resources.insert().await {
            Ok(group) => {
                *resources = group;
                Ok(())
            },
            Err(err) => Err(GROUP_CREATE_ERROR.with_details(err.to_string()))
        };

        if let Some(members) = resources.members.as_mut() {
            for member in members.iter_mut() {
                member.password = None;
                member.group_ids = None;
            }
        }

        result
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources)
    }
}
