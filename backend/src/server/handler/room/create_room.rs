use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::{Insertable, Selectable};
use crate::models::group::Group;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, GROUP_NOT_EXIST_ERROR, NOT_A_MEMBER_ERROR, ROOM_INSERT_ERROR};
use crate::server::handler::Handler;
use crate::validation::required::RequiredValidator;
use crate::validation::{Field, ValidationSet};

pub struct CreateRoomHandler;
pub struct CreateRoomHandlerResources {
    sent_room: Room,
    database_group: Option<Group>
}

impl Handler for CreateRoomHandler {
    type Body = Room;
    type Path = ();
    type Query = ();
    type Resources = CreateRoomHandlerResources;

    fn new() -> Self {
        CreateRoomHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet::new(
            vec![
                Box::new(RequiredValidator::<String>::new(Field::Simple("name".to_string()))),
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
        let group;
        if let Some(sent_group) = content.group.clone() {
            group = match Group::select(sent_group).await {
                Ok(grp) => Some(grp),
                Err(err) => return Err(GROUP_NOT_EXIST_ERROR.with_details(err.to_string()))
            }
        } else {
            group = None;
        }
        Ok(CreateRoomHandlerResources {
            sent_room: content,
            database_group: group,
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if resources.database_group.is_some() && resources.database_group.clone().unwrap().is_member(user.unwrap()) {
            return Ok(())
        } else if resources.database_group.is_none() {
            return Ok(())
        }

        Err(NOT_A_MEMBER_ERROR)
    }

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        resources.sent_room.owner = user;
        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.sent_room.insert().await {
            Ok(room) => {
                resources.sent_room = room;
                Ok(())
            }
            Err(err) => Err(ROOM_INSERT_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.sent_room)
    }
}
