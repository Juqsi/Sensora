use std::ops::Deref;
use crate::models::user::{AvatarRef, User};
use sqlx::postgres::{PgRow, PgTypeInfo};
use sqlx::{Decode, Encode, Error, Postgres, Row, Type};
use std::str::FromStr;
use sqlx::encode::IsNull;
use sqlx::error::BoxDynError;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};

impl Type<Postgres> for AvatarRef {
    fn type_info() -> PgTypeInfo {
        PgTypeInfo::with_name("sensora.avatar")
    }
}

impl Encode<'_, Postgres> for AvatarRef {
    fn encode_by_ref(&self, buf: &mut sqlx::postgres::PgArgumentBuffer) -> Result<IsNull, BoxDynError> {
        let value = self.to_string();
        Encode::<Postgres>::encode_by_ref(&value, buf)
    }
}

impl<'r> Decode<'r, Postgres> for AvatarRef {
    fn decode(value: sqlx::postgres::PgValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let value = <String as Decode<Postgres>>::decode(value)?;
        AvatarRef::from_str(&value).map_err(Into::into)
    }
}

impl Selectable for User {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.users as u
        LEFT JOIN sensora.group_members as gm ON u.username = gm.\"user\"
        WHERE
            username = ");

        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        if rows.is_empty() {
            return Err(Error::RowNotFound)
        }

        let mut user = User::from_row(&rows[0]).await?;

        user.group_ids = Some(User::groups_from_rows(rows));

        Ok(user)
    }

    async fn select_multiple(key: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut users = vec![];

        for username in key {
            users.push(User::select(username).await?);
        }

        Ok(users)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.users
        WHERE
            {} = ", column).as_str());

        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut users = vec![];
        for row in rows {
            users.push(User::from_row(&row).await?);
        }

        Ok(users)
    }
}

impl Insertable for User {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.users".to_string());

        if let Some(username) = &self.username {
            builder.push("username", username.clone());
        } else {
            return Err(Error::Protocol("username is required".to_string()))
        }

        if let Some(mail) = &self.mail {
            builder.push("mail", mail.clone());
        } else {
            return Err(Error::Protocol("mail is required".to_string()))
        }

        if let Some(password) = &self.password {
            builder.push("password", password.clone());
        } else {
            return Err(Error::Protocol("password is required".to_string()))
        }

        if let Some(firstname) = &self.firstname {
            builder.push("firstname", firstname.clone());
        } else {
            return Err(Error::Protocol("firstname is required".to_string()))
        }

        if let Some(avatar_ref) = &self.avatar_ref {
            builder.push("avatar_ref", avatar_ref.clone());
        }

        if let Some(active) = &self.active {
            builder.push("active", active.clone());
        }

        if let Some(lastname) = &self.lastname {
            builder.push("lastname", lastname.clone());
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let user = User::from_row(&row).await?;

        Ok(user)
    }
}

impl Updatable for User {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.users
        SET \n");

        if let Some(username) = &self.username {
            builder.push("username = ");
            builder.push_bind(username.clone());
            builder.push(",\n");
        }

        if let Some(mail) = &self.mail {
            builder.push("mail = ");
            builder.push_bind(mail.clone());
            builder.push(",\n");
        }

        if let Some(password) = &self.password {
            builder.push("password = ");
            builder.push_bind(password.clone());
            builder.push(",\n");
        }

        if let Some(firstname) = &self.firstname {
            builder.push("firstname = ");
            builder.push_bind(firstname.clone());
            builder.push(",\n");
        }

        if let Some(avatar_ref) = &self.avatar_ref {
            builder.push("avatar_ref = ");
            builder.push_bind(avatar_ref.clone());
            builder.push(",\n");
        }

        if let Some(active) = &self.active {
            builder.push("active = ");
            builder.push_bind(active.clone());
            builder.push(",\n");
        }

        if let Some(lastname) = &self.lastname {
            builder.push("lastname = ");
            builder.push_bind(lastname.clone());
            builder.push(",\n");
        }

        builder.trim_query(2);

        builder.push("\n
        WHERE
            username = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING
            *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let user = User::from_row(&row).await?;

        Ok(user)
    }
}

impl Deletable for User {
    async fn delete(&self) -> Result<Self, Error> {

        if self.username.is_none() {
            return Err(Error::Protocol("username is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensora.users WHERE username = ");
        builder.push_bind(self.username.clone().unwrap());
        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let user = User::from_row(&row).await?;

        Ok(user)
    }
}

impl FromRow for User {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        let mut user = User {
                username: match row.try_get("username") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                password: match row.try_get("password") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                mail: match row.try_get("mail") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                uid: None,
                group_ids: None,
                firstname: match row.try_get("firstname") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                lastname: match row.try_get("lastname") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                avatar_ref: match row.try_get("avatar_ref") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                token: None,
                active: match row.try_get("active") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
            };
        _ = user.set_uid();
        Ok(user)
    }
}

impl Operable for User {}

impl User {
    fn groups_from_rows(rows: Vec<PgRow>) -> Vec<String> {
        let mut groups = vec![];

        for row in rows {
            groups.push(
                match row.try_get("group") {
                    Ok(row_value) => row_value,
                    Err(_) => continue
                }
            )
        }

        groups
    }
}
