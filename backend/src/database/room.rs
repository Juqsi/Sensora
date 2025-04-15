use std::ops::Deref;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::plant::Plant;
use crate::models::room::Room;
use crate::models::user::User;

impl Selectable for Room {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.rooms
        WHERE
            rid = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let room = Room::from_row(&row).await?;

        Ok(room)
    }

    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut rooms = vec![];

        for rid in keys {
            rooms.push(Room::select(rid).await?);
        }

        Ok(rooms)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.rooms
        WHERE
            \"{}\" = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut rooms = vec![];

        for row in rows {
            rooms.push(Room::from_row(&row).await?);
        }

        Ok(rooms)
    }
}

impl Insertable for Room {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.rooms".to_string());

        if let Some(rid) = &self.rid {
            builder.push("rid", rid.clone());
        } else {
            builder.push("rid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(name) = &self.name {
            builder.push("name", name.clone());
        } else {
            return Err(Error::Protocol("name is required".to_string()))
        }

        if let Some(owner) = &self.owner {
            if let Some(username) = owner.username.clone() {
                builder.push("owner", username.clone());
            } else {
                return Err(Error::Protocol("owner.username is required".to_string()))
            }
        } else {
            return Err(Error::Protocol("owner is required".to_string()))
        }

        if let Some(group) = &self.group {
            builder.push("group", group.clone());
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let room = Room::from_row(&row).await?;

        Ok(room)
    }
}

impl Updatable for Room {

    /// Überschreibt den Datenbankeintrag, der anhand des Primärschlüssels identifiziert wird.
    /// Werte werden mit `None` überschrieben.
    async fn update(&self, key: String) -> Result<Self, Error> {

        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.rooms
        SET \n");

        if let Some(rid) = &self.rid {
            builder.push("rid = ");
            builder.push_bind(rid.clone());
            builder.push(",\n");
        }

        if let Some(name) = &self.name {
            builder.push("name = ");
            builder.push_bind(name.clone());
            builder.push(",\n");
        }

        if let Some(owner) = &self.owner {
            if let Some(username) = owner.username.clone() {
                builder.push("owner = ");
                builder.push_bind(username.clone());
                builder.push(",\n");
            }
        }

        builder.push("\"group\" = ");
        builder.push_bind(self.group.clone());

        builder.push("\n
        WHERE
            rid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let room = Room::from_row(&row).await?;

        Ok(room)
    }
}

impl Deletable for Room {
    async fn delete(&self) -> Result<Self, Error> {

        if self.rid.is_none() {
            return Err(Error::Protocol("rid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensora.rooms WHERE rid = ");
        builder.push_bind(self.rid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let room = Room::from_row(&row).await?;

        Ok(room)
    }
}

impl FromRow for Room {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Room {
                rid: match row.try_get("rid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                group: match row.try_get("group") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                name: match row.try_get("name") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                owner: match row.try_get("owner") {
                    Ok(row_value) => {
                        let mut owner = User::select(row_value).await?;
                        owner.password = None;
                        owner.group_ids = None;
                        Some(owner)
                    },
                    Err(_) => None,
                },
                plants: match row.try_get("rid") {
                    Ok(row_value) => {
                        Some(Plant::select_by("room".to_string(), row_value).await?)
                    },
                    Err(_) => None,
                },
            }
        )
    }
}

impl Operable for Room {}