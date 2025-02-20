#include "solace_manager.h"
#include <stdio.h>
#include <stdint.h>
#include "esp_log.h"
#include "mqtt_client.h"
#include "cJSON.h"

static const char *TAG = "MQTT_JSON_EXAMPLE";

// MQTT Konfiguration
#define MQTT_URI       "mqtt://admin:admin@192.168.137.1"
#define MQTT_TOPIC     "home/sensor/data"

// MQTT Event Handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
	esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;
	esp_mqtt_client_handle_t client = event->client;

	switch (event->event_id) {
	case MQTT_EVENT_CONNECTED:
		ESP_LOGI(TAG, "✅ MQTT verbunden");

		// JSON-Objekt erstellen
		cJSON *root = cJSON_CreateObject();
		cJSON_AddStringToObject(root, "sensor", "Temperatur");
		cJSON_AddNumberToObject(root, "wert", 23.5);
		cJSON_AddStringToObject(root, "einheit", "Celsius");
		char *json_str = cJSON_Print(root);

		// JSON-Daten an Solace senden
		esp_mqtt_client_publish(client, MQTT_TOPIC, json_str, 0, 1, 0);
		ESP_LOGI(TAG, "📡 Daten gesendet: %s", json_str);

		// Speicher freigeben
		cJSON_Delete(root);
		free(json_str);
		break;

	case MQTT_EVENT_DISCONNECTED:
		ESP_LOGI(TAG, "❌ MQTT getrennt");
		break;

	case MQTT_EVENT_ERROR:
		ESP_LOGE(TAG, "⚠️ MQTT Fehler aufgetreten");
		break;

	default:
		break;
	}
}

void solace_init(void) {
	ESP_LOGI(TAG, "🚀 Starte MQTT...");

	// MQTT Konfiguration und Start
	esp_mqtt_client_config_t mqtt_cfg = {
		.broker.address.uri = MQTT_URI
	};

	esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
	esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
	esp_mqtt_client_start(client);
}