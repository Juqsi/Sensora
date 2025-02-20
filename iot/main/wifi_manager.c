#include "wifi_manager.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "led_control.h"
#include "wifi_provisioning/manager.h"
#include "esp_netif.h"
#include "esp_http_server.h"
#include <string.h>

static const char *TAG = "wifi_manager";
static httpd_handle_t server = NULL;


static esp_err_t index_get_handler(httpd_req_t *req) {
	const char resp[] =
		"<html><body><h1>Wi-Fi Setup</h1>"
		"<form action='/connect' method='POST'>"
		"Wifi-Name: <input name='ssid'><br>"
		"Password: <input type='password' name='password'><br>"
		"<input type='submit' value='Verbinden'>"
		"</form></body></html>";
	httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
	return ESP_OK;
}

static esp_err_t connect_post_handler(httpd_req_t *req) {
	char buf[256];
	int ret = httpd_req_recv(req, buf, sizeof(buf) - 1);
	if (ret <= 0) {
		return ESP_FAIL;
	}
	buf[ret] = '\0';

	char ssid[32] = {0}, password[64] = {0};

	httpd_query_key_value(buf, "ssid", ssid, sizeof(ssid));
	httpd_query_key_value(buf, "password", password, sizeof(password));

	ESP_LOGI(TAG, "Received SSID: %s, Password: %s", ssid, password);

	wifi_config_t wifi_config = {};
	strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid));
	strncpy((char *)wifi_config.sta.password, password, sizeof(wifi_config.sta.password));

	ESP_ERROR_CHECK(esp_wifi_disconnect());
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
	ESP_ERROR_CHECK(esp_wifi_start());
	esp_wifi_connect();

	httpd_resp_send(req, "Verbindung wird hergestellt...", HTTPD_RESP_USE_STRLEN);

	return ESP_OK;
}

void start_webserver(void) {
	httpd_config_t config = HTTPD_DEFAULT_CONFIG();

	config.recv_wait_timeout = 10;  // Timeout für empfangene Daten (Sekunden)
	config.max_resp_headers = 10;  // Erhöht die maximale Header-Größe auf 1024 Bytes
	config.stack_size = 8192;  // Stackgröße für größere Requests erhöhen

	if (httpd_start(&server, &config) == ESP_OK) {
		httpd_uri_t uri_get = {
			.uri = "/",
			.method = HTTP_GET,
			.handler = index_get_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_get);

		httpd_uri_t uri_post = {
			.uri = "/connect",
			.method = HTTP_POST,
			.handler = connect_post_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_post);
	}
}

void stop_webserver(void) {
	if (server) {
		httpd_stop(server);
		server = NULL;
	}
}

void start_ap(void) {
	// Wi-Fi-Config für den SoftAP-Modus
	wifi_config_t wifi_ap_config = {
		.ap = {
			.ssid = "Sensora",               // SSID des AP
			.ssid_len = strlen("Sensora"),
			.password = "setup123",          // Passwort für den AP (mindestens 8 Zeichen)
			.max_connection = 4,             // Maximal 4 Verbindungen
			.authmode = WIFI_AUTH_WPA2_PSK,  // WPA2 Verschlüsselung
		},
	};

	// Initialisiere Wi-Fi
	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

	// Setze den Wi-Fi-Modus
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));

	// Setze die AP-Config
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));
	ESP_ERROR_CHECK(esp_wifi_start());

	// Registriere Ereignishandler
	ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL));
	ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL));

	start_webserver();
	led_blink_start();
	ESP_LOGI(TAG, "📡 SoftAP 'Sensora' aktiv. Öffne http://192.168.4.1");
}

void wifi_event_handler(void *arg, esp_event_base_t event_base, long event_id, void *event_data) {
	if (event_base == WIFI_EVENT) {
		if (event_id == WIFI_EVENT_STA_START) {
			ESP_LOGI(TAG, "📶 Verbindung mit Wi-Fi wird hergestellt...");
			esp_wifi_connect();
		}
		else if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
			static int disconnect_count = 0;
			disconnect_count++;

			ESP_LOGI(TAG, "❌ Wi-Fi getrennt. Erneuter Versuch (%d)...", disconnect_count);
			led_off();

			if (disconnect_count > 5) {  // Nach 5 Fehlversuchen SoftAP starten
				ESP_LOGW(TAG, "⚠️  Konnte keine Verbindung herstellen. Starte SoftAP neu...");
				vTaskDelay(pdMS_TO_TICKS(10000));  // 10 Sekunden warten
				ESP_ERROR_CHECK(esp_wifi_stop());
				start_ap();
				disconnect_count = 0;
			} else {
				esp_wifi_connect();
			}
		}
	}
	else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
		ESP_LOGI(TAG, "✅ Erfolgreich mit Wi-Fi verbunden!");

		// WLAN-Daten im Flash speichern
		wifi_config_t current_config;
		ESP_ERROR_CHECK(esp_wifi_get_config(WIFI_IF_STA, &current_config));
		ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &current_config));

		led_blink_stop();
		led_on();

		stop_webserver();

		// AP deaktivieren, falls nicht mehr benötigt
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
	}
}

void wifi_init(void) {
	// Initialisiere Netzwerk
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());

	// Erstelle Standard-Netzwerkschnittstellen (AP und STA)
	esp_netif_create_default_wifi_sta();
	esp_netif_create_default_wifi_ap();

	// Prüfe, ob bereits ein Netzwerk gespeichert ist, falls nicht starte AP
	wifi_config_t stored_wifi_config;
	esp_err_t ret = esp_wifi_get_config(WIFI_IF_STA, &stored_wifi_config);

	if (ret == ESP_OK && strlen((char *)stored_wifi_config.sta.ssid) > 0) {
		ESP_LOGI(TAG, "📶 Gespeicherte WLAN-Daten gefunden: %s", stored_wifi_config.sta.ssid);
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_start());
	} else {
		start_ap();  // Falls keine gespeicherten Daten vorhanden sind, SoftAP-Modus starten
	}
}