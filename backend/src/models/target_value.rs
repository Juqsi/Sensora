use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct TargetValue {

    #[serde(skip_serializing_if = "Option::is_none")]
    pub tid: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ilk: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub plant: Option<String>,
}