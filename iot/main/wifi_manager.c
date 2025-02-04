#include <stdio.h>
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "wifi_provisioning/manager.h"
#include "wifi_provisioning/scheme_softap.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED_GPIO GPIO_NUM_2  // Integrierte LED des ESP32 (meist GPIO 2)

static const char *TAG = "app";
static TaskHandle_t blink_task_handle = NULL;

// LED Steuerung
void led_on() {
	gpio_set_level(LED_GPIO, 1);
}

void led_off() {
	gpio_set_level(LED_GPIO, 0);
}

void led_blink_task(void *pvParameter) {
	while (1) {
		led_on();
		vTaskDelay(pdMS_TO_TICKS(500));
		led_off();
		vTaskDelay(pdMS_TO_TICKS(500));
	}
}

// Ereignis-Handler
static void event_handler(void *arg, esp_event_base_t event_base, int event_id, void *event_data) {
	if (event_base == WIFI_PROV_EVENT) {
		switch (event_id) {
		case WIFI_PROV_START:
			ESP_LOGI(TAG, "Provisioning started");
			xTaskCreate(led_blink_task, "led_blink_task", 1024, NULL, 5, &blink_task_handle);
			break;

		case WIFI_PROV_CRED_SUCCESS:
			ESP_LOGI(TAG, "Provisioning successful");
			if (blink_task_handle) {
				vTaskDelete(blink_task_handle);
				blink_task_handle = NULL;
			}
			led_on();
			break;

		case WIFI_PROV_END:
			ESP_LOGI(TAG, "Provisioning ended");
			break;

		default:
			break;
		}
	}
	else if (event_base == WIFI_EVENT) {
		if (event_id == WIFI_EVENT_STA_START) {
			ESP_LOGI(TAG, "STA started, attempting to connect");
			esp_wifi_connect();
		}
		else if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
			ESP_LOGI(TAG, "Disconnected, retrying connection");
			led_off();
			esp_wifi_connect();
		}
	}
	else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
		ESP_LOGI(TAG, "Connected to Wi-Fi, got IP");
		if (blink_task_handle) {
			vTaskDelete(blink_task_handle);
			blink_task_handle = NULL;
		}
		led_on();
	}
}

void app1_main(void) {
	// Initialisierung von NVS
	esp_err_t ret = nvs_flash_init();
	if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
		ESP_ERROR_CHECK(nvs_flash_erase());
		ret = nvs_flash_init();
	}
	ESP_ERROR_CHECK(ret);

	// Initialisierung der LED
	gpio_pad_select_gpio(LED_GPIO);
	gpio_set_direction(LED_GPIO, GPIO_MODE_OUTPUT);
	led_off();

	// Initialisierung des Netzwerks
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());
	esp_netif_create_default_wifi_sta();

	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

	// Registrierung des Ereignishandlers
	ESP_ERROR_CHECK(esp_event_handler_register(WIFI_PROV_EVENT, ESP_EVENT_ANY_ID, &event_handler, NULL));
	ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &event_handler, NULL));
	ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &event_handler, NULL));

	// Überprüfung auf gespeicherte Provisionierung
	bool provisioned = false;
	ESP_ERROR_CHECK(wifi_prov_mgr_is_provisioned(&provisioned));

	if (!provisioned) {
		// Start des Provisioning-Modus (SoftAP)
		wifi_prov_mgr_config_t config = {
			.scheme = wifi_prov_scheme_softap,
			.scheme_event_handler = WIFI_PROV_EVENT_HANDLER_NONE
		};
		ESP_ERROR_CHECK(wifi_prov_mgr_init(config));
		ESP_ERROR_CHECK(wifi_prov_mgr_start_provisioning(WIFI_PROV_SECURITY_1, "pop", "PROV_1234", NULL));
	} else {
		// Verbindung mit gespeicherten Daten im STA-Modus
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_start());
	}
}

