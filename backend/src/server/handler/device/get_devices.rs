use actix_web::{HttpRequest, HttpResponse, Responder};
use crate::database::Selectable;
use crate::models::controller::Controller;
use crate::models::sensor::Sensor;
use crate::models::user::User;
use crate::server::error::{CustomError, DEVICE_SELECT_ERROR, SENSOR_NOT_FOUND_ERROR};
use crate::server::handler::Handler;

pub struct GetDevicesHandler;

impl Handler for GetDevicesHandler {
    type Body = ();
    type Path = ();
    type Query = ();
    type Resources = Vec<Controller>;

    fn new() -> Self {
        GetDevicesHandler
    }

    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, user: Option<User>) -> Result<Self::Resources, CustomError> {
        let mut devices = match Controller::select_by("owner".to_string(), user.unwrap().username.unwrap()).await {
            Ok(dev) => dev,
            Err(err) => return Err(DEVICE_SELECT_ERROR.with_details(err.to_string()))
        };

        for device in devices.iter_mut() {
            let sensors = match Sensor::select_by("controller".to_string(), device.did.clone().unwrap()).await {
                Ok(sens) => sens,
                Err(err) => return Err(SENSOR_NOT_FOUND_ERROR.with_details(err.to_string()))
            };
            device.sensors = Some(sensors)
        }

        return Ok(devices);
    }

    fn response(self, _req: HttpRequest, resources: Self::Resources) -> impl Responder
    where
        Self: Sized,
    {
        HttpResponse::Ok().json(resources)
    }
}