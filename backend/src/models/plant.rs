use serde::{Deserialize, Serialize};
use crate::models::controller::Controller;
use crate::models::target_value::TargetValue;

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Plant {

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "plantId")]
    pub pid: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub note: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "plantType")]
    pub variant: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "avatarId")]
    pub avatar: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub room: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "targetValues")]
    pub target_values: Option<Vec<TargetValue>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub controllers: Option<Vec<Controller>>,
}
