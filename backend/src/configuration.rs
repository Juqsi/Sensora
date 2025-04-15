use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{env, fs};
use std::path::Path;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use dotenvy::dotenv;
use rand::{TryRngCore};
use rand::rngs::OsRng;

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub app_name: String,
    pub port: u16,
    pub host: String,
    pub max_image_cache_size_mb: usize,
    pub image_cache_lifetime_sec: u64,
    pub image_cache_cleanup_interval_sec: u64,
    pub assets_base_path: String,
    pub database_connection_str: String,
    pub max_database_connections: u32,
    pub skip_mail_verification: bool,
    pub token_lifetime_sec: u64,

    #[serde(skip)]
    pub server_secret: Option<String>,
}

const CONFIGURATION_FILE_PATH: &str = "data/conf.json";
const SERVER_SECRET_FILE_PATH: &str = "data/server_secret";

/// Globale Konfiguration, wird beim ersten Aufruf geladen.
pub static CONF: Lazy<Config> = Lazy::new(|| load_config());

impl Default for Config {
    fn default() -> Self {
        dotenv().ok();
        Config {
            app_name: "Sensora".to_string(),
            port: 8080,
            host: "0.0.0.0".to_string(),
            max_image_cache_size_mb: 100,
            assets_base_path: "./assets".to_string(),
            image_cache_cleanup_interval_sec: 5 * 60,
            image_cache_lifetime_sec: 30 * 60,
            database_connection_str: env::var("DATABASE_URL").unwrap_or_else(|_| "postgres://postgres:mysecretpassword@localhost:5432/sensora".to_string()),
            max_database_connections: 5,
            skip_mail_verification: false,
            server_secret: load_server_secret(),
            token_lifetime_sec: 60*60*24*7
        }
    }
}

/// Lädt die Konfiguration aus einer Datei. Wenn das Laden der Datei fehlschlägt, wird eine Standartkonfiguration erstellt, geladen und gespeichert.
fn load_config() -> Config {
    let path = Path::new(CONFIGURATION_FILE_PATH);

    if !path.exists() {
        return create_config();
    }

    let content = fs::read_to_string(path).unwrap_or_else(|err| {
        panic!(
            "Error reading config file {}: {}",
            CONFIGURATION_FILE_PATH, err
        );
    });
    let mut config = serde_json::from_str(&content).unwrap_or_else(|_err| {
        fs::remove_file(CONFIGURATION_FILE_PATH).unwrap_or_else(|err| {
            println!(
                "Error parsing config file {}: {}",
                CONFIGURATION_FILE_PATH, err
            );
        });
        return create_config();
    });

    config.server_secret = load_server_secret();
    return config;
}

/// Erstellt eine Standartkonfiguration und speichert diese.
fn create_config() -> Config {
    let path = Path::new(CONFIGURATION_FILE_PATH);

    let default_config = Config::default();
    let content = serde_json::to_string_pretty(&default_config).unwrap_or_else(|err| {
        panic!("Error serializing default config: {}", err);
    });

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap_or_else(|err| {
            panic!(
                "Error creating path for config file {}: {}",
                CONFIGURATION_FILE_PATH, err
            );
        });
    }

    fs::write(path, content).unwrap_or_else(|err| {
        panic!(
            "Error writing default config file {}: {}",
            CONFIGURATION_FILE_PATH, err
        );
    });

    default_config
}

/// Lädt ein Secret aus einer Datei. Wenn das Laden fehlschlägt, wird ein zufälliges Secret erstellt und gespeichert.
fn load_server_secret() -> Option<String> {
    let path = Path::new(SERVER_SECRET_FILE_PATH);

    if !path.exists() {
        return create_server_secret();
    }

    let content = fs::read_to_string(path).unwrap_or_else(|err| {
        panic!(
            "Error reading server secret {}: {}",
            SERVER_SECRET_FILE_PATH, err
        );
    });

    if content.is_empty() {
        return create_server_secret();
    }

    return Some(content);
}

/// Erstellt ein zufälliges Secret und speichert dieses in einer Datei.
fn create_server_secret() -> Option<String> {
    let path = Path::new(SERVER_SECRET_FILE_PATH);

    let mut key = [0u8; 64];
    OsRng.try_fill_bytes(&mut key).unwrap();
    let content = STANDARD.encode(&key);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap_or_else(|err| {
            panic!(
                "Error creating path for server secret {}: {}",
                CONFIGURATION_FILE_PATH, err
            );
        });
    }

    fs::write(path, content.clone()).unwrap_or_else(|err| {
        panic!(
            "Error writing server secret {}: {}",
            SERVER_SECRET_FILE_PATH, err
        );
    });

    Some(content)
}
