use actix_web::{HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::user::User;
use crate::security::verify_token;
use crate::server::error::{CustomError, ADD_ERROR, GROUP_NOT_EXIST_ERROR, INVITATION_TOKEN_INVALID_ERROR};
use crate::server::handler::Handler;

pub struct JoinGroupHandler;

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct JoinGroupHandlerQuery {
    token: String,
}

impl Handler for JoinGroupHandler {
    type Body = ();
    type Path = ();
    type Query = JoinGroupHandlerQuery;
    type Resources = Group;

    fn new() -> Self {
        JoinGroupHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let query_string = req.query_string();

        let query_params: std::collections::HashMap<String, String> =
            serde_urlencoded::from_str(query_string).unwrap_or_default();

        let token = query_params.get("token").unwrap();


        let group_id = match verify_token(token) {
            Ok(group_id) => group_id,
            Err(err) => return Err(INVITATION_TOKEN_INVALID_ERROR.with_details(err.to_string()))
        };

        match Group::select(group_id).await {
            Ok(group) => Ok(group),
            Err(err) => Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
        }
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        match resources.add_member(user.unwrap()).await {
            Ok(group) => { *resources = group; Ok(()) },
            Err(err) => Err(ADD_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources)
    }
}
