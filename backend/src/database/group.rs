use std::ops::Deref;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::group::Group;
use crate::models::room::Room;
use crate::models::user::User;

impl Selectable for Group {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.groups as g
        LEFT JOIN sensora.group_members as gm ON g.gid = gm.\"group\"
        WHERE
            gid = ");
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        if rows.is_empty() {
            return Err(Error::RowNotFound)
        }

        let mut group = Group::from_row(&rows[0]).await?;

        _ = group.members_from_rows(&rows).await?;

        Ok(group)
    }

    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut groups = vec![];

        for rid in keys {
            groups.push(Group::select(rid).await?);
        }

        Ok(groups)
    }

    /// Holt mehrere Einträge aus der Datenbank, wobei der Wert der angegebenen Spalte dem key entspricht.
    /// WARNUNG: `column` wird nicht überprüft. Stelle sicher, dass kein Benutzerinput als `column` übergeben wird.
    /// WARNUNG: Füllt nicht die Mitglieder auf!
    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.groups
        WHERE
            \"{}\" = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut rooms = vec![];

        for row in rows {
            rooms.push(Group::from_row(&row).await?);
        }

        Ok(rooms)
    }
}

impl Insertable for Group {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("\"sensora\".\"groups\"".to_string());

        if let Some(gid) = &self.gid {
            builder.push("gid", gid.clone());
        } else {
            builder.push("gid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(name) = &self.name {
            builder.push("name", name.clone());
        } else {
            return Err(Error::Protocol("name is required".to_string()))
        }

        if let Some(avatar_ref) = &self.avatar_ref {
            builder.push("avatar_ref", avatar_ref.clone());
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let mut group = Group::from_row(&row).await?;

        if self.members.is_none() || self.members.clone().unwrap().is_empty() {
            return Ok(group)
        }

        let mut builder = InsertBuilder::new("sensora.group_members".to_string());

        for member in &self.members.clone().unwrap() {
            if let Some(username) = member.username.clone() {
                builder.push("user", username);
                builder.push("group", group.gid.clone());
            } else {
                return Err(Error::Protocol("username is required".to_string()))
            }
        }

        builder.returning(Some("*".to_string()));

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        _ = group.members_from_rows(&rows).await?;

        Ok(group)
    }
}

impl Updatable for Group {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.groups
        SET \n");

        if let Some(gid) = &self.gid {
            builder.push("gid = ");
            builder.push_bind(gid.clone());
            builder.push(",\n");
        }

        if let Some(name) = &self.name {
            builder.push("name = ");
            builder.push_bind(name.clone());
            builder.push(",\n");
        }

        if let Some(avatar_ref) = &self.avatar_ref {
            builder.push("avatar_ref = ");
            builder.push_bind(avatar_ref.clone());
            builder.push(",\n");
        }

        builder.trim_query(2);

        builder.push("\n
        WHERE
            gid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let group = Group::from_row(&row).await?;

        Ok(group)
    }
}

impl Deletable for Group {
    async fn delete(&self) -> Result<Self, Error> {

        if self.gid.is_none() {
            return Err(Error::Protocol("gid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensora.groups WHERE gid = ");
        builder.push_bind(self.gid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let group = Group::from_row(&row).await?;

        Ok(group)
    }
}

impl FromRow for Group {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Group {
                name: match row.try_get("name") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                gid: match row.try_get("gid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                avatar_ref: match row.try_get("avatar_ref") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                members: None,
                rooms: match row.try_get("gid") {
                    Ok(row_value) => {
                        Some(
                            Room::select_by("group".to_string(), row_value).await?
                        )
                    },
                    Err(_) => None,
                },
            }
        )
    }
}

impl Group {
    async fn members_from_rows(&mut self, rows: &Vec<PgRow>) -> Result<&Self, Error> {
        let mut members = vec![];

        for row in rows {
            match row.try_get("user") {
                Ok(row_value) => {
                    members.push(User::select(row_value).await?)
                },
                Err(_) => continue
            }
        }

        self.members = Some(members);

        Ok(self)
    }

    pub async fn add_member(&self, member: User) -> Result<Self, Error> {

        let mut builder = InsertBuilder::new("sensora.group_members".to_string());

        builder.push("user", member.username.clone());
        builder.push("group", self.gid.clone());

        builder.to_query().execute(DATABASE_POOL.deref()).await?;

        let mut group = self.clone();
        if let Some(members) = group.members.as_mut() {
            members.push(member)
        } else {
            group.members = Some(vec![member]);
        }

        Ok(group)
    }

    pub async fn remove_member(&mut self, member: User) -> Result<Self, Error> {

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensora.group_members WHERE \"user\" = ");
        builder.push_bind(member.username.clone());
        builder.push(" AND \"group\" = ");
        builder.push_bind(self.gid.clone());


        builder.to_query().execute(DATABASE_POOL.deref()).await?;

        if let Some(members) = self.members.as_mut() {
            members.retain(|m| {
                m.username.clone().unwrap() == member.username.clone().unwrap()
            })
        }

        Ok(self.clone())
    }
}

impl Operable for Group {}