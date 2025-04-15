use std::str::FromStr;
use actix_web::{HttpRequest, HttpResponse, Responder};
use actix_web::web::{Path, Query};
use serde::{Deserialize, Serialize};
use crate::database::Selectable;
use crate::models::group::Group;
use crate::models::plant::Plant;
use crate::models::room::Room;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, GROUP_SELECT_ERROR, PATH_PLANT_ID_MISSING_ERROR, PLANT_NOT_EXIST_ERROR, PLANT_PRIVILEGE_ERROR, ROOM_NOT_EXIST_ERROR};
use crate::server::handler::Handler;
use crate::validation::date_time::{DateTimeValidator, FORMAT};
use crate::validation::if_than_else::IfThenElseValidator;
use crate::validation::{Field, ValidationSet};
use crate::validation::empty_string::EmptyStringOrNoneValidator;

pub struct GetPlantHandler;
pub struct GetPlantHandlerResources {
    database_plant: Plant,
    database_room: Room,
    database_group: Option<Group>
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct GetPlantQuery {

    #[serde(rename = "startTime")]
    start_time: Option<String>,

    #[serde(rename = "endTime")]
    end_time: Option<String>,
}

impl Handler for GetPlantHandler {
    type Body = ();
    type Path = (String,);
    type Query = GetPlantQuery;
    type Resources = GetPlantHandlerResources;

    fn new() -> Self {
        GetPlantHandler
    }

    fn validate_path(&self, _: HttpRequest, path: Path<Self::Path>, query: Query<Self::Query>) -> Result<(), CustomError> {
        let plant_id = path.into_inner().0;

        if plant_id.is_empty() {
            return Err(PATH_PLANT_ID_MISSING_ERROR);
        }

        let rules = ValidationSet::new(
            vec![
                Box::new(IfThenElseValidator::<String>::new(
                    vec![
                        Box::new(DateTimeValidator::new(Field::Simple("startTime".to_string())))
                    ],
                    vec![],
                    vec![
                        Box::new(EmptyStringOrNoneValidator::new(Field::Simple("startTime".to_string()))),
                    ]
                )),
                Box::new(IfThenElseValidator::<String>::new(
                    vec![
                        Box::new(DateTimeValidator::new(Field::Simple("endTime".to_string())))
                    ],
                    vec![],
                    vec![
                        Box::new(EmptyStringOrNoneValidator::new(Field::Simple("endTime".to_string()))),
                    ]
                )),
            ]
        );

        match rules.validate(&query.into_inner()) {
            Ok(_) => Ok(()),
            Err(err) => {
                Err(BODY_INVALID.with_details(err.join("\n")))
            }
        }
    }

    async fn load_resources(&self, req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let plant_id: String = req.match_info().get("plantId").unwrap().to_string();

        let query_string = req.query_string();

        let query_params: std::collections::HashMap<String, String> =
            serde_urlencoded::from_str(query_string).unwrap_or_default();

        let mut with_custom_time = true;
        let mut start = Default::default();
        if let Some(start_time_str) = query_params.get("startTime") {
            start = chrono::NaiveDateTime::parse_from_str(start_time_str.as_str(), FORMAT).unwrap();
        } else {
            with_custom_time = false
        }

        let mut end = Default::default();
        if let Some(end_time_str) = query_params.get("endTime") {
            end = chrono::NaiveDateTime::parse_from_str(end_time_str.as_str(), FORMAT).unwrap();
        } else {
            with_custom_time = false
        }

        let plant;
        if with_custom_time {
            plant = match Plant::select_with_time(plant_id.clone(), start, end).await {
                Ok(plant) => plant,
                Err(err) => return Err(PLANT_NOT_EXIST_ERROR.with_details(err.to_string()))
            };
        } else {
            plant = match Plant::select(plant_id.clone()).await {
                Ok(plant) => plant,
                Err(err) => return Err(PLANT_NOT_EXIST_ERROR.with_details(err.to_string()))
            };
        }

        let room = match Room::select(plant.room.clone().unwrap()).await {
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

        Ok(
            GetPlantHandlerResources {
                database_plant: plant,
                database_room: room,
                database_group: group,
            }
        )
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        if user.unwrap().has_standard_privileges(resources.database_room.clone(), resources.database_group.clone()) {
            return Ok(())
        }

        Err(PLANT_PRIVILEGE_ERROR)
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.database_plant)
    }
}
