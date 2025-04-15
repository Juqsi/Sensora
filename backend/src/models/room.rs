use serde::{Deserialize, Serialize};
use validator::ValidateRequired;
use crate::models::group::Group;
use crate::models::plant::Plant;
use crate::models::user::User;

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Room {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rid: Option<String>,

    #[serde(rename = "groupId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub group: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub plants: Option<Vec<Plant>>,
}

impl Room {
    pub fn is_owner(&self, user: User) -> bool {
        if self.owner.is_none() {
            return false;
        }

        self.owner.clone().unwrap().username.unwrap() == user.username.clone().unwrap()
    }

    pub fn has_standard_privileges(&self, group: Option<Group>, user: User) -> bool {
        if self.is_owner(user.clone()) { return true }

        if let Some(group) = group {
            return group.is_member(user)
        }
        false
    }

}
