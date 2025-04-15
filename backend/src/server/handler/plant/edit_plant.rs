use actix_web::{HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::Error;
use crate::database::{Insertable, Selectable, Updatable};
use crate::models::controller::Controller;
use crate::models::group::Group;
use crate::models::plant::Plant;
use crate::models::room::Room;
use crate::models::sensor::Sensor;
use crate::models::target_value::TargetValue;
use crate::models::user::User;
use crate::server::error::{CustomError, BODY_INVALID, CONTROLLER_LINK_ERROR, CONTROLLER_NOT_FOUND_ERROR, CONTROLLER_NOT_THE_OWNER_ERROR, GROUP_SELECT_ERROR, PLANT_NOT_EXIST_ERROR, PLANT_UPDATE_ERROR, ROOM_NOT_EXIST_ERROR, ROOM_NOT_THE_OWNER_ERROR, SENSOR_LINK_ERROR, SENSOR_NOT_FOUND_ERROR, SENSOR_NOT_THE_OWNER_ERROR, SENSOR_UNLINK_ERROR, TARGET_VALUE_DELETE_ERROR, TARGET_VALUE_INSERT_ERROR};
use crate::server::handler::Handler;
use crate::validation::required::RequiredValidator;
use crate::validation::{Field, ValidationSet};
use crate::validation::for_all::ForAllValidator;
use crate::validation::if_than_else::IfThenElseValidator;
use crate::validation::mail::MailValidator;
use crate::validation::min_length::MinLengthValidator;
use crate::validation::one_of::OneOfValidator;

pub struct EditPlantHandler;
pub struct EditPlantResources {
    sent_plant: EditPlantBody,
    sent_plant_id: String,
    database_plant: Plant,
    database_room: Room,
    database_group: Option<Group>,
    requested_room: Room,
    requested_group: Option<Group>,
    requested_sensors: Vec<SensorWrapper>,
    requested_controllers: Vec<Controller>,
    updated_plant: Plant,
}

#[derive(Default, Clone, Debug)]
pub struct SensorWrapper {
    sensor: Sensor,
    controller: Controller,
}

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct EditPlantBody {
    #[serde(flatten)]
    base: Plant,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "assignFullDevice")]
    assign_full_device: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    sensors: Option<Vec<String>>,
}

impl Handler for EditPlantHandler {
    type Body = EditPlantBody;
    type Path = (String,);
    type Query = ();
    type Resources = EditPlantResources;

    fn new() -> Self {
        EditPlantHandler
    }


    fn validate_body(&self, _req: HttpRequest, content: &Self::Body) -> Result<(), CustomError> {
        //TODO: Hier ist ein bug? value kann auch leer sein?
        let rules = ValidationSet::<Self::Body>::new(
            vec![
                Box::new(IfThenElseValidator::<String>::new(
                    vec![
                        Box::new(MinLengthValidator::<String>::new(Field::Simple("targetValues".to_string()), 1))
                    ],
                    vec![
                        Box::new(RequiredValidator::<String>::new(Field::Simple("value".to_string()))),
                        Box::new(RequiredValidator::<String>::new(Field::Simple("ilk".to_string()))),
                    ],
                    vec![]
                ))
            ]
        );

        match rules.validate(content) {
            Ok(_) => Ok(()),
            Err(err) => {
                Err(BODY_INVALID.with_details(err.join("\n")))
            }
        }
    }

    async fn load_resources(&self, req: HttpRequest, content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError> {
        let plant_id: String = req.match_info().get("plantId").unwrap().to_string();

        let database_plant = match Plant::select(plant_id.clone()).await {
            Ok(plant) => plant,
            Err(err) => return Err(PLANT_NOT_EXIST_ERROR.with_details(err.to_string())),
        };

        let database_room = match Room::select(database_plant.room.clone().unwrap()).await {
            Ok(room) => room,
            Err(err) => return Err(ROOM_NOT_EXIST_ERROR.with_details(err.to_string())),
        };

        let database_group;
        if let Some(group) = database_room.group.clone() {
            database_group = match Group::select(group).await {
                Ok(grp) => Some(grp),
                Err(err) => return Err(GROUP_SELECT_ERROR.with_details(err.to_string())),
            }
        } else {
            database_group = None
        }

        let requested_room = match Room::select(content.base.room.clone().unwrap()).await {
            Ok(room) => room,
            Err(err) => return Err(ROOM_NOT_EXIST_ERROR.with_details(err.to_string())),
        };

        let requested_group;
        if let Some(group) = requested_room.group.clone() {
            requested_group = match Group::select(group).await {
                Ok(grp) => Some(grp),
                Err(err) => return Err(GROUP_SELECT_ERROR.with_details(err.to_string())),
            }
        } else {
            requested_group = None
        }

        let requested_sensors = match Sensor::select_multiple(content.sensors.clone().unwrap_or(vec![])).await {
            Ok(sensors) => sensors,
            Err(err) => return Err(SENSOR_NOT_FOUND_ERROR.with_details(err.to_string())),
        };

        let mut sensor_controllers: Vec<SensorWrapper> = Vec::new();
        for sensor in requested_sensors {
            if let Some(ctr) = sensor.controller.clone() {
                let controller = match Controller::select(ctr).await {
                    Ok(ctr) => ctr,
                    Err(err) => return Err(CONTROLLER_NOT_FOUND_ERROR.with_details(err.to_string())),
                };

                sensor_controllers.push(SensorWrapper {
                    controller,
                    sensor
                })

            } else {
                return Err(CONTROLLER_NOT_FOUND_ERROR)
            }
        }

        let requested_controllers = match Controller::select_multiple(content.assign_full_device.clone().unwrap()).await {
            Ok(ctrs) => ctrs,
            Err(err) => return Err(CONTROLLER_NOT_FOUND_ERROR.with_details(err.to_string())),
        };

        Ok(EditPlantResources {
            sent_plant: content,
            sent_plant_id: plant_id,
            database_plant,
            database_room,
            database_group,
            requested_room,
            requested_group,
            requested_sensors: sensor_controllers,
            requested_controllers,
            updated_plant: Plant::default(),
        })
    }

    fn authorize(&self, _req: HttpRequest, resources: &mut Self::Resources, user: Option<User>) -> Result<(), CustomError> {
        let user = user.unwrap();
        if !resources.database_room.has_standard_privileges(resources.database_group.clone(), user.clone()) {
            return Err(ROOM_NOT_THE_OWNER_ERROR);
        }

        if !resources.requested_room.has_standard_privileges(resources.requested_group.clone(), user.clone()) {
            return Err(ROOM_NOT_THE_OWNER_ERROR);
        }

        let user_groups = user.group_ids.unwrap_or(vec![]);
        for sensor in resources.requested_sensors.clone() {
            if let Some(grp) = sensor.sensor.group {
                if user_groups.contains(&grp) {
                    continue;
                }
            }
            if let Some(owner) = sensor.controller.owner {
                if owner.username == user.username {
                    continue
                }
            }
            return Err(SENSOR_NOT_THE_OWNER_ERROR)
        }

        for controller in resources.requested_controllers.clone() {
            if controller.owner.unwrap().username != user.username {
                return Err(CONTROLLER_NOT_THE_OWNER_ERROR)
            }
        }

        Ok(())
    }

    async fn save_resources(&self, _req: HttpRequest, resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        let mut plant = match resources.sent_plant.base.clone().update(resources.sent_plant_id.clone()).await {
            Ok(plt) => plt,
            Err(err) => return Err(PLANT_UPDATE_ERROR.with_details(err.to_string())),
        };

        match Sensor::unlink_by_plant_id(resources.sent_plant_id.clone()).await {
            Ok(_) => {},
            Err(err) => return Err(SENSOR_UNLINK_ERROR.with_details(err.to_string())),
        }

        match Sensor::link_to_plant_id(resources.sent_plant.sensors.clone().unwrap_or(vec![]), plant.pid.clone().unwrap()).await {
            Ok(_) => {}
            Err(err) => return Err(SENSOR_LINK_ERROR.with_details(err.to_string())),
        }

        match Controller::link_to_plant_id(resources.sent_plant.assign_full_device.clone().unwrap_or(vec![]), plant.pid.clone().unwrap()).await {
            Ok(_) => {}
            Err(err) => return Err(CONTROLLER_LINK_ERROR.with_details(err.to_string())),
        }

        match TargetValue::delete_by_plant(resources.sent_plant_id.clone()).await {
            Ok(_) => {}
            Err(err) => return Err(TARGET_VALUE_DELETE_ERROR.with_details(err.to_string())),
        }

        let mut target_values = resources.sent_plant.base.target_values.clone().unwrap_or(vec![]);
        for target_value in target_values.iter_mut() {
            target_value.plant = plant.pid.clone();
            match target_value.insert().await {
                Ok(t_val) => {
                    *target_value = t_val
                }
                Err(err) => return Err(TARGET_VALUE_INSERT_ERROR.with_details(err.to_string())),
            }
        }

        plant = match Plant::select(plant.pid.clone().unwrap()).await {
            Ok(plant) => plant,
            Err(err) => return Err(PLANT_NOT_EXIST_ERROR.with_details(err.to_string()))
        };

        resources.sent_plant.base = plant;

        Ok(())
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources.sent_plant.base)
    }
}
