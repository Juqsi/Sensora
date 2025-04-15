use actix_web::{HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::user::User;
use crate::security::generate_signed_token;
use crate::server::error::{CustomError, GROUP_NOT_EXIST_ERROR, NOT_A_MEMBER_ERROR};
use crate::server::handler::Handler;

pub struct InviteToGroupHandler;
pub struct InviteToGroupResources {
    requested_group: Group,
    token: String
}

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct InviteToGroupResponse {
    token: String
}

impl Handler for InviteToGroupHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = InviteToGroupResources;

    fn new() -> Self {
        InviteToGroupHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let group_id = req.match_info().get("groupId").unwrap();

        match Group::select(group_id.to_string()).await {
            Ok(group) => Ok(InviteToGroupResources {
                requested_group: group,
                token: "".to_string()
            }),
            Err(err) => Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
        }
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {

        if resources.requested_group.is_member(user.unwrap()) {
            return Ok(())
        }

        Err(NOT_A_MEMBER_ERROR)
    }

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        resources.token = generate_signed_token(resources.requested_group.gid.clone().unwrap());

        Ok(())
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized
    {
        HttpResponse::Ok().json(InviteToGroupResponse {
            token: resources.token
        })
    }
}