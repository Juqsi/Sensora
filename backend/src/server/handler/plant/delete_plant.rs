use actix_web::HttpRequest;
use crate::models::user::User;
use crate::server::error::CustomError;
use crate::server::handler::Handler;

pub struct DeletePlantHandler;

impl Handler for DeletePlantHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = ();

    fn new() -> Self {
        DeletePlantHandler
    }

    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        todo!()
    }
}
