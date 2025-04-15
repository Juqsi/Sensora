use std::ops::Deref;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::controller::Controller;
use crate::models::user::User;

impl Selectable for Controller {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.controllers
        WHERE
            did = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let controller = Controller::from_row(&row).await?;

        Ok(controller)
    }

    async fn select_multiple(key: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut controllers = vec![];

        for did in key {
            controllers.push(Controller::select(did).await?);
        }

        Ok(controllers)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.controllers
        WHERE
            {} = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut controllers = vec![];

        for row in rows {
            controllers.push(Controller::from_row(&row).await?);
        }

        Ok(controllers)
    }
}

impl Insertable for Controller {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.controllers".to_string());

        if let Some(did) = &self.did {
            builder.push("did", did.clone());
        } else {
            builder.push("did", uuid::Uuid::new_v4().to_string());
        }

        if let Some(secret) = &self.secret {
            builder.push("secret", secret.clone());
        } else {
            return Err(Error::Protocol("secret is required".to_string()))
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

        if let Some(model) = &self.model {
            builder.push("model", model.clone());
        }

        builder.returning(Some("*".to_string()));
        
        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;
        
        let controller = Controller::from_row(&row).await?;

        Ok(controller)
    }
}

impl Updatable for Controller {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sesnora.controllers
        SET \n");

        if let Some(did) = &self.did {
            builder.push("did = ");
            builder.push_bind(did.clone());
            builder.push(",\n");
        }

        if let Some(secret) = &self.secret {
            builder.push("secret = ");
            builder.push_bind(secret.clone());
            builder.push(",\n");
        }

        if let Some(owner) = &self.owner {
            if let Some(username) = owner.username.clone() {
                builder.push("owner = ");
                builder.push_bind(username.clone());
                builder.push(",\n");
            } else {
                return Err(Error::Protocol("owner.username is required".to_string()))
            }
        }

        if let Some(model) = &self.model {
            builder.push("model = ");
            builder.push_bind(model.clone());
            builder.push(",\n");
        }
        
        builder.trim_query(2);
        
        builder.push("\n
        WHERE
            did = ");
        builder.push_bind(key);
        
        builder.push("\n
        RETURNING *;");
        
        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;
        let controller = Controller::from_row(&row).await?;
        
        Ok(controller)
    }
}

impl Deletable for Controller {
    async fn delete(&self) -> Result<Self, Error> {

        if self.did.is_none() {
            return Err(Error::Protocol("did is required".to_string()))
        }
        
        let mut builder = Builder::new();
        builder.push("DELETE FROM sensora.controllers WHERE did = ");
        builder.push_bind(self.did.clone().unwrap());
        
        builder.push(" RETURNING *;");
        
        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;
        
        let controller = Controller::from_row(&row).await?;
        
        Ok(controller)
    }
}

impl FromRow for Controller {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Controller {
                did: match row.try_get("did") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                model: match row.try_get("model") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                sensors: Some(vec![]),
                owner: match row.try_get("owner") {
                    Ok(row_value) => {
                        let mut user = User::select(row_value).await?;
                        user.password = None;
                        user.group_ids = None;
                        Some(user)
                    },
                    Err(_) => None,
                },
                secret: match row.try_get("secret") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
            }
        )
    }
}

impl Operable for Controller {}

impl Controller {
    pub async fn link_to_plant_id(keys: Vec<String>, plant: String) -> Result<(), Error> {
        if keys.is_empty() {
            return Ok(())
        }

        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.sensors
        SET
            plant = ");
        builder.push_bind(plant.clone());
        builder.push("
        WHERE
            controller IN (  ");

        for key in keys {
            builder.push_bind(key);
            builder.push(", ");
        }

        builder.trim_query(2);
        builder.push(");");

        builder.to_query().execute(DATABASE_POOL.deref()).await?;

        Ok(())
    }
}
