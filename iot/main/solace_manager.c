#include "solace_manager.h"
#include <stdio.h>
#include <stdint.h>
#include "esp_log.h"
#include "mqtt_client.h"
#include "cJSON.h"
#include "nvs_flash.h"

// MQTT Konfiguration
#define MQTT_URI       "mqtt://192.168.137.1"
#define MQTT_USERNAME	"esp"
#define MQTT_PASSWORD	"esp"
#define MQTT_CLIENT_ID	"ESP32-1"
#define MQTT_TOPIC_SEND     "sensora/v1/send/id"
#define MQTT_TOPIC_RECEIVE     "sensora/v1/receive/id"
#define MODEL	"FullControll-4-Sensors"
#define NVS_NAMESPACE "storage"

static const char *TAG = "SOLACE_MANAGER";

// Globaler MQTT-Client
static esp_mqtt_client_handle_t client;

// Funktion um JSON für einen Sensor zu erstellen
cJSON* create_json_sensor(char sid[], char did[], int values[], int valueCount, char ilk[], char unit[], char status[], char timestamps[][20], char lastCall[20]) {
	// Sensor-Objekt erstellen
	cJSON *sensor_obj = cJSON_CreateObject();

	cJSON_AddStringToObject(sensor_obj, "sid", sid);
	cJSON_AddStringToObject(sensor_obj, "lastCall", lastCall);
	cJSON_AddStringToObject(sensor_obj, "controller", did);

	// Values pro Sensor hinzufügen
	cJSON *values_array = cJSON_CreateArray();
	for (int i = 0; i < valueCount; i++) {
		// Value-Objekt erstellen
		cJSON *value_obj = cJSON_CreateObject();

		// Value-Objekt füllen
		cJSON_AddStringToObject(value_obj, "timestamp", timestamps[i]);
		cJSON_AddNumberToObject(value_obj, "value", values[i]);

		// Value-Objekt zum Array hinzufügen
		cJSON_AddItemToArray(values_array, value_obj);
	}

	// Values-Array zum Sensor hinzufügen
	cJSON_AddItemToObject(sensor_obj, "values", values_array);

	cJSON_AddStringToObject(sensor_obj, "ilk", ilk);
	cJSON_AddStringToObject(sensor_obj, "unit", unit);
	cJSON_AddStringToObject(sensor_obj, "status", status);

	return sensor_obj;
}

// Funktion um JSON für Controller zu erstellen
char* create_json_message(char did[], cJSON *sensors[], int num_sensors) {
	// Root-Objekt erstellen
	cJSON *root = cJSON_CreateObject();
	if (root == NULL) {
		ESP_LOGE(TAG, "❌ Fehler beim Erstellen des JSON-Root-Objekts");
		return NULL;
	}

	cJSON_AddStringToObject(root, "did", did);
	cJSON_AddStringToObject(root, "model", MODEL);

	// Array für "sensors" erstellen
	cJSON *sensors_array = cJSON_CreateArray();

	// Sensoren hinzufügen
	for (int i = 0; i < num_sensors; ++i) {
		// Sensor-Objekt zum Sensors-Array hinzufügen
		cJSON_AddItemToArray(sensors_array, sensors[i]);
	}

	// Sensors-Array zum Root hinzufügen
	cJSON_AddItemToObject(root, "sensors", sensors_array);

	char *json_str = cJSON_Print(root);
	cJSON_Delete(root);

	return json_str;
}

// Funktion zur Verarbeitung der empfangenen JSON-Daten
void process_received_json(char *json_str) {
	// JSON in einen cJSON-Objektbaum parsen
	cJSON *root = cJSON_Parse(json_str);
	if (root == NULL) {
		ESP_LOGE(TAG, "❌ Fehler beim Parsen des JSON-Strings");
		return;
	}

	cJSON *targetValues = cJSON_GetObjectItem(root, "targetValues");
	if (targetValues == NULL || !cJSON_IsArray(targetValues)) {
		ESP_LOGE(TAG, "❌ 'targetValues' ist entweder NULL oder kein Array");
		cJSON_Delete(root);
		return;
	}

	int num_targetValues = cJSON_GetArraySize(targetValues);
	for (int i = 0; i < num_targetValues; i++) {
		cJSON *item = cJSON_GetArrayItem(targetValues, i);
		if (item == NULL) continue;

		cJSON *sid = cJSON_GetObjectItem(item, "sid");
		cJSON *value = cJSON_GetObjectItem(item, "value");

		if (cJSON_IsString(sid) && cJSON_IsNumber(value)) {
			ESP_LOGI(TAG, "Sensor (sid): %s, Sollwert: %d",
					 sid->valuestring, value->valueint);

			// In speicher schreiben: store_target_value(sid->valuestring, value->valueint);
		} else {
			ESP_LOGE(TAG, "❌ JSON-Struktur in targetValues-Objekt ungültig");
		}
	}
	cJSON_Delete(root);
}

// Funktion zum Senden von Nachrichten
void send_message(const char *message) {
	if (message != NULL) {
		esp_mqtt_client_enqueue(client, MQTT_TOPIC_SEND, message, 0, 1, 1, true);
		ESP_LOGI(TAG, "📡 Daten gesendet: %s", message);
	} else {
	ESP_LOGE(TAG, "❌ Fehler beim Senden an Solace");
	}
}

// MQTT Event Handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
	esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;
	client = event->client;

	switch (event->event_id) {
	case MQTT_EVENT_CONNECTED:
		ESP_LOGI(TAG, "✅ MQTT verbunden");
		esp_mqtt_client_subscribe(client, MQTT_TOPIC_RECEIVE, 1);
		break;

	case MQTT_EVENT_DISCONNECTED:
		ESP_LOGI(TAG, "❌ MQTT getrennt");
		break;

	case MQTT_EVENT_ERROR:
		ESP_LOGE(TAG, "⚠️ MQTT Fehler aufgetreten");
		break;

	case MQTT_EVENT_DATA:
		ESP_LOGI(TAG, "📨 Nachricht erhalten");
		char *msg = malloc(event->data_len + 1);
		if (msg == NULL) {
			ESP_LOGE(TAG, "❌ Speicherallokierung fehlgeschlagen");
			break;
		}
		memcpy(msg, event->data, event->data_len);
		msg[event->data_len] = '\0';

		process_received_json(msg);

		free(msg);
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

	client = esp_mqtt_client_init(&mqtt_cfg);
	esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
	esp_mqtt_client_start(client);
}