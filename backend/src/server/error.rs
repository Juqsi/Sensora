use std::fmt::{Debug, Display, Formatter};
use actix_web::{HttpRequest, HttpResponse, Responder, ResponseError};
use actix_web::body::{BoxBody, MessageBody};
use actix_web::http::StatusCode;
use serde::{Deserialize, Serialize};
use uuid::Uuid;


#[derive(Serialize, Deserialize, Debug, Clone)]
/// Definition des Rückgabetyps im Fehlerfall.
/// Anhand des einmaligen Identifikators kann die detaillierte Fehlermeldung in den Server-Logs angesehen werden.
/// Der Benutzer erhält aus Sicherheitsgründen nur eine verkürzte Meldung.
pub struct CustomError {
    code: &'static str,

    #[serde(skip_serializing_if = "Option::is_none")]
    status: Option<u16>,

    personal_id: &'static str,
    user_msg: &'static str,

    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<String>,
}

impl Responder for CustomError {
    type Body = BoxBody;

    fn respond_to(self, _: &HttpRequest) -> HttpResponse<Self::Body> {
        self.respond().map_into_boxed_body()
    }
}

impl ResponseError for CustomError {
    fn status_code(&self) -> StatusCode {
        StatusCode::from_u16(self.status.unwrap_or(500)).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
    }

    fn error_response(&self) -> HttpResponse {
        self.clone().respond().map_into_boxed_body()
    }
}

impl CustomError {
    pub fn with_details(mut self, details: String) -> CustomError {
        self.details = Some(details);
        self
    }

    fn respond(self) -> HttpResponse<impl MessageBody> {

        let mut clone = self.clone();
        let personal_id = Box::leak(Box::new(Uuid::new_v4().to_string()));
        clone.personal_id = personal_id.as_str();

        eprintln!("{}", match serde_json::to_string(&clone) {
            Ok(json) => json,
            Err(_) => return HttpResponse::InternalServerError().finish()
        });

        let mut builder = match StatusCode::from_u16(self.status.unwrap_or_else(|| 500)) {
            Ok(status) => HttpResponse::build(status),
            Err(_) => HttpResponse::InternalServerError(),
        };

        clone.status = None;
        clone. details = None;

        if let Some(status) = self.status {
            if status < 500 {
                let mut standard_resp = STANDARD_SECURE_MESSAGE_FOR_SECURITY_RELEVANT_SHIT.clone();
                standard_resp.status = None;
                standard_resp. details = None;
                standard_resp.personal_id = clone.personal_id;
                return builder.json(standard_resp)
            }
        }
        builder.json(clone)
    }
}

impl Display for CustomError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.user_msg)
    }
}

const STANDARD_SECURE_MESSAGE_FOR_SECURITY_RELEVANT_SHIT: CustomError = CustomError {
    code: "E999",
    status: Some(403),
    personal_id: "",
    user_msg: "Normally I would tell you at this point what didn't work. But since we had security complaints, I can only tell you that something is wrong with sensitiv variables. Good luck figuring out what exactly is wrong.",
    details: None,
};

pub const QUERY_PARSING_ERROR: CustomError = CustomError {
    code: "E000",
    status: Some(400),
    personal_id: "",
    user_msg: "unable to parse query",
    details: None,
};
pub const AUTH_REQUIRED_UNAUTHORIZED: CustomError = CustomError {
    code: "E100",
    status: Some(401),
    personal_id: "",
    user_msg: "authorization header required: use 'Authorization: Bearer <token>' to authorize",
    details: None,
};

pub const AUTH_STRING_PARSING_ERROR: CustomError = CustomError {
    code: "E101",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to parse authorization header string: check encoding on ascii",
    details: None,
};

pub const AUTH_BEARER_REQUIRED: CustomError = CustomError {
    code: "E102",
    status: Some(401),
    personal_id: "",
    user_msg: "authorization header must be bearer type: use 'Authorization: Bearer <token>' to authorize",
    details: None,
};

pub const AUTH_INVALID_TOKEN_ERROR: CustomError = CustomError {
    code: "E103",
    status: Some(401),
    personal_id: "",
    user_msg: "the token has expired or is invalid: log in again to get a new token",
    details: None,
};
pub const MAIL_NOT_VERIFIED_ERROR: CustomError = CustomError {
    code: "E104",
    status: Some(401),
    personal_id: "",
    user_msg: "your email address is not yet validated: check your emails",
    details: None,
};

pub const BODY_INVALID: CustomError = CustomError {
    code: "E200",
    status: Some(400),
    personal_id: "",
    user_msg: "request does not match the required format: check the documentation for more information",
    details: None,
};

pub const LOAD_WITH_USERNAME_ERROR: CustomError = CustomError {
    code: "E201",
    status: Some(404),
    personal_id: "",
    user_msg: "unable to find user by its username: check spelling",
    details: None,
};
pub const LOAD_WITH_MAIL_ERROR: CustomError = CustomError {
    code: "E202",
    status: Some(404),
    personal_id: "",
    user_msg: "unable to find user by its mail: check spelling",
    details: None,
};
pub const LOAD_USER_ERROR: CustomError = CustomError {
    code: "E203",
    status: Some(400),
    personal_id: "",
    user_msg: "unable to find user: contact admin for more information",
    details: None,
};
pub const AUTH_PASSWORT_MISMATCH_ERROR: CustomError = CustomError {
    code: "E204",
    status: Some(401),
    personal_id: "",
    user_msg: "password is incorrect: check spelling",
    details: None,
};

pub const AUTH_USER_INSERT_ERROR: CustomError = CustomError {
    code: "E205",
    status: Some(409),
    personal_id: "",
    user_msg: "unable to save user: username or mail already in use",
    details: None,
};
pub const UID_PARSING_ERROR: CustomError = CustomError {
    code: "E300",
    status: Some(400),
    personal_id: "",
    user_msg: "id is incorrect: resource may no longer exist",
    details: None,
};
pub const UNAUTHORIZED_USER_ACCESS_ERROR: CustomError = CustomError {
    code: "E301",
    status: Some(401),
    personal_id: "",
    user_msg: "you do not have permission to access this user",
    details: None,
};

pub const USER_UPDATE_ERROR: CustomError = CustomError {
    code: "E302",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to update user: contact admin for more information",
    details: None,
};
pub const USER_DELETE_ERROR: CustomError = CustomError {
    code: "E303",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to delete user: contact admin for more information",
    details: None,
};
pub const GROUP_CREATE_ERROR: CustomError = CustomError {
    code: "E400",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to save group: contact admin for more information",
    details: None,
};
pub const GROUP_SELECT_ERROR: CustomError = CustomError {
    code: "E401",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to get group: contact admin for more information",
    details: None,
};
pub const NOT_A_MEMBER_ERROR: CustomError = CustomError {
    code: "E402",
    status: Some(401),
    personal_id: "",
    user_msg: "you are not a member of the requested group: ask a member to invite you",
    details: None,
};
pub const GROUP_UPDATE_ERROR: CustomError = CustomError {
    code: "E403",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to update group: contact admin for more information",
    details: None,
};
pub const PATH_GROUP_ID_MISSING_ERROR: CustomError = CustomError {
    code: "E404",
    status: Some(400),
    personal_id: "",
    user_msg: "the group id in the path is required: check the documentation for more information",
    details: None,
};

pub const GROUP_DELETE_ERROR: CustomError = CustomError {
    code: "E405",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to delete group: contact admin for more information",
    details: None,
};
pub const GROUP_NOT_EXIST_ERROR: CustomError = CustomError {
    code: "E405",
    status: Some(404),
    personal_id: "",
    user_msg: "the group does not exist: check your spelling",
    details: None,
};
pub const INVITATION_TOKEN_INVALID_ERROR: CustomError = CustomError {
    code: "E406",
    status: Some(401),
    personal_id: "",
    user_msg: "the invitation token has expired or is incorrect: ask a member to add you again",
    details: None,
};

pub const USER_NOT_FOUND_ERROR: CustomError = CustomError {
    code: "E407",
    status: Some(401),
    personal_id: "",
    user_msg: "the user does not exist: check your spelling",
    details: None,
};

pub const KICK_ERROR: CustomError = CustomError {
    code: "E408",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to remove the user from the group: contact admin for more information",
    details: None,
};
pub const ADD_ERROR: CustomError = CustomError {
    code: "E409",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to add the user to the group: contact admin for more information",
    details: None,
};
pub const ROOM_NOT_EXIST_ERROR: CustomError = CustomError {
    code: "E500",
    status: Some(404),
    personal_id: "",
    user_msg: "the room does not exist: check your spelling",
    details: None,
};
pub const PATH_ROOM_ID_MISSING_ERROR: CustomError = CustomError {
    code: "E501",
    status: Some(400),
    personal_id: "",
    user_msg: "the room id in the path is required: check the documentation for more information",
    details: None,
};
pub const ROOM_UPDATE_ERROR: CustomError = CustomError {
    code: "E502",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to save room: contact admin for more information",
    details: None,
};
pub const ROOM_INSERT_ERROR: CustomError = CustomError {
    code: "E503",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to create room: contact admin for more information",
    details: None,
};
pub const ROOM_NOT_THE_OWNER_ERROR: CustomError = CustomError {
    code: "E504",
    status: Some(401),
    personal_id: "",
    user_msg: "you are not the owner of this room: ask the owner to do this",
    details: None,
};
pub const ROOM_DELETE_ERROR: CustomError = CustomError {
    code: "E505",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to delete room: contact admin for more information",
    details: None,
};
pub const PLANT_INSERT_ERROR: CustomError = CustomError {
    code: "E600",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to create plant: contact admin for more information",
    details: None,
};
pub const PATH_PLANT_ID_MISSING_ERROR: CustomError = CustomError {
    code: "E601",
    status: Some(400),
    personal_id: "",
    user_msg: "the plant id in the path is required: check the documentation for more information",
    details: None,
};
pub const PLANT_NOT_EXIST_ERROR: CustomError = CustomError {
    code: "E602",
    status: Some(404),
    personal_id: "",
    user_msg: "the plant does not exist: check your spelling",
    details: None,
};
pub const PLANT_PRIVILEGE_ERROR: CustomError = CustomError {
    code: "E603",
    status: Some(401),
    personal_id: "",
    user_msg: "you dont have permission to do this: ask a member of the associated group or the owner of the associated room to do this",
    details: None,
};
pub const PLANT_UPDATE_ERROR: CustomError = CustomError {
    code: "E603",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to update plant: contact admin for more information",
    details: None,
};
pub const SENSOR_NOT_FOUND_ERROR: CustomError = CustomError {
    code: "E700",
    status: Some(404),
    personal_id: "",
    user_msg: "unable to find sensor: check your spelling",
    details: None,
};
pub const SENSOR_NOT_THE_OWNER_ERROR: CustomError = CustomError {
    code: "E701",
    status: Some(401),
    personal_id: "",
    user_msg: "your are not the owner of this sensor: ask the owner to do this",
    details: None,
};
pub const SENSOR_UNLINK_ERROR: CustomError = CustomError {
    code: "E702",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to unlink sensor from plant: contact admin for more information",
    details: None,
};
pub const SENSOR_LINK_ERROR: CustomError = CustomError {
    code: "E703",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to link sensor to plant: contact admin for more information",
    details: None,
};
pub const CONTROLLER_NOT_FOUND_ERROR: CustomError = CustomError {
    code: "E800",
    status: Some(404),
    personal_id: "",
    user_msg: "unable to find controller: check your spelling",
    details: None,
};
pub const CONTROLLER_NOT_THE_OWNER_ERROR: CustomError = CustomError {
    code: "E801",
    status: Some(401),
    personal_id: "",
    user_msg: "you are not the owner of this controller: ask the owner to do this or try this on every sensor separately",
    details: None,
};
pub const CONTROLLER_LINK_ERROR: CustomError = CustomError {
    code: "E802",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to link full controller to plant: contact admin for more information",
    details: None,
};
pub const TARGET_VALUE_DELETE_ERROR: CustomError = CustomError {
    code: "E900",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to delete target values by plant: contact admin for more information",
    details: None,
};
pub const TARGET_VALUE_INSERT_ERROR: CustomError = CustomError {
    code: "E901",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to insert target values: contact admin for more information",
    details: None,
};
pub const DEVICE_SELECT_ERROR: CustomError = CustomError {
    code: "E921",
    status: Some(500),
    personal_id: "",
    user_msg: "unable to select devices: contact admin for more information",
    details: None,
};
