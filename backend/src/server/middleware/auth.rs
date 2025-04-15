use std::sync::Arc;
use crate::server::error::{AUTH_BEARER_REQUIRED, AUTH_INVALID_TOKEN_ERROR, LOAD_WITH_USERNAME_ERROR, AUTH_REQUIRED_UNAUTHORIZED, AUTH_STRING_PARSING_ERROR, MAIL_NOT_VERIFIED_ERROR};
use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::http::header::AUTHORIZATION;
use actix_web::middleware::Next;
use actix_web::{Error, HttpMessage, ResponseError};
use crate::configuration::CONF;
use crate::database::Selectable;
use crate::models::user::User;
use crate::security::verify_token;

/// Authentifiziert den Benutzer anhand eines Bearer Tokens im Header. Der Benutzer wird mit der Datenbank abgeglichen und als Extension zur Verfügung gestellt.
pub async fn auth_middleware(
    req: ServiceRequest,
    next: Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let auth_header_string = match req.headers().get(AUTHORIZATION) {
        None => {
            let error_response = AUTH_REQUIRED_UNAUTHORIZED.error_response();
            return Ok(req.into_response(error_response.map_into_boxed_body()));
        }
        Some(auth) => match auth.to_str() {
            Ok(auth_header_string) => auth_header_string,
            Err(err) => {
                let error_response = AUTH_STRING_PARSING_ERROR.with_details(format!("{err}")).error_response();
                return Ok(req.into_response(error_response.map_into_boxed_body()));
            }
        },
    };

    let token = match auth_header_string.strip_prefix("Bearer ") {
        Some(token) => token,
        None => {
            let error_response = AUTH_BEARER_REQUIRED.error_response();
            return Ok(req.into_response(error_response.map_into_boxed_body()));
        },
    };

    let uid = match verify_token(token) {
        Ok(uid) => uid,
        Err(err) => {
            let error_response = AUTH_INVALID_TOKEN_ERROR.with_details(format!("{err}")).error_response();
            return Ok(req.into_response(error_response.map_into_boxed_body()));
        }
    };

    let (username, _): (String, String) = match User::pars_uid(uid) {
        Ok(pars) => (pars.0, pars.1),
        Err(err) => {
            let error_response = AUTH_INVALID_TOKEN_ERROR.with_details(format!("{err}")).error_response();
            return Ok(req.into_response(error_response.map_into_boxed_body()));
        }
    };

    let mut user = match User::select(username).await {
        Ok(usr) => usr,
        Err(err) => {
            let error_response = LOAD_WITH_USERNAME_ERROR.with_details(format!("{err}")).error_response();
            return Ok(req.into_response(error_response.map_into_boxed_body()));
        }
    };
    user.password = None;

    if !CONF.skip_mail_verification && !user.active.unwrap() {
        let error_response = MAIL_NOT_VERIFIED_ERROR.error_response();
        return Ok(req.into_response(error_response.map_into_boxed_body()));
    }

    req.extensions_mut().insert(Arc::new(user));

    let res = next.call(req).await?;
    Ok(res.map_into_boxed_body())
}
