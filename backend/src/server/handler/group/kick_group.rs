use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_NOT_EXIST_ERROR, KICK_ERROR, NOT_A_MEMBER_ERROR, UID_PARSING_ERROR, USER_NOT_FOUND_ERROR};
use crate::server::handler::Handler;

pub struct KickGroupHandler;
pub struct KickGroupHandlerResources {
    database_group: Group,
    database_user: User
}

impl Handler for KickGroupHandler {
    type Body = ();
    type Path = (String, String);
    type Query = ();
    type Resources = KickGroupHandlerResources;

    fn new() -> Self {
        KickGroupHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let group_id = req.match_info().get("groupId").unwrap();
        let user_id = req.match_info().get("userId").unwrap();

        let group = match Group::select(group_id.to_string()).await {
            Ok(group) => group,
            Err(err) => return Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
        };

        let (username, _) = match User::pars_uid(user_id.to_string()) {
            Ok(parsed) => parsed,
            Err(err) => return Err(UID_PARSING_ERROR.with_details(err.to_string()))
        };

        let user = match User::select(username).await {
            Ok(user) => user,
            Err(err) => return Err(USER_NOT_FOUND_ERROR.with_details(err.to_string()))
        };

        Ok(
            KickGroupHandlerResources {
                database_group: group,
                database_user: user,
            }
        )
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if resources.database_group.is_member(user.unwrap()) {
            return Ok(())
        }
        Err(NOT_A_MEMBER_ERROR)
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.database_group.remove_member(resources.database_user.clone()).await {
            Ok(_) => Ok(()),
            Err(err) => Err(KICK_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.database_group)
    }
}
