use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::user::User;
use crate::server::error::{CustomError, LOAD_USER_ERROR, UID_PARSING_ERROR, UNAUTHORIZED_USER_ACCESS_ERROR};
use crate::server::handler::Handler;

pub struct GetUserHandler;

impl Handler for GetUserHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = User;

    fn new() -> Self {
        GetUserHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, user: Option<User>) -> Result<Self::Resources, CustomError> {
        let user_id = req.match_info().get("userId");

        if user_id.is_none() {
            return Ok(user.unwrap())
        }
        let user_id = user_id.unwrap();

        let (username, _) = match User::pars_uid(user_id.to_string()) {
            Ok(parsed) => parsed,
            Err(err) => return Err(UID_PARSING_ERROR.with_details(err))
        };

        match User::select(username).await {
            Ok(user) => Ok(user),
            Err(err) => Err(LOAD_USER_ERROR.with_details(err.to_string()))
        }
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        let user = user.clone().unwrap();

        if resources.username.clone().unwrap() == user.username.clone().unwrap() {
            return Ok(())
        }

        for gid in resources.group_ids.clone().unwrap() {
            if user.group_ids.clone().unwrap().contains(&gid) {
                return Ok(())
            }
        }

        Err(UNAUTHORIZED_USER_ACCESS_ERROR)
    }

    fn process_request(&self, _: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        resources.password = None;

        if resources.username != user.unwrap().username {
            resources.group_ids = None;
        }

        Ok(())
    }

    fn response(self, _: HttpRequest, resources: Self::Resources) -> impl Responder {
        HttpResponse::Ok().json(resources)
    }
}
