use std::ops::Deref;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::target_value::TargetValue;

impl Selectable for TargetValue {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.target_values
        WHERE
            tid = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let target_value = TargetValue::from_row(&row).await?;

        Ok(target_value)
    }

    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut target_values = vec![];

        for tid in keys {
            target_values.push(TargetValue::select(tid).await?);
        }

        Ok(target_values)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.target_values
        WHERE
            {} = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut target_values = vec![];

        for row in rows {
            target_values.push(TargetValue::from_row(&row).await?);
        }

        Ok(target_values)
    }
}

impl Insertable for TargetValue {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.target_values".to_string());

        if let Some(tid) = &self.tid {
            builder.push("tid", tid.clone());
        } else {
            builder.push("tid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(value) = &self.value {
            builder.push("value", value.clone());
        } else {
            return Err(Error::Protocol("value is required".to_string()))
        }

        if let Some(ilk) = &self.ilk {
            builder.push("ilk", ilk.clone());
        } else {
            return Err(Error::Protocol("ilk is required".to_string()))
        }

        if let Some(plant) = &self.plant {
            builder.push("plant", plant.clone());
        } else {
            return Err(Error::Protocol("plant is required".to_string()))
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let target_value = TargetValue::from_row(&row).await?;

        Ok(target_value)
    }
}

impl Updatable for TargetValue {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.target_values
        SET \n");

        if let Some(tid) = &self.tid {
            builder.push("tid = ");
            builder.push_bind(tid.clone());
            builder.push(",\n");
        }

        if let Some(value) = &self.value {
            builder.push("value = ");
            builder.push_bind(value.clone());
            builder.push(",\n");
        }

        if let Some(ilk) = &self.ilk {
            builder.push("ilk = ");
            builder.push_bind(ilk.clone());
            builder.push(",\n");
        }

        if let Some(plant) = &self.plant {
            builder.push("plant = ");
            builder.push_bind(plant.clone());
            builder.push(",\n");
        }

        builder.trim_query(2);

        builder.push("\n
        WHERE
            tid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let target_value = TargetValue::from_row(&row).await?;

        Ok(target_value)
    }
}

impl Deletable for TargetValue {
    async fn delete(&self) -> Result<Self, Error> {

        if self.tid.is_none() {
            return Err(Error::Protocol("tid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensor.sensor WHERE tid = ");
        builder.push_bind(self.tid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let target_value = TargetValue::from_row(&row).await?;

        Ok(target_value)
    }
}

impl FromRow for TargetValue {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            TargetValue {
                tid: match row.try_get("tid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                value: match row.try_get("value") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                ilk: match row.try_get("ilk") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                plant: match row.try_get("plant") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
            }
        )
    }
}

impl Operable for TargetValue {}

impl TargetValue {
    pub  async fn delete_by_plant(plant: String) -> Result<(), Error> {
        let mut builder = Builder::new();
        builder.push("DELETE FROM
            sensora.target_values
        WHERE
            plant = ");
        builder.push_bind(plant);

        builder.to_query().execute(DATABASE_POOL.deref()).await?;

        Ok(())
    }
}
