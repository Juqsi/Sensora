use std::ops::Deref;
use chrono::{Days, NaiveDateTime, Utc};
use sqlx::{Error, Row};
use sqlx::postgres::PgRow;
use crate::database::{Deletable, FromRow, Insertable, Operable, Selectable, Updatable, DATABASE_POOL};
use crate::database::query_builder::{Builder, InsertBuilder};
use crate::models::controller::Controller;
use crate::models::plant::Plant;
use crate::models::sensor::Sensor;
use crate::models::target_value::TargetValue;
use crate::models::value::Value;

impl Selectable for Plant {
    async fn select(key: String) -> Result<Self, Error> {
        let mut builder = Builder::new();
        builder.push("SELECT
            *
        FROM
            sensora.plants
        WHERE
            pid = ");
        builder.push_bind(key);

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let plant = Plant::from_row(&row).await?;

        Ok(plant)
    }

    async fn select_multiple(keys: Vec<String>) -> Result<Vec<Self>, Error> {
        let mut plants = vec![];

        for pid in keys {
            plants.push(Plant::select(pid).await?);
        }

        Ok(plants)
    }

    async fn select_by(column: String, key: String) -> Result<Vec<Self>, Error> {
        let mut builder = Builder::new();
        builder.push(format!("SELECT
            *
        FROM
            sensora.plants
        WHERE
            {} = ", column).as_str());
        builder.push_bind(key);

        let rows = builder.to_query().fetch_all(DATABASE_POOL.deref()).await?;

        let mut plants = vec![];

        for row in rows {
            plants.push(Plant::from_row(&row).await?);
        }

        Ok(plants)
    }
}

impl Insertable for Plant {
    async fn insert(&self) -> Result<Self, Error> {
        let mut builder = InsertBuilder::new("sensora.plants".to_string());

        if let Some(pid) = &self.pid {
            builder.push("pid", pid.clone());
        } else {
            builder.push("pid", uuid::Uuid::new_v4().to_string());
        }

        if let Some(name) = &self.name {
            builder.push("name", name.clone());
        } else {
            return Err(Error::Protocol("name is required".to_string()))
        }

        if let Some(room) = &self.room {
            builder.push("room", room.clone());
        } else {
            return Err(Error::Protocol("room is required".to_string()))
        }

        if let Some(note) = &self.note {
            builder.push("note", note.clone());
        }

        if let Some(variant) = &self.variant {
            builder.push("variant", variant.clone());
        }

        if let Some(avatar) = &self.avatar {
            builder.push("avatar", avatar.clone());
        }

        builder.returning(Some("*".to_string()));

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let mut plant = Plant::from_row(&row).await?;

        if let Some(mut target_values) = self.target_values.clone() {
            for target_value in target_values.iter_mut() {
                target_value.plant = Some(plant.pid.clone().unwrap());
                *target_value = target_value.insert().await?;
            }
            plant.target_values = Some(target_values)
        }

        Ok(plant)
    }
}

impl Updatable for Plant {
    async fn update(&self, key: String) -> Result<Self, Error> {

        let mut builder = Builder::new();
        builder.push("UPDATE
            sensora.plants
        SET \n");

        if let Some(pid) = &self.pid {
            builder.push("pid = ");
            builder.push_bind(pid.clone());
            builder.push(",\n");
        }

        if let Some(name) = &self.name {
            builder.push("name = ");
            builder.push_bind(name.clone());
            builder.push(",\n");
        }

        builder.push("note = ");
        builder.push_bind(self.note.clone());
        builder.push(",\n");


        builder.push("variant = ");
        builder.push_bind(self.variant.clone());
        builder.push(",\n");


        builder.push("avatar = ");
        builder.push_bind(self.avatar.clone());
        builder.push(",\n");


        if let Some(room) = &self.room {
            builder.push("room = ");
            builder.push_bind(room.clone());
            builder.push(",\n");
        }

        builder.trim_query(2);

        builder.push("\n
        WHERE
            pid = ");
        builder.push_bind(key);

        builder.push("\n
        RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let plant = Plant::from_row(&row).await?;

        Ok(plant)
    }
}

impl Deletable for Plant {
    async fn delete(&self) -> Result<Self, Error> {

        if self.pid.is_none() {
            return Err(Error::Protocol("pid is required".to_string()))
        }

        let mut builder = Builder::new();
        builder.push("DELETE FROM sensor.plants WHERE pid = ");
        builder.push_bind(self.pid.clone());

        builder.push(" RETURNING *;");

        let row = builder.to_query().fetch_one(DATABASE_POOL.deref()).await?;

        let plant = Plant::from_row(&row).await?;

        Ok(plant)
    }
}

impl FromRow for Plant {
    async fn from_row(row: &PgRow) -> Result<Self, Error> {
        Ok(
            Plant {
                pid: match row.try_get("pid") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                name: match row.try_get("name") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                note: match row.try_get("note") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                variant: match row.try_get("variant") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                avatar: match row.try_get("avatar") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                room: match row.try_get("room") {
                    Ok(row_value) => Some(row_value),
                    Err(_) => None,
                },
                target_values: match row.try_get("pid") {
                    Ok(row_value) => {
                        Some(
                            TargetValue::select_by("plant".to_string(), row_value).await?
                        )
                    },
                    Err(_) => None,
                },
                controllers: match row.try_get::<String, &str>("pid") {
                    Ok(row_value) => {
                        let from = Utc::now().naive_utc().checked_sub_days(Days::new(1)).unwrap();
                        let to = Utc::now().naive_utc();
                        Some(get_controllers(row_value, from, to).await?)
                    },
                    Err(_) => None,
                }
            }
        )
    }
}

impl Operable for Plant {}

impl Plant {
    pub async fn select_with_time(key: String, from: NaiveDateTime, to: NaiveDateTime) -> Result<Self, Error> {
        let mut plant = Plant::select(key).await?;

        plant.controllers = Some(get_controllers(plant.pid.clone().unwrap(), from, to).await?);

        Ok(plant)
    }
}

async fn get_controllers(pid: String, from: NaiveDateTime, to: NaiveDateTime) -> Result<Vec<Controller>, Error> {

    let values = Value::select_by_plant_with_time(pid.clone(), from, to).await?;
    let mut sensor_ids: Vec<String> = vec![];
    for value in &values {
        if !sensor_ids.contains(&value.sensor.clone().unwrap()) {
            sensor_ids.push(value.sensor.clone().unwrap());
        }
    }

    let mut sensors = Sensor::select_multiple(sensor_ids).await?;

    let additional_sensors = Sensor::select_by("plant".to_string(), pid).await?;
    for mut s in additional_sensors {

        if let Some(item) = sensors.iter_mut().find(|item| item.sid.as_deref() == s.sid.as_deref()) {
            item.currently_assigned = Some(true);
        } else {
            s.currently_assigned = Some(true);
            sensors.push(s);
        }
    }

    let mut controller_ids : Vec<String> = vec![];
    for sensor in &sensors {
        if !controller_ids.contains(&sensor.controller.clone().unwrap()) {
            controller_ids.push(sensor.controller.clone().unwrap());
        }
    }

    let mut controllers = Controller::select_multiple(controller_ids).await?;

    for sensor in sensors.iter_mut() {
        let sensor_vals = values.iter().cloned().filter(|value| value.sensor.as_deref() == sensor.sid.as_deref()).collect();
        sensor.values = Some(sensor_vals);
    }

    for controller in controllers.iter_mut() {
        let sensors = sensors.iter().cloned().filter(|sensor| sensor.controller.as_deref() == controller.did.as_deref()).collect();
        controller.sensors = Some(sensors);
    }

    Ok(controllers)
}
