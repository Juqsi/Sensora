use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_NOT_EXIST_ERROR, KICK_ERROR};
use crate::server::handler::Handler;

pub struct LeaveGroupHandler;

impl Handler for LeaveGroupHandler {
    type Body = ();
    type Path = (String,);
    type Query = ();
    type Resources = Group;

    fn new() -> Self {
        LeaveGroupHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let group_id = req.match_info().get("groupId").unwrap();

        match Group::select(group_id.to_string()).await {
            Ok(group) => Ok(group),
            Err(err) => Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
        }
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        match resources.remove_member(user.unwrap()).await {
            Ok(_) => Ok(()),
            Err(err) => Err(KICK_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, _resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::NoContent().finish()
    }
}
