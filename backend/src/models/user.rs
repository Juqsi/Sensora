use std::fmt::{Display};
use std::str::FromStr;
use base64::Engine;
use base64::engine::general_purpose;
use serde::{Deserialize, Serialize};
use validator::ValidateEmail;
use crate::models::group::Group;
use crate::models::room::Room;

pub const USERNAME_ILLEGAL_CHARS: [char; 10] = ['@', '"', '%', '\'', '*', ',', '\\', '{', '}', '!'];

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Clone, Debug)]
#[sqlx(default)]
pub struct User {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) username: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) password: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) mail: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) uid: Option<String>,

    #[serde(rename = "groupIDs")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) group_ids: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) firstname: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) lastname: Option<String>,

    #[serde(rename = "avatarRef")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) avatar_ref: Option<AvatarRef>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) token: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) active: Option<bool>,

}

impl User {
    /// Setzt das Feld `uid` aus den erforderlichen Feldern `username` und `mail`. Gibt einen Fehler zurück, wenn `username` oder `mail` `None` ist.
    pub fn set_uid(&mut self) -> Result<(), String> {

        if let Some(username) = &self.username {
            if let Some(mail) = &self.mail {
                self.uid = Some(general_purpose::URL_SAFE_NO_PAD.encode(format!("{}@{}", username, mail)));
                return Ok(());
            }
            return Err("mail is required to generate uid".to_string())
        }

        Err("username is required to generate uid".to_string())
    }

    /// Interpretiert die uid des Users in `username` und `mail`. Gibt einen Fehler zurück, wenn die uid nicht interpretiert werden kann.
    pub fn pars_uid(uid: String) -> Result<(String, String), String> {
        let decoded = match general_purpose::URL_SAFE_NO_PAD.decode(uid) {
            Ok(dec) => dec,
            Err(e) => return Err(format!("unable to interpret uid: {}", e.to_string())),
        };
        let uid = match String::from_utf8(decoded) {
            Ok(uid) => uid,
            Err(e) => return Err(format!("unable to decode uid: {}", e.to_string())),
        };

        if let Some(index) = uid.find("@") {
            let username = &uid[..index];
            let mail = &uid[index + 1..];

            if !mail.validate_email() {
                return Err(String::from("resulting mail would be invalid"))
            }

            return Ok((String::from(username), String::from(mail)))
        }

        Err(String::from("unable to find @ symbol"))
    }


}

#[derive(Serialize, Deserialize, Debug)]
pub enum AvatarRef {
    Peashooter,
    Sunflower,
    #[serde(rename = "Cherry Bomb")]
    CherryBomb,
    #[serde(rename = "Wall-nut")]
    WallNut,
    #[serde(rename = "Potato Mine")]
    PotatoMine,
    #[serde(rename = "Snow Pea")]
    SnowPea,
    Chomper,
    Marigold,
}

impl Clone for AvatarRef {
    fn clone(&self) -> Self {
        match self {
            AvatarRef::Peashooter => { AvatarRef::Peashooter }
            AvatarRef::Sunflower => { AvatarRef::Sunflower }
            AvatarRef::CherryBomb => { AvatarRef::CherryBomb }
            AvatarRef::WallNut => { AvatarRef::WallNut }
            AvatarRef::PotatoMine => { AvatarRef::PotatoMine }
            AvatarRef::SnowPea => { AvatarRef::SnowPea }
            AvatarRef::Chomper => { AvatarRef::Chomper }
            AvatarRef::Marigold => { AvatarRef::Marigold }
        }
    }
}

impl FromStr for AvatarRef {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Peashooter" => Ok(AvatarRef::Peashooter),
            "Sunflower" => Ok(AvatarRef::Sunflower),
            "Cherry Bomb" => Ok(AvatarRef::CherryBomb),
            "Wall-nut" => Ok(AvatarRef::WallNut),
            "Potato Mine" => Ok(AvatarRef::PotatoMine),
            "Snow Pea" => Ok(AvatarRef::SnowPea),
            "Chomper" => Ok(AvatarRef::Chomper),
            "Marigold" => Ok(AvatarRef::Marigold),
            _ => Err(format!("Unknown AvatarRef: {}", s)),
        }
    }
}

impl Display for AvatarRef {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AvatarRef::Peashooter => { write!(f, "{}", "Peashooter") }
            AvatarRef::Sunflower => { write!(f, "{}", "Sunflower") }
            AvatarRef::CherryBomb => { write!(f, "{}", "Cherry Bomb") }
            AvatarRef::WallNut => { write!(f, "{}", "Wall-nut") }
            AvatarRef::PotatoMine => { write!(f, "{}", "Potato Mine") }
            AvatarRef::SnowPea => { write!(f, "{}", "Snow Pea") }
            AvatarRef::Chomper => { write!(f, "{}", "Chomper") }
            AvatarRef::Marigold => { write!(f, "{}", "Marigold") }
        }
    }
}


impl User {

    pub fn has_standard_privileges(&self, room: Room, group: Option<Group>) -> bool {
        if room.is_owner(self.clone()) { return true }

        if let Some(group) = group {
            return group.is_member(self.clone())
        }
        false
    }
}
