use std::ops::Deref;
use chrono::NaiveDateTime;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::value::Value;

impl Selectable for Value {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.values
        WHERE
            vid = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let value = Value::from_row(&row).await?;

        Ok(value)
    }

    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut values = vec![];

        for vid in keys {
            values.push(Value::select(vid).await?);
        }

        Ok(values)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.values
        WHERE
            {} = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut values = vec![];
        for row in rows {
            values.push(Value::from_row(&row).await?);
        }

        Ok(values)
    }
}

impl Insertable for Value {
    async fn insert(&self) -> Result<Self, Error> {

        let mut builder = InsertBuilder::new("sensora.values".to_string());

        if let Some(vid) = &self.vid {
            builder.push("vid", vid.clone());
        } else {
            builder.push("vid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(value) = &self.value {
            builder.push("value", value.clone());
        } else {
            return Err(Error::Protocol("value is required".to_string()))
        }

        if let Some(timestamp) = &self.timestamp {
            builder.push("timestamp", timestamp.clone());
        } else {
            return Err(Error::Protocol("timestamp is required".to_string()))
        }

        if let Some(sensor) = &self.sensor {
            builder.push("sensor", sensor.clone());
        } else {
            return Err(Error::Protocol("sensor is required".to_string()))
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let value = Value::from_row(&row).await?;

        Ok(value)
    }
}

impl Updatable for Value {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.value
        SET \n");

        if let Some(sid) = &self.vid {
            builder.push("sid = ");
            builder.push_bind(sid.clone());
            builder.push(",\n");
        }

        if let Some(value) = &self.value {
            builder.push("value = ");
            builder.push_bind(value.clone());
            builder.push(",\n");
        }

        if let Some(timestamp) = &self.timestamp {
            builder.push("timestamp = ");
            builder.push_bind(timestamp.clone());
            builder.push(",\n");
        }

        if let Some(sensor) = &self.sensor {
            builder.push("sensor = ");
            builder.push_bind(sensor.clone());
            builder.push(",\n");
        }

        builder.trim_query(2);

        builder.push("\n
        WHERE
            vid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let value = Value::from_row(&row).await?;

        Ok(value)
    }
}

impl Deletable for Value {
    async fn delete(&self) -> Result<Self, Error> {

        if self.vid.is_none() {
            return Err(Error::Protocol("vid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensor.sensor WHERE sid = ");
        builder.push_bind(self.vid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let value = Value::from_row(&row).await?;

        Ok(value)
    }
}

impl FromRow for Value {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Value {
                vid: match row.try_get("vid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                value: match row.try_get("value") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                timestamp: match row.try_get("timestamp") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                sensor: match row.try_get("sensor") {
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

impl Operable for Value {}

impl Value {
    pub async fn select_by_sensor_with_time(key: String, from: NaiveDateTime, to: NaiveDateTime) -> Result<Vec<Self>, Error> {

        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.values
        WHERE
            sensor = ");
        builder.push_bind(key);
        builder.push(" AND
            \"timestamp\" > ");
        builder.push_bind(from);
        builder.push(" AND
            \"timestamp\" < ");
        builder.push_bind(to);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut values = vec![];
        for row in rows {
            values.push(Value::from_row(&row).await?);
        }

        Ok(values)
    }

    pub async fn select_by_plant_with_time(key: String, from: NaiveDateTime, to: NaiveDateTime) -> Result<Vec<Self>, Error> {

        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.values
        WHERE
            plant = ");
        builder.push_bind(key);
        builder.push(" AND
            \"timestamp\" > ");
        builder.push_bind(from);
        builder.push(" AND
            \"timestamp\" < ");
        builder.push_bind(to);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut values = vec![];
        for row in rows {
            values.push(Value::from_row(&row).await?);
        }

        Ok(values)
    }
}
