#include "sensor_manager.h"
#include "cJSON.h"
#include "dht.h"
#include "bh1750.h"
#include "driver/adc.h"
#include "driver/i2c.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "solace_manager.h"
#include "pump_manager.h"
#include <stdio.h>
#include <string.h>
#include <time.h>

#define SAMPLES 3
#define MEAN_COUNT 4
#define MOISTURE_SENSOR_PIN ADC1_CHANNEL_5	// GPIO 33
#define TEMP_HUM_SENSOR_PIN GPIO_NUM_25
#define LUM_GPIO_SDA  21
#define LUM_GPIO_SCL  22
#define LUM_I2C_PORT  I2C_NUM_0
#define DRY 4095
#define WET 1450
#ifndef ADC_ATTEN_11db
#define ADC_ATTEN_11db ADC_ATTEN_DB_11
#endif


// Globale Device-Struktur des BH1750
static i2c_dev_t bh1750_dev;

// Funktion zum Berechnen des Mittelwertes
int compute_mean(const int values[]) {
	int sum = 0;
	for (int i = 0; i < SAMPLES; i++) {
		sum += values[i];
	}
	int mean = sum / SAMPLES;

	return mean;
}

// Funktion, um den aktuellen Zeitstempel zu bekommen
char* get_timestamp() {
	static char timestamp[20];
	struct tm timeinfo;

	// Aktuelle Zeit holen
	time_t now;
	time(&now);

	// Umwandlung der Zeit in eine tm-Struktur (lokale Zeit)
	localtime_r(&now, &timeinfo);

	// Formatieren des Zeitstempels in das gewünschte Format "YYYY-MM-DDTHH:MM:SSZ"
	strftime(timestamp, 20, "%Y-%m-%dT%H:%M:%SZ", &timeinfo);

	return timestamp;
}

// Umrechnung des ADC-Werts auf Prozent
float adc_to_percentage(int adc_value, int max, int min) {
	// Clamp ADC value to [max, min]
	if (adc_value > max) adc_value = max;
	if (adc_value < min) adc_value = min;

	// Linear mapping
	return ((float)(max - adc_value) / (float)(max - min)) * 100.0f;
}

// Funktion zur Rundung (funktioniert für positive Werte)
static inline int round_value(int16_t value) {
	return (value + 5) / 10;
}

// Prüfung ob Sensor aktiv
bool is_sensor_active(const int values[], int sampleCount) {
	for (int i = 0; i < sampleCount; i++) {
		if (values[i] <= 0 || values[i] >= 4095) {
			return false;
		}
	}
	return true;
}

// Debug-Funktion zum Überprüfen, ob I2C-Gerät erkannt wurde
void i2c_scanner(void) {
	ESP_LOGI("SCANNER", "Starte I²C-Scan auf Port %d...", LUM_I2C_PORT);
	for (uint8_t addr = 1; addr < 127; addr++) {
		i2c_cmd_handle_t cmd = i2c_cmd_link_create();
		i2c_master_start(cmd);
		i2c_master_write_byte(cmd, (addr << 1) | I2C_MASTER_WRITE, true);
		i2c_master_stop(cmd);
		esp_err_t err = i2c_master_cmd_begin(LUM_I2C_PORT, cmd, pdMS_TO_TICKS(100));
		i2c_cmd_link_delete(cmd);
		if (err == ESP_OK) {
			ESP_LOGI("I2C_SCANNER", "Gerät gefunden bei Adresse: 0x%02X", addr);
			break;
		} else {
			ESP_LOGI("I2C_SCANNER", "Adresse 0x%02X, Error: %s", addr, esp_err_to_name(err));
		}
		vTaskDelay(pdMS_TO_TICKS(10));
	}
}

// Sensordaten regelmäßig lesen
void read_sensordata(void *pvParameter) {
	int moistureVals[SAMPLES], tempVals[SAMPLES], humVals[SAMPLES], lumVals[SAMPLES];
	int moistureMeans[MEAN_COUNT], tempMeans[MEAN_COUNT], humMeans[MEAN_COUNT], lumMeans[MEAN_COUNT];
	char timestamps[SAMPLES][20];
	char meanTimestamps[MEAN_COUNT][20];
	char lastCall[20];
	int valueIndex = 0;
	int meanIndex = 0;
	char moisture_sensor_status[10], temp_hum_sensor_status[10], lum_sensor_status[10];

	while (1) {
		UBaseType_t freeWords = uxTaskGetStackHighWaterMark(NULL);
		ESP_LOGI("OVERFLOW_CHECK", "💫 Freier Stack: %d Bytes", freeWords * sizeof(StackType_t));

		// Sensor-Werte einlesen
		moistureVals[valueIndex] = (int)adc_to_percentage(adc1_get_raw(MOISTURE_SENSOR_PIN), DRY, WET);
		ESP_LOGI("MOISTURE", "Gemessene Bodenfeuchte: %d%%", moistureVals[valueIndex]);

		// Bewässerungslogik abrufen
		int duration = calculate_watering_duration(moistureVals[valueIndex]);
		if (duration == 0) {
			if (pumpQueue != NULL) {
				xQueueReset(pumpQueue);
				ESP_LOGI("PUMP_TASK",
						 "Bodenfeuchte ausreichend, Pumpen-Queue geleert.");
			}
		} else {
			pump_params_t cmd;
			cmd.duration = duration;
			if (pump_send_command(&cmd, pdMS_TO_TICKS(100)) != pdPASS) {
				ESP_LOGE("PUMP_TASK", "Fehler beim Senden des Pumpenbefehls");
			}
		}

		int16_t humidity = 0;
		int16_t temperature = 0;
		esp_err_t err_dht11 = dht_read_data(DHT_TYPE_DHT11, TEMP_HUM_SENSOR_PIN, &humidity, &temperature);
		if (err_dht11 != ESP_OK) {
			ESP_LOGE("SENSOR_TASK", "DHT11 Read Fehler: %s", esp_err_to_name(err_dht11));
			vTaskDelay(pdMS_TO_TICKS(10));
		}
		tempVals[valueIndex] = round_value(temperature);
		ESP_LOGI("TEMP", "Gemessene Temperatur: %d °C", tempVals[valueIndex]);
		humVals[valueIndex] = round_value(humidity);
		ESP_LOGI("HUM", "Gemessene Luftfeuchte: %d%%", humVals[valueIndex]);

		uint16_t raw_lux = 0;
		esp_err_t err_bh1750 = bh1750_read(&bh1750_dev, &raw_lux);
		if (err_bh1750 != ESP_OK) {
			ESP_LOGE("SENSOR_TASK", "BH1750 Read Fehler: %s", esp_err_to_name(err_bh1750));
			vTaskDelay(pdMS_TO_TICKS(10));
		}
		lumVals[valueIndex] = (int)(((float)raw_lux / 1.2f) + 0.5f);
		ESP_LOGI("LUM", "Gemessene Beleuchtungsstärke: %d%%", lumVals[valueIndex]);

		// Zeitstempel speichern
		sprintf(timestamps[valueIndex], "%s", get_timestamp());

		// Prüfen ob 3 Messungen vorliegen
		if (valueIndex >= SAMPLES - 1) {
			moistureMeans[meanIndex] = compute_mean(moistureVals);
			tempMeans[meanIndex] = compute_mean(tempVals);
			humMeans[meanIndex] = compute_mean(humVals);
			lumMeans[meanIndex] = compute_mean(lumVals);

			strcpy(moisture_sensor_status, is_sensor_active(moistureVals, SAMPLES) ? "active" : "inactive");
			strcpy(temp_hum_sensor_status, (is_sensor_active(tempVals, SAMPLES) && is_sensor_active(humVals, SAMPLES)) ? "active" : "inactive");
			strcpy(lum_sensor_status, is_sensor_active(lumVals, SAMPLES) ? "active" : "inactive");

			// Timestamp des letzten Samples als Zeitstempel für den Mittelwert verwenden
			strcpy(meanTimestamps[meanIndex], timestamps[1]);

			// Zeitpunkt des letzten Einzel-Samples
			strcpy(lastCall, timestamps[SAMPLES - 1]);

			if (meanIndex >= MEAN_COUNT - 1) {
				// JSON Nachricht erstellen und schicken
				cJSON *sensors[4];
				sensors[0] = create_json_sensor(MOISTURE_SID, DID, moistureMeans, MEAN_COUNT, "moisture", "%",
					moisture_sensor_status, meanTimestamps, lastCall);
				sensors[1] = create_json_sensor(TEMP_SID, DID, tempMeans, MEAN_COUNT, "temperature", "°C",
												temp_hum_sensor_status, meanTimestamps, lastCall);
				sensors[2] = create_json_sensor(HUM_SID, DID, humMeans, MEAN_COUNT, "humidity", "%",
												temp_hum_sensor_status, meanTimestamps, lastCall);
				sensors[3] = create_json_sensor(LUM_SID, DID, lumMeans, MEAN_COUNT, "illuminance", "lx",
												lum_sensor_status, meanTimestamps, lastCall);
				char *msg = create_json_message(DID, sensors, 4);
				send_message(msg);

				meanIndex = 0;
			} else {
				meanIndex++;
			}
			valueIndex = 0;
		} else {
			valueIndex++;
		}
		vTaskDelay(pdMS_TO_TICKS(10000)); // Warte 10 Sekunden
	}
}

// Funktion zur Sensor-Initialisierung und Start der Messung
void sensor_init(void) {
	adc1_config_width(ADC_WIDTH_BIT_12);	// 12-Bit-Auflösung (0 - 4095)
	adc1_config_channel_atten(MOISTURE_SENSOR_PIN, ADC_ATTEN_11db);
	i2c_scanner();
	bh1750_init_desc(&bh1750_dev, BH1750_ADDR_LO, LUM_I2C_PORT, LUM_GPIO_SDA, LUM_GPIO_SCL);
	esp_err_t err = bh1750_power_on(&bh1750_dev);
	if (err != ESP_OK) {
		ESP_LOGE("SENSOR_INIT", "BH1750 Power On fehlgeschlagen: %s", esp_err_to_name(err));
	}
	bh1750_setup(&bh1750_dev, BH1750_MODE_CONTINUOUS, BH1750_RES_HIGH);

	xTaskCreatePinnedToCore(&read_sensordata, "read_sensordata", 8192, NULL, 2, NULL, 1);
}