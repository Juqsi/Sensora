use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Value {

    #[serde(skip_serializing_if = "Option::is_none")]
    pub vid: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub timestamp: Option<NaiveDateTime>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub sensor: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub plant: Option<String>,
}