use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::{Selectable, Updatable};
use crate::models::group::Group;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_SELECT_ERROR, ROOM_NOT_EXIST_ERROR, ROOM_NOT_THE_OWNER_ERROR, ROOM_UPDATE_ERROR};
use crate::server::handler::Handler;

pub struct EditRoomHandler;
pub struct EditRoomHandlerResources {
    sent_room: Room,
    sent_room_id: String,
    database_room: Room,
    database_group: Option<Group>
}

impl Handler for EditRoomHandler {
    type Body = Room;
    type Path = (String,);
    type Query = ();
    type Resources = EditRoomHandlerResources;

    fn new() -> Self {
        EditRoomHandler
    }

    async fn load_resources(&self, req: HttpRequest, content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let room_id = req.match_info().get("roomId").unwrap();

        let room = match Room::select(room_id.to_string()).await {
            Ok(room) => room,
            Err(err) => return Err(ROOM_NOT_EXIST_ERROR.with_details(err.to_string()))
        };

        let group;
        if let Some(group_id) = room.group.clone() {
            group = match Group::select(group_id).await {
                Ok(grp) => Some(grp),
                Err(err) => return Err(GROUP_SELECT_ERROR.with_details(err.to_string()))
            };
        } else {
            group = None;
        }

        Ok(EditRoomHandlerResources {
            sent_room: content,
            database_room: room,
            database_group: group,
            sent_room_id: room_id.to_string()
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        let is_owner = resources.database_room.is_owner(user.clone().unwrap());
        if is_owner {
            return Ok(())
        }

        if resources.sent_room.group.is_some() && !is_owner {
            return Err(ROOM_NOT_THE_OWNER_ERROR)
        }

        if resources.database_group.is_some() && resources.database_group.clone().unwrap().is_member(user.unwrap()) {
            return Ok(())
        }

        Err(ROOM_NOT_THE_OWNER_ERROR)
    }

    fn process_request(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        resources.sent_room.owner = None;
        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.sent_room.update(resources.sent_room_id.clone()).await {
            Ok(room) => {
                resources.sent_room = room;
                Ok(())
            }
            Err(err) => Err(ROOM_UPDATE_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.sent_room)
    }
}
