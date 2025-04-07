#include "sensor_manager.h"
#include "cJSON.h"
#include "driver/adc.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "solace_manager.h"
#include <stdio.h>
#include <string.h>
#include <time.h>

#define SAMPLES 3
#define MEAN_COUNT 4
#define MOISTURE_SENSOR_PIN ADC1_CHANNEL_5	// GPIO 33
#ifndef ADC_ATTEN_11db
#define ADC_ATTEN_11db ADC_ATTEN_DB_11
#endif


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
	/*
	if (feuchtigkeit > 75) {Erde ist sehr nass → nicht gießen}
	else if (feuchtigkeit > 45) {Alles im grünen Bereich → kein Gießen nötig}
	else if (feuchtigkeit > 30) {Wird langsam trocken → Gießen bald empfehlenswert}
	else {Sehr trocken → Gießen JETZT!}
	 */
	const int dry = 4095;   // maximal trocken
	const int wet = 1450;   // maximal nass

	// Clamp ADC value to [wet, dry]
	if (adc_value > dry) adc_value = dry;
	if (adc_value < wet) adc_value = wet;

	// Linear mapping
	return ((float)(dry - adc_value) / (float)(dry - wet)) * 100.0f;
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

// Sensordaten regelmäßig lesen
void read_sensordata(void *pvParameter) {
	int values[SAMPLES];
	int moistureMeans[MEAN_COUNT];
	char timestamps[SAMPLES][20];
	char meanTimestamps[MEAN_COUNT][20];
	char lastCall[20];
	int valueIndex = 0;
	int meanIndex = 0;
	char status[10];

	while (1) {
		// ADC-Wert einlesen
		int adc_reading = adc1_get_raw(MOISTURE_SENSOR_PIN);
		values[valueIndex] = adc_reading;

		// Zeitstempel speichern
		sprintf(timestamps[valueIndex], "%s", get_timestamp());

		// Prüfen ob 3 Messungen vorliegen
		if (valueIndex >= SAMPLES - 1) {
			int mean_adc = compute_mean(values);
			float moisture_percentage = adc_to_percentage(mean_adc);
			moistureMeans[meanIndex] = (int)moisture_percentage;

			bool sensor_active = is_sensor_active(values, SAMPLES);
			strcpy(status, sensor_active ? "active" : "inactive");

			// Timestamp des letzten Samples als Zeitstempel für den Mittelwert verwenden
			strcpy(meanTimestamps[meanIndex], timestamps[1]);

			// Zeitpunkt des letzten Einzel-Samples
			strcpy(lastCall, timestamps[SAMPLES - 1]);

			if (meanIndex >= MEAN_COUNT - 1) {
				// JSON Nachricht erstellen und schicken
				cJSON *sensors[1];
				sensors[0] = create_json_sensor("sid", "did", moistureMeans, MEAN_COUNT, "moisture", "%", status, meanTimestamps, lastCall);
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
	adc1_config_channel_atten(MOISTURE_SENSOR_PIN, ADC_ATTEN_11db);
	xTaskCreate(&read_sensordata, "read_sensordata", 8192, NULL, 5, NULL);
}