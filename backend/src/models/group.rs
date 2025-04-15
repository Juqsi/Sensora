use serde::{Deserialize, Serialize};
use crate::models::room::Room;
use crate::models::user::{AvatarRef, User};

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct Group {

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub gid: Option<String>,

    #[serde(rename = "avatarRef")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) avatar_ref: Option<AvatarRef>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub members: Option<Vec<User>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub rooms: Option<Vec<Room>>,
}

impl Group {
    pub fn is_member(&self, user: User) -> bool {

        if let Some(members) = &self.members {
            if members.iter().find(|member| member.username == user.username).is_some() {
                return true;
            }
        }
        false
    }
}
