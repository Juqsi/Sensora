#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "driver/gpio.h"
#include "mqtt_client.h"  // Für MQTT-Integration
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED_PIN GPIO_NUM_2  // Die eingebaute LED auf den meisten ESP32-Boards
#define EXAMPLE_SSID "Vodafone-2A34"         // WLAN-Name (SSID)
#define EXAMPLE_PASSWORD "n3eYqrRXt6xp2KHH" // WLAN-Passwort

#define MQTT_BROKER_URI "mqtt://localhost:1883"  // Solace MQTT-Broker-Adresse
#define MQTT_TOPIC "/sensora/id/send"  // Topic für Sensordaten

static const char *TAG = "wifi_mqtt";

// MQTT-Client Handle
esp_mqtt_client_handle_t mqtt_client;

// Funktion zum Steuern der LED
void set_led_state(bool state) {
    gpio_set_level(LED_PIN, state ? 1 : 0);
}

// Event-Handler für WLAN-Ereignisse
static void event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_CONNECTED) {
        ESP_LOGI(TAG, "Mit WLAN verbunden");
        set_led_state(true); // LED einschalten, wenn mit WLAN verbunden
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGI(TAG, "WLAN-Verbindung verloren, versuche erneut...");
        set_led_state(false); // LED ausschalten, wenn WLAN-Verbindung verloren geht
        esp_wifi_connect();
    }
}

// Funktion zum Initialisieren der LED
static void led_init(void) {
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);
    set_led_state(false);  // LED standardmäßig aus
}

// WLAN im Station-Modus (STA) starten
static void wifi_init_sta(void) {
    esp_netif_init();
    esp_event_loop_create_default();

    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);

    esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &event_handler, NULL, NULL);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = EXAMPLE_SSID,
            .password = EXAMPLE_PASSWORD
        },
    };

    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
    esp_wifi_start();
}

// MQTT-Event-Handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = event_data;
    esp_mqtt_client_handle_t client = event->client;

    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT verbunden");
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "MQTT-Verbindung verloren, versuche Reconnect...");
            esp_mqtt_client_reconnect(client);
            break;
        default:
            break;
    }
}

// MQTT-Client initialisieren
void mqtt_init() {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = MQTT_BROKER_URI,
    };

    mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(mqtt_client, ESP_EVENT_ANY_ID, mqtt_event_handler, mqtt_client);
    esp_mqtt_client_start(mqtt_client);
}

// Funktion zum Senden von Sensordaten über MQTT
void send_sensor_data() {
    // Beispielwerte für Sensoren (du kannst hier echte Sensordaten einfügen)
    float temperature = 22.2;  // Beispieltemperatur
    int moisture = 60;  // Beispiel-Feuchtigkeit

    // MQTT-Nachricht senden (z.B. JSON-Daten)
    char msg[100];
    snprintf(msg, sizeof(msg), "{\"temperature\": %.2f, \"moisture\": %d}", temperature, moisture);

    int msg_id = esp_mqtt_client_publish(mqtt_client, MQTT_TOPIC, msg, 0, 1, 0);
    ESP_LOGI(TAG, "MQTT Nachricht gesendet (ID: %d): %s", msg_id, msg);
}

// FreeRTOS-Task für periodisches Senden von Sensordaten
void sensor_task(void *pvParameters) {
    send_sensor_data();
    //vTaskDelay(pdMS_TO_TICKS(30000));  // 30 Sekunden warten
    
}

void app_main() {    
    nvs_flash_init(); // NVS (Non-Volatile Storage) initialisieren
    led_init(); // LED initialisieren
    wifi_init_sta(); // WLAN im Station-Modus starten
    mqtt_init(); // MQTT-Verbindung zu Solace aufbauen

    xTaskCreate(sensor_task, "sensor_task", 4096, NULL, 5, NULL);
    
}
