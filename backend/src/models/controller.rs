use serde::{Deserialize, Serialize};
use crate::models::sensor::Sensor;
use crate::models::user::User;

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Controller {

    #[serde(skip_serializing_if = "Option::is_none")]
    pub did: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub sensors: Option<Vec<Sensor>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub secret: Option<String>,
}