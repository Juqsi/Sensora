pub mod auth;
pub mod user;
pub mod group;
pub mod room;
pub mod plant;
pub mod device;

use std::sync::Arc;
use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use actix_web::http::Method;
use actix_web::web::Path;
use crate::models::user::User;
use crate::server::error::{CustomError, QUERY_PARSING_ERROR};


#[derive(serde::Deserialize, Default)]
pub struct Nothing;

/// Definiert den Ablauf eines Handlers.
pub trait Handler {

    /// Der Typ, der zur deserialisierung vom Json-Body verwendet wird.
    type Body: Default;
    /// Der Typ, der zum Parsen des Pfades verwendet wird.
    type Path;
    /// Der Typ, der zum Parsen der Query verwendet wird.
    type Query;

    /// Typ, um resource zwischen den Phasen zu übergeben.
    type Resources;

    /// Gibt eine neue Instanz des Handlers zurück.
    fn new() -> Self;

    /// Prüft, ob der Inhalt des Bodys korrekt ist.
    fn validate_body(&self, _req: HttpRequest, _content: &Self::Body) -> Result<(), CustomError> {
        Ok(())
    }
    /// Prüft, ob der Pfad korrekt ist.
    fn validate_path(&self, _: HttpRequest, _: Path<Self::Path>, _: web::Query<Self::Query>) -> Result<(), CustomError> {
        Ok(())
    }

    /// Lädt für die Verarbeitung erforderliche Resource, vornehmlich aus der Datenbank.
    async fn load_resources(&self, _req: HttpRequest, _content: Self::Body, _user: Option<User>) -> Result<Self::Resources, CustomError>;

    /// Prüft, ob die angeforderte Aktion vom Benutzer durchgeführt werden darf.
    fn authorize(&self, _req: HttpRequest, _resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        Ok(())
    }

    /// Führt die angeforderte Aktion aus.
    fn process_request(&self, _req: HttpRequest, _resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        Ok(())
    }

    /// Speichert die Resource nach ihrer Bearbeitung, vornehmlich in der Datenbank.
    async fn save_resources(&self, _req: HttpRequest, _resources: &mut Self::Resources, _user: Option<User>) -> Result<(), CustomError> {
        Ok(())
    }

    /// Erstellt die Antwort.
    fn response(self, _req: HttpRequest, _resources: Self::Resources) -> impl Responder where Self: std::marker::Sized {
        HttpResponse::Ok().finish()
    }

    async fn handle(req: HttpRequest, content: Option<web::Json<Self::Body>>, path: Path<Self::Path>) -> Result<impl Responder, CustomError>
    where Self: std::marker::Sized, Self::Query: serde::de::DeserializeOwned {
        let handler = Self::new();

        let content = content.unwrap_or_else(|| actix_web::web::Json(Self::Body::default()));

        match req.method() {
            &Method::POST => {
                match handler.validate_body(req.clone(), &content) {
                    Err(err) => return Err(err),
                    _ => {}
                }
            },
            &Method::PATCH => {
                match handler.validate_body(req.clone(), &content) {
                    Err(err) => return Err(err),
                    _ => {}
                }
            },
            _ => {}
        };

        let query: web::Query<Self::Query> = match web::Query::from_query(req.query_string()) {
            Ok(query) => query,
            Err(err) => return Err(QUERY_PARSING_ERROR.with_details(format!("{err}")))
        };
        
        match handler.validate_path(req.clone(), path, query) {
            Err(err) => return Err(err),
            _ => {}
        }

        let auth_user = req.clone();
        let auth_user = auth_user.extensions();
        let auth_user = match auth_user.get::<Arc<User>>() {
            Some(user) => Some(user.as_ref().clone()),
            None => None,
        };

        let mut resources = match handler.load_resources(req.clone(), content.into_inner(), auth_user.clone()).await {
            Ok(res) => res,
            Err(err) => return Err(err),
        };

        match handler.authorize(req.clone(), &mut resources, auth_user.clone()) {
            Err(err) => return Err(err),
            _ => {}
        }

        match handler.process_request(req.clone(), &mut resources, auth_user.clone()) {
            Err(err) => return Err(err),
            _ => {}
        }

        match handler.save_resources(req.clone(), &mut resources, auth_user).await {
            Err(err) => return Err(err),
            _ => {}
        }

        let response = handler.response(req, resources);
        Ok(response)
    }
}
