use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::{CustomError, GROUP_SELECT_ERROR, ROOM_NOT_EXIST_ERROR, ROOM_NOT_THE_OWNER_ERROR};
use crate::server::handler::Handler;

pub struct GetRoomHandler;
pub struct GetRoomHandlerResources {
    database_room: Room,
    database_group: Option<Group>
}

impl Handler for GetRoomHandler {
    type Body = ();
    type Path = (String,);
    type Query = ();
    type Resources = GetRoomHandlerResources;

    fn new() -> Self {
        GetRoomHandler
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
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

        Ok(GetRoomHandlerResources {
            database_room: room,
            database_group: group,
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if resources.database_room.is_owner(user.clone().unwrap()) {
            return Ok(())
        }

        if resources.database_group.is_some() && resources.database_group.clone().unwrap().is_member(user.unwrap()) {
            return Ok(())
        }

        Err(ROOM_NOT_THE_OWNER_ERROR)
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.database_room)
    }
}
