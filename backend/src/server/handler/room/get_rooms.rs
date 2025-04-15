use actix_web::HttpRequest;
use crate::models::group::Group;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::CustomError;
use crate::server::handler::Handler;

pub struct GetRoomsHandler;
pub struct GetRoomsHandlerResources {
    database_room: Room,
    database_group: Option<Group>
}

impl Handler for GetRoomsHandler {
    type Body = ();
    type Path = (String,);
    type Query = ();
    type Resources = ();

    fn new() -> Self {
        GetRoomsHandler
    }

    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        todo!()
    }
}