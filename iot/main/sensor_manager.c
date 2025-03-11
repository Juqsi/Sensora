#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"
#include <time.h>
#include "solace_manager.h"
#include "sensor_manager.h"

#define SAMPLES 4
#define MOISTURE_TAG "MOISTURE_SENSOR"
#define MOISTURE_SENSOR_PIN ADC1_CHANNEL_5	// GPIO 33


// Funktion zum Berechnen des Mittelwertes
int compute_mean(int values[]) {
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

// Bodenfeuchtigkeit regelmäßig lesen
void read_moisture(void *pvParameter) {
	int values[SAMPLES];
	char timestamps[SAMPLES][20];
	int index = 0;
	int moisture_mean = 0;

	while (1) {
		// ADC-Wert einlesen
		int adc_reading = adc1_get_raw(MOISTURE_SENSOR_PIN);
		values[index] = adc_reading;

		// Zeitstempel einlesen und im Array speichern
		//sprintf(timestamps[index], "%s", get_timestamp());  // Zeitstempel in das Array schreiben

		if (index >= SAMPLES) {
			moisture_mean = compute_mean(values);

			char str[50];
			sprintf(str, "Moisture: %d", moisture_mean);
			send_message(str);

			index = 0;
		} else {
			index++;
		}

		vTaskDelay(pdMS_TO_TICKS(10000)); // Warte 30 Sekunden
	}
}

// Funktion zur Initialisierung des ADC (Analog-Digital-Wandler)
void adc_init(void) {
	adc1_config_width(ADC_WIDTH_BIT_12);            // 12-Bit-Auflösung (0 - 4095)
	adc1_config_channel_atten(MOISTURE_SENSOR_PIN, ADC_ATTEN_DB_0);
	xTaskCreate(&read_moisture, "read_moisture", 2048, NULL, 5, NULL);
}