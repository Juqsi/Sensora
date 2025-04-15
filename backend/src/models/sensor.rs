use std::fmt::Display;
use std::str::FromStr;
use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;
use crate::models::value::Value;

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Sensor {

    #[serde(skip_serializing_if = "Option::is_none")]
    pub sid: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "lastCall")]
    pub last_call: Option<NaiveDateTime>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ilk: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub unit: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<Status>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub controller: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<Value>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub plant: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub group: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub currently_assigned: Option<bool>
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Status {
    #[serde(rename = "error")]
    Error,
    #[serde(rename = "inactive")]
    Inactive,
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "unknown")]
    Unknown,
}

impl Clone for Status {
    fn clone(&self) -> Self {
        match self {
            Status::Error => { Status::Error }
            Status::Inactive => { Status::Inactive }
            Status::Active => { Status::Active }
            Status::Unknown => { Status::Unknown }
        }
    }
}

impl FromStr for Status {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "error" => Ok(Status::Error),
            "inactive" => Ok(Status::Inactive),
            "active" => Ok(Status::Active),
            "unknown" => Ok(Status::Unknown),
            _ => Err(format!("Unknown Status: {}", s)),
        }
    }
}

impl Display for Status {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Status::Unknown => { write!(f, "{}", "unknown") }
            Status::Active => { write!(f, "{}", "active") }
            Status::Inactive => { write!(f, "{}", "inactive") }
            Status::Error => { write!(f, "{}", "error") }
        }
    }
}
