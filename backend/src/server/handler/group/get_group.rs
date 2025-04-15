use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_SELECT_ERROR};
use crate::server::handler::Handler;

pub struct GetGroupHandler;

impl Handler for GetGroupHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = Vec<Group>;

    fn new() -> Self {
        GetGroupHandler
    }

    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, user: Option<User>) -> Result<Self::Resources, CustomError> {
        match Group::select_multiple(user.unwrap().group_ids.unwrap()).await {
            Ok(groups) => Ok(groups),
            Err(err) => Err(GROUP_SELECT_ERROR.with_details(err.to_string()))
        }
    }

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        let user = user.unwrap();

        for group in resources {
            if let Some(members) = group.members.as_mut() {
                for member in members {
                    if let Some(username) = member.username.clone() {
                        if username != user.username.clone().unwrap() {
                            _ = member.set_uid();
                            member.group_ids = None;
                        }
                    }
                    member.password = None;
                }
            }
        }

        Ok(())

    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources)
    }
}
