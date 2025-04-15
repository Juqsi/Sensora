use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    Error,
};
use actix_web::middleware::Next;
use std::time::Instant;
use actix_web::body::MessageBody;
use chrono::Utc;

/// Logt die Anfrage nach Abschluss der Bearbeitung auf der Konsole.
pub async fn log_middleware(
    req: ServiceRequest,
    next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let start = Instant::now();
    let method = req.method().to_string();
    let path = req.path().to_string();
    let connection_info = &req
        .connection_info().clone();
    let peer_ip = connection_info
        .peer_addr()
        .unwrap_or("unknown");

    // Lese die Body-Länge (falls bekannt)
    let body_length = req
        .headers()
        .get("content-length")
        .and_then(|val| val.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    let res = next.call(req).await;
    let duration = start.elapsed();

    let status = match &res {
        Ok(res) => res.status().clone().to_string(),
        Err(_) => "unknown".to_string(),
    };

    // Log-Meldung mit Datum, Uhrzeit und den gewünschten Infos
    println!(
        "{} ~ {} ~ {} ~ {} ~ {} ~ {} bytes ~ {} ms",
        Utc::now().format("%Y-%m-%d %H:%M:%S"), // Datum und Zeit
        method,                                 // HTTP-Methode
        peer_ip,                                // IP des Requesters
        path,                                   // Aufgerufener Pfad
        status,                            // Länge des Bodys
        body_length,                            // Länge des Bodys
        duration.as_millis()                    // Dauer in Millisekunden
    );

    res
}
