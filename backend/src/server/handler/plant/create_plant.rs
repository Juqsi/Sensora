use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::{Insertable, Selectable};
use crate::models::group::Group;
use crate::models::plant::Plant;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, GROUP_SELECT_ERROR, PLANT_INSERT_ERROR, PLANT_PRIVILEGE_ERROR, ROOM_NOT_EXIST_ERROR};
use crate::server::handler::Handler;
use crate::validation::required::RequiredValidator;
use crate::validation::{Field, ValidationSet};

pub struct CreatePlantHandler;
pub struct CreatePlantHandlerResources {
    sent_plant: Plant,
    database_room: Room,
    database_group: Option<Group>,
}

impl Handler for CreatePlantHandler {
    type Body = Plant;
    type Path = ();
    type Query = ();
    type Resources = CreatePlantHandlerResources;

    fn new() -> Self {
        CreatePlantHandler
    }

    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        let rules = ValidationSet::new(
            vec![
                Box::new(RequiredValidator::<String>::new(Field::Simple("name".to_string()))),
                Box::new(RequiredValidator::<String>::new(Field::Simple("room".to_string()))),
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
        let room = match Room::select(content.room.clone().unwrap()).await {
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

        Ok(CreatePlantHandlerResources {
            sent_plant: content,
            database_room: room,
            database_group: group
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError>{
        if resources.database_room.has_standard_privileges(resources.database_group.clone(), user.unwrap()) {
            return Ok(())
        }
        Err(PLANT_PRIVILEGE_ERROR)
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        match resources.sent_plant.insert().await {
            Ok(plant) => {
                resources.sent_plant = plant;
                Ok(())
            },
            Err(err) => Err(PLANT_INSERT_ERROR.with_details(err.to_string()))
        }
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.sent_plant)
    }
}
