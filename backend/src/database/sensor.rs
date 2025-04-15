use std::ops::Deref;
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::sensor::{Sensor, Status};
use sqlx::postgres::{PgTypeInfo};
use sqlx::{Decode, Encode, Postgres, Type};
use std::str::FromStr;
use chrono::NaiveDateTime;
use sqlx::encode::IsNull;
use sqlx::error::BoxDynError;
use crate::models::value::Value;

impl Type<Postgres> for Status {
    fn type_info() -> PgTypeInfo {
        PgTypeInfo::with_name("sensora.status")
    }
}

impl Encode<'_, Postgres> for Status {
    fn encode_by_ref(&self, buf: &mut sqlx::postgres::PgArgumentBuffer) -> Result<IsNull, BoxDynError> {
        let value = self.to_string();
        Encode::<Postgres>::encode_by_ref(&value, buf)
    }
}

impl<'r> Decode<'r, Postgres> for Status {
    fn decode(value: sqlx::postgres::PgValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let value = <String as Decode<Postgres>>::decode(value)?;
        Status::from_str(&value).map_err(Into::into)
    }
}

impl Selectable for Sensor {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.sensors
        WHERE
            sid = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let sensor = Sensor::from_row(&row).await?;

        Ok(sensor)
    }

    async fn select_multiple(key: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut sensors = vec![];

        for sid in key {
            sensors.push(Sensor::select(sid).await?);
        }

        Ok(sensors)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.sensors
        WHERE
            {} = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut sensors = vec![];

        for row in rows {
            sensors.push(Sensor::from_row(&row).await?);
        }

        Ok(sensors)
    }
}

impl Insertable for Sensor {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.sensors".to_string());

        if let Some(sid) = &self.sid {
            builder.push("sid", sid.clone());
        } else {
            builder.push("sid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(last_call) = &self.last_call {
            builder.push("last_call", last_call.clone());
        } else {
            return Err(Error::Protocol("last_call is required".to_string()))
        }

        if let Some(ilk) = &self.ilk {
            builder.push("ilk", ilk.clone());
        } else {
            return Err(Error::Protocol("ilk is required".to_string()))
        }

        if let Some(status) = &self.status {
            builder.push("status", status.clone());
        } else {
            return Err(Error::Protocol("status is required".to_string()))
        }

        if let Some(controller) = &self.controller {
            builder.push("controller", controller.clone());
        } else {
            return Err(Error::Protocol("controller is required".to_string()))
        }

        if let Some(unit) = &self.unit {
            builder.push("unit", unit.clone());
        }

        if let Some(plant) = &self.plant {
            builder.push("plant", plant.clone());
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let sensor = Sensor::from_row(&row).await?;

        Ok(sensor)
    }
}

impl Updatable for Sensor {
    async fn update(&self, key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.sensors
        SET \n");

        if let Some(sid) = &self.sid {
            builder.push("sid = ");
            builder.push_bind(sid.clone());
            builder.push(",\n");
        }

        if let Some(last_call) = &self.last_call {
            builder.push("last_call = ");
            builder.push_bind(last_call.clone());
            builder.push(",\n");
        }

        if let Some(ilk) = &self.ilk {
            builder.push("ilk = ");
            builder.push_bind(ilk.clone());
            builder.push(",\n");
        }

        if let Some(status) = &self.status {
            builder.push("status = ");
            builder.push_bind(status.clone());
            builder.push(",\n");
        }

        if let Some(controller) = &self.controller {
            builder.push("controller = ");
            builder.push_bind(controller.clone());
            builder.push(",\n");
        }

        if let Some(unit) = &self.unit {
            builder.push("unit = ");
            builder.push_bind(unit.clone());
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
            sid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let sensor = Sensor::from_row(&row).await?;

        Ok(sensor)
    }
}

impl Deletable for Sensor {
    async fn delete(&self) -> Result<Self, Error> {

        if self.sid.is_none() {
            return Err(Error::Protocol("sid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensor.sensor WHERE sid = ");
        builder.push_bind(self.sid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let sensor = Sensor::from_row(&row).await?;

        Ok(sensor)
    }
}

impl FromRow for Sensor {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Sensor {
                sid: match row.try_get("sid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                last_call: match row.try_get("last_call") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                ilk: match row.try_get("ilk") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                unit: match row.try_get("unit") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                status: match row.try_get("status") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                controller: match row.try_get("controller") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                values: match row.try_get("sid") {
                    Ok(row_value) => {
                        Some(
                            Value::select_by("sensor".to_string(), row_value).await?
                        )
                    },
                    Err(_) => None,
                },
                plant: match row.try_get("plant") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                group: match row.try_get("group") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                currently_assigned: None,
            }
        )
    }
}

impl Operable for Sensor {}

impl Sensor {
    pub async fn select_by_plant_with_time(key: String, from: NaiveDateTime, to: NaiveDateTime) -> Result<Vec<Self>, Error> {
        let mut sensors = Sensor::select_by("plant".to_string(), key).await?;

        for sensor in sensors.iter_mut() {
            let values = Value::select_by_sensor_with_time(sensor.sid.clone().unwrap(), from, to).await?;
            sensor.values = Some(values)
        }

        Ok(sensors)
    }

    pub async fn unlink_by_plant_id(plant: String) -> Result<(), Error> {
        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.sensors
        SET
            plant = null
        WHERE
            plant = ");
        builder.push_bind(plant.clone());

        builder.to_query().execute(DATABASE_POOL.deref()).await?;

        Ok(())
    }

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
            sid IN (  ");

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
