#include "solace_manager.h"
#include <stdio.h>
#include <stdint.h>
#include "esp_log.h"
#include "mqtt_client.h"
#include "cJSON.h"
#include "led_control.h"

static const char *TAG = "MQTT_JSON_EXAMPLE";

// MQTT Konfiguration
#define MQTT_URI       "mqtt://192.168.137.1"
#define MQTT_USERNAME	"esp"
#define MQTT_PASSWORD	"esp"
#define MQTT_CLIENT_ID	"ESP32-1"
#define MQTT_TOPIC_SEND     "sensora/v1/send/id"
#define MQTT_TOPIC_RECEIVE     "sensora/v1/receive/id"

// Funktion zur Verarbeitung der empfangenen JSON-Daten
void process_json_message(const char *json_str) {
	// JSON parsen
	cJSON *root = cJSON_Parse(json_str);
	if (root == NULL) {
		ESP_LOGE(TAG, "Fehler beim Parsen der JSON-Daten");
		return;
	}

	// JSON-Daten extrahieren
	cJSON *sensor = cJSON_GetObjectItem(root, "sensor");
	cJSON *wert = cJSON_GetObjectItem(root, "wert");
	cJSON *einheit = cJSON_GetObjectItem(root, "einheit");

	// Überprüfen und Ausgabe
	if (cJSON_IsString(sensor) && cJSON_IsNumber(wert) && cJSON_IsString(einheit)) {
		ESP_LOGI(TAG, "📊 Sensor: %s, Wert: %.2f %s",
				 sensor->valuestring, wert->valuedouble, einheit->valuestring);
	} else {
		ESP_LOGE(TAG, "Fehlerhafte JSON-Daten empfangen.");
	}

	// Speicher freigeben
	cJSON_Delete(root);
}

// MQTT Event Handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
	esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;
	esp_mqtt_client_handle_t client = event->client;

	switch (event->event_id) {
	case MQTT_EVENT_CONNECTED:
		ESP_LOGI(TAG, "✅ MQTT verbunden");

		// Topic abonnieren
		esp_mqtt_client_subscribe(client, MQTT_TOPIC_RECEIVE, 1);

		// JSON-Objekt erstellen
		cJSON *root = cJSON_CreateObject();
		cJSON_AddStringToObject(root, "sensor", "Temperatur");
		cJSON_AddNumberToObject(root, "wert", 23.5);
		cJSON_AddStringToObject(root, "einheit", "Celsius");
		char *json_str = cJSON_Print(root);

		// JSON-Daten an Solace senden
		esp_mqtt_client_enqueue(client, MQTT_TOPIC_SEND, json_str, 0, 1, 1, true);
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

	case MQTT_EVENT_DATA:
		ESP_LOGI(TAG, "📨 Nachricht erhalten");
		led_blink_start();
		esp_mqtt_client_enqueue(client, MQTT_TOPIC_SEND, "Nachricht erhalten!", 0, 1, 1, true);
		break;

	default:
		break;
	}
}

void solace_init(void) {
	ESP_LOGI(TAG, "🚀 Starte MQTT...");

	// MQTT Konfiguration und Start
	esp_mqtt_client_config_t mqtt_cfg = {
		.broker.address.uri = MQTT_URI,
		.credentials.username = MQTT_USERNAME,
		.credentials.authentication.password = MQTT_PASSWORD,
		.credentials.client_id = MQTT_CLIENT_ID,
		.session.disable_clean_session = true,
		.session.keepalive = 10,
	};

	esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
	esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
	esp_mqtt_client_start(client);
}