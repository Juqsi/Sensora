use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::{Selectable, Updatable};
use crate::models::group::Group;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_NOT_EXIST_ERROR, GROUP_UPDATE_ERROR, NOT_A_MEMBER_ERROR};
use crate::server::handler::Handler;

pub struct EditGroupHandler;
pub struct EditGroupHandlerResources {
    database_group: Group,
    sent_group: Group
}

impl Handler for EditGroupHandler {
    type Body = Group;
    type Path = (String,);
    type Query = ();
    type Resources = EditGroupHandlerResources;

    fn new() -> Self {
        EditGroupHandler
    }

    async fn load_resources(&self, req: HttpRequest, content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let group_id = req.match_info().get("groupId").unwrap();

        let group = match Group::select(group_id.to_string()).await {
            Ok(group) => {group}
            Err(err) => return Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
        };


        Ok(EditGroupHandlerResources {
            database_group: group,
            sent_group: content,
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if resources.database_group.is_member(user.unwrap()) {
            return Ok(())
        }

        Err(NOT_A_MEMBER_ERROR)
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.sent_group.update(resources.database_group.gid.clone().unwrap()).await {
            Ok(group) => {resources.database_group = group; Ok(())}
            Err(err) => Err(GROUP_UPDATE_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.database_group)
    }
}
