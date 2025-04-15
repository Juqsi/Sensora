use crate::configuration::CONF;
use crate::server::middleware::log::log_middleware;
use actix_web::middleware::from_fn;
use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use crate::server::handler::auth::login::LoginHandler;
use crate::server::handler::auth::register::RegisterHandler;
use crate::server::handler::device::get_devices::GetDevicesHandler;
use crate::server::handler::group::create_group::CreateGroupHandler;
use crate::server::handler::group::delete_group::DeleteGroupHandler;
use crate::server::handler::group::edit_group::{EditGroupHandler};
use crate::server::handler::group::get_group::GetGroupHandler;
use crate::server::handler::group::invite_to_group::InviteToGroupHandler;
use crate::server::handler::group::join_group::JoinGroupHandler;
use crate::server::handler::group::kick_group::KickGroupHandler;
use crate::server::handler::group::leave_group::LeaveGroupHandler;
use crate::server::handler::Handler;
use crate::server::handler::plant::create_plant::CreatePlantHandler;
use crate::server::handler::plant::edit_plant::EditPlantHandler;
use crate::server::handler::plant::get_plant::GetPlantHandler;
use crate::server::handler::room::create_room::CreateRoomHandler;
use crate::server::handler::room::delete_room::DeleteRoomHandler;
use crate::server::handler::room::edit_room::EditRoomHandler;
use crate::server::handler::room::get_room::{GetRoomHandler};
use crate::server::handler::user::delete_user::DeleteUserHandler;
use crate::server::handler::user::edit_user::EditUserHandler;
use crate::server::handler::user::get_user::GetUserHandler;
use crate::server::middleware::auth::auth_middleware;

mod error;
mod handler;
mod middleware;

/// Startet den Server
pub async fn run() -> std::io::Result<()> {
    HttpServer::new(move || {
        App::new()
            .wrap(from_fn(log_middleware))
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .service(
                web::scope("/v1")
                    .service(
                        web::scope("/auth")
                            .route("/login", web::post().to(LoginHandler::handle))
                            .route("/register", web::post().to(RegisterHandler::handle))
                    )
                    .service(
                        web::scope("/user")
                            .wrap(from_fn(auth_middleware))
                            .route("", web::get().to(GetUserHandler::handle))
                            .route("/{userId}", web::get().to(GetUserHandler::handle))
                            .route("", web::patch().to(EditUserHandler::handle))
                            .route("", web::delete().to(DeleteUserHandler::handle))
                    )
                    .service(
                        web::scope("/group")
                            .wrap(from_fn(auth_middleware))
                            .route("", web::get().to(GetGroupHandler::handle))
                            .route("", web::post().to(CreateGroupHandler::handle))
                            .route("/{groupId}", web::patch().to(EditGroupHandler::handle))
                            .route("/{groupId}", web::delete().to(DeleteGroupHandler::handle))
                            .route("/join", web::get().to(JoinGroupHandler::handle))
                            .route("/{groupId}/kick/{userId}", web::delete().to(KickGroupHandler::handle))
                            .route("/{groupId}/leave", web::delete().to(LeaveGroupHandler::handle))
                            .route("/{groupId}/invite", web::get().to(InviteToGroupHandler::handle))
                    )
                    .service(
                        web::scope("/room")
                            .wrap(from_fn(auth_middleware))
                            .route("", web::post().to(CreateRoomHandler::handle))
                            .route("/{roomId}", web::get().to(GetRoomHandler::handle))
                            .route("/{roomId}", web::patch().to(EditRoomHandler::handle))
                            .route("/{roomId}", web::delete().to(DeleteRoomHandler::handle))
                    )
                    .service(
                        web::scope("/plant")
                            .wrap(from_fn(auth_middleware))
                            .route("", web::post().to(CreatePlantHandler::handle))
                            .route("/{plantId}", web::get().to(GetPlantHandler::handle))
                            .route("/{plantId}", web::patch().to(EditPlantHandler::handle))
                    )
                    .service(
                        web::scope("devices")
                            .wrap(from_fn(auth_middleware))
                            .route("", web::get().to(GetDevicesHandler::handle))
                    )
            )
    })
    .bind((CONF.host.as_str(), CONF.port))?
    .run()
    .await
}
