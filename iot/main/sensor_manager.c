#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"
#include <time.h>
#include "solace_manager.h"
#include "sensor_manager.h"
#include "cJSON.h"

#define SAMPLES 3
#define MEAN_COUNT 4
#define MOISTURE_SENSOR_PIN ADC1_CHANNEL_5	// GPIO 33


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
float adc_to_percentage(int adc_value) {
	return ((float)adc_value / 4095) * 100.0f;
}

// Sensordaten regelmäßig lesen
void read_sensordata(void *pvParameter) {
	int values[SAMPLES];
	int moistureMeans[MEAN_COUNT];
	//char timestamps[SAMPLES][20];
	int valueIndex = 0;
	int meanIndex = 0;

	while (1) {
		// ADC-Wert einlesen
		int adc_reading = adc1_get_raw(MOISTURE_SENSOR_PIN);
		values[valueIndex] = adc_reading;

		// TODO: Zeitstempel einlesen und im Array speichern
		//sprintf(timestamps[index], "%s", get_timestamp());  // Zeitstempel in das Array schreiben

		// Prüfen ob 3 Messungen vorliegen
		if (valueIndex >= SAMPLES - 1) {
			moistureMeans[meanIndex] = compute_mean(values);

			if (meanIndex >= MEAN_COUNT - 1) {
				// JSON Nachricht erstellen und schicken
				cJSON *sensors[1];
				sensors[0] = create_json_sensor("sid", "did", moistureMeans, MEAN_COUNT, "moisture", "%", "active");
				char *msg = create_json_message("did", sensors, 1);
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

// Funktion zur Initialisierung des ADC (Analog-Digital-Wandler)
void adc_init(void) {
	adc1_config_width(ADC_WIDTH_BIT_12);            // 12-Bit-Auflösung (0 - 4095)
	adc1_config_channel_atten(MOISTURE_SENSOR_PIN, ADC_ATTEN_DB_0);
	xTaskCreate(&read_sensordata, "read_sensordata", 8192, NULL, 5, NULL);
}