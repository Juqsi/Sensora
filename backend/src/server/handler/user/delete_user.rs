use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Deletable;
use crate::models::user::User;
use crate::server::error::{CustomError, USER_DELETE_ERROR};
use crate::server::handler::Handler;

pub struct DeleteUserHandler;

impl Handler for DeleteUserHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = ();

    fn new() -> Self {
        DeleteUserHandler
    }

    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, _resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        match user.unwrap().delete().await {
            Ok(_) => Ok(()),
            Err(err) => Err(USER_DELETE_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, _resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::NoContent().finish()
    }
}
