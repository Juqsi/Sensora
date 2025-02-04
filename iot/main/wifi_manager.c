#include "wifi_manager.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "led_control.h"
#include "wifi_provisioning/manager.h"
#include "wifi_provisioning/scheme_softap.h"
#include "esp_http_server.h"
#include <string.h>

static const char *TAG = "wifi_manager";


// Handler für das Formular auf der Web-Oberfläche
esp_err_t root_get_handler(httpd_req_t *req) {
	const char *resp_str = "<html><body><h1>Wi-Fi Setup</h1>"
						   "<form method='POST' action='/connect'>"
						   "SSID: <input type='text' name='ssid'><br>"
						   "Password: <input type='password' name='password'><br>"
						   "<input type='submit' value='Connect'>"
						   "</form></body></html>";
	httpd_resp_send(req, resp_str, HTTPD_RESP_USE_STRLEN);
	return ESP_OK;
}

// Handler für die POST-Anfrage, um die Wi-Fi-Daten zu empfangen
esp_err_t connect_post_handler(httpd_req_t *req) {
	char ssid[64] = { 0 };
	char password[64] = { 0 };

	// Erhalte die Länge der Anfrage
	size_t buf_len = req->content_len;
	if (buf_len > 0) {
		// Puffer für die Anfrage
		char *buf = malloc(buf_len + 1); // +1 für null-terminierte Zeichenkette
		if (buf == NULL) {
			ESP_LOGE(TAG, "Failed to allocate memory for request buffer");
			return ESP_ERR_NO_MEM;
		}

		// Empfange die POST-Daten
		int ret = httpd_req_recv(req, buf, buf_len);
		if (ret <= 0) {
			ESP_LOGE(TAG, "Failed to receive POST data");
			free(buf);
			return ESP_FAIL;
		}

		// Null-terminiere den empfangenen Datenpuffer
		buf[ret] = '\0';

		// Analysiere die POST-Daten, um die SSID und das Passwort zu extrahieren
		sscanf(buf, "ssid=%63s&password=%63s", ssid, password);
		free(buf); // Puffer freigeben
	}

	ESP_LOGI(TAG, "SSID: %s, Password: %s", ssid, password);

	// Speichern der Wi-Fi-Credentials und Konfiguration des Wi-Fi-Modus
	wifi_config_t wifi_config = { 0 };
	strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid));
	strncpy((char *)wifi_config.sta.password, password, sizeof(wifi_config.sta.password));

	// Setze Wi-Fi im STA-Modus
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
	ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
	ESP_ERROR_CHECK(esp_wifi_start());

	// Schließe den SoftAP-Modus und stoppe Provisioning
	wifi_prov_mgr_deinit();

	// Antwort zurück an den Webbrowser
	const char *resp_str = "<html><body><h1>Connecting...</h1></body></html>";
	httpd_resp_send(req, resp_str, HTTPD_RESP_USE_STRLEN);

	return ESP_OK;
}

/*esp_err_t test_handler(httpd_req_t *req) {
	httpd_resp_send(req, "Hello, World!", HTTPD_RESP_USE_STRLEN);
	return ESP_OK;
}*/

// HTTP-Server initialisieren
void start_http_server() {
	httpd_handle_t server = NULL;
	httpd_config_t config = HTTPD_DEFAULT_CONFIG();

	// Start des Servers
	if (httpd_start(&server, &config) == ESP_OK) {
		ESP_LOGI(TAG, "HTTP server started");

		// URI für das Formular
		httpd_uri_t root_uri = {
			.uri = "/",
			.method = HTTP_GET,
			.handler = root_get_handler,
			.user_ctx = NULL
		};
		ESP_ERROR_CHECK(httpd_register_uri_handler(server, &root_uri));

		// URI für das Verarbeiten der POST-Daten
		httpd_uri_t connect_uri = {
			.uri = "/connect",
			.method = HTTP_POST,
			.handler = connect_post_handler,
			.user_ctx = NULL
		};
		ESP_ERROR_CHECK(httpd_register_uri_handler(server, &connect_uri));

		/*httpd_uri_t test_uri = {
			.uri = "/",
			.method = HTTP_GET,
			.handler = test_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &test_uri);*/
	} else {
		ESP_LOGE(TAG, "Failed to start HTTP server");
	}
}

void start_http_server_task(void *pvParameter) {
	start_http_server();
	vTaskDelete(NULL);
}

void wifi_event_handler(void *arg, esp_event_base_t event_base, long event_id, void *event_data) {
	if (event_base == WIFI_PROV_EVENT) {
		switch (event_id) {
			case WIFI_PROV_START:
				ESP_LOGI(TAG, "Provisioning started");
				led_blink_start();
				break;
			case WIFI_PROV_CRED_SUCCESS:
				ESP_LOGI(TAG, "Provisioning successful");
				led_blink_stop();
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
		led_blink_stop();
		led_on();
	}
}

void wifi_init(void) {
	// Initialisierung des Netzwerks
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());

	// Erstellen der Standard-Netzwerkschnittstellen (AP und STA)
	esp_netif_create_default_wifi_ap();
	esp_netif_create_default_wifi_sta();

	// Wi-Fi-Config für den SoftAP-Modus
	wifi_config_t wifi_ap_config = {
		.ap = {
			.ssid = "Sensora",              // SSID des AP
			.ssid_len = strlen("Sensora"),
			.password = "setup123",           // Passwort für den AP
			.max_connection = 4,              // Maximal 4 Verbindungen
			.authmode = WIFI_AUTH_WPA2_PSK,   // WPA2 Verschlüsselung
		},
	};

	// Wi-Fi Initialisierung
	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

	// Setze den Wi-Fi Modus auf AP + STA
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));

	// Setze die AP-Config
	ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_AP, &wifi_ap_config));

	// Registrierung des Ereignishandlers
	ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL));
	ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL));
	ESP_ERROR_CHECK(esp_event_handler_register(WIFI_PROV_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL));

	ESP_ERROR_CHECK(esp_wifi_start());	// Erstelle AP

	// Provisioning starten, falls noch keine Wi-Fi-Verbindung konfiguriert ist
	bool provisioned = false;
	ESP_ERROR_CHECK(wifi_prov_mgr_is_provisioned(&provisioned));

	if (!provisioned) {
		// Start des Provisioning-Modus (SoftAP)
		wifi_prov_mgr_config_t config = {
			.scheme = wifi_prov_scheme_softap,
			.scheme_event_handler = WIFI_PROV_EVENT_HANDLER_NONE
		};
		ESP_ERROR_CHECK(wifi_prov_mgr_init(config));
		ESP_ERROR_CHECK(wifi_prov_mgr_start_provisioning(WIFI_PROV_SECURITY_1, "pop", "Sensora", NULL));

		// HTTP-Server wird in einem neuen Task gestartet
		xTaskCreate(start_http_server_task, "http_server_task", 4096, NULL, 10, NULL);
	} else {
		// Verbindung mit gespeicherten Daten im STA-Modus
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_start());  // Stelle die Verbindung her
	}
}
