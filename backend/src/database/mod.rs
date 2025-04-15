mod query_builder;
pub mod user;
pub mod controller;
pub mod sensor;
pub mod value;
pub mod target_value;
pub mod plant;
mod room;
mod group;

use sqlx::{PgPool, postgres::PgPoolOptions};
use once_cell::sync::Lazy;
use sqlx::postgres::PgRow;
use crate::configuration::CONF;

pub trait Operable: std::marker::Sized + Selectable + Insertable + Updatable + Deletable {}

pub trait Insertable: std::marker::Sized {

    /// Fügt einen Eintrag in der Datenbank hinzu.
    async fn insert(&self) -> Result<Self, sqlx::Error>;
}

pub trait Updatable: std::marker::Sized {

    /// Überschreibt den Datenbankeintrag, der anhand des Primärschlüssels identifiziert wird. Ignoriert `None`.
    async fn update(&self, key: String) -> Result<Self, sqlx::Error>;
}

pub trait Deletable: std::marker::Sized {

    /// Löscht den Datenbankeintrag, der anhand des Primärschlüssels identifiziert wird.
    async fn delete(&self) -> Result<Self, sqlx::Error>;
}

pub trait Selectable: std::marker::Sized {

    /// Holt einen Eintrag aus der Datenbank anhand des Primärschlüssels und gibt ihn als Instanz einer Struct zurück.
    async fn select(key: String) -> Result<Self, sqlx::Error>;

    /// Holt mehrere Einträge aus der Datenbank anhand der Primärschlüssel und gibt sie als Instanzen einer Struct zurück.
    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, sqlx::Error>;

    /// Holt mehrere Einträge aus der Datenbank, wobei der Wert der angegebenen Spalte dem `key` entspricht.
    /// WARNUNG: `column` wird nicht überprüft. Stelle sicher, dass kein Benutzerinput als `column` übergeben wird.
    async fn select_by(column: String, key: String) -> Result<Vec<Self>, sqlx::Error>;
}

pub trait FromRow: std::marker::Sized {

    /// Erstellt eine Instanz der Struct anhand einer Datenbankzeile
    async fn from_row(row: &PgRow) -> Result<Self, sqlx::Error>;
}

pub static DATABASE_POOL: Lazy<PgPool> = Lazy::new(|| {
    println!("Initializing database connection pool");
    match PgPoolOptions::new()
        .max_connections(CONF.max_database_connections)
        .connect_lazy(&CONF.database_connection_str) {
        Ok(pool) => { println!("Database connection pool initialized successfully"); pool },
        Err(e) => panic!("Unable to initialize database connection pool: {:?}", e),
    }
});
