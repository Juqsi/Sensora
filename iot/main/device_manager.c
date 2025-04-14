#include "device_manager.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "led_control.h"
#include "wifi_provisioning/manager.h"
#include "esp_netif.h"
#include "esp_http_server.h"
#include <string.h>
#include "driver/gpio.h"
#include "esp_system.h"
#include "wifi_setup_html.h"
#include "system_data_manager.h"
#include <auth_service.h>

#define RESET_BUTTON_GPIO 0 // GPIO 0 für den Reset-Button verwenden
#define RESET_HOLD_DURATION_MS 5000  // 5 Sekunden
#define LED_RESET_BLINK_INTERVAL_MS 200

static const char *TAG = "device_manager";
static httpd_handle_t server = NULL;
static TaskHandle_t reset_task_handle = NULL;
static bool reset = false;
static bool suppress_reconnect = false;
static system_data_t system_data;

typedef enum {
	CONNECT_STATE_IDLE,
	CONNECT_STATE_CONNECTING,
	CONNECT_STATE_RECONNECTING
} connect_state_t;

static connect_state_t wifi_connect_state = CONNECT_STATE_IDLE;
registration_state_t registration_state = REGISTRATION_STATE_IDLE;


static void IRAM_ATTR gpio_isr_handler(void *arg) {
	// Nur Notification senden, Auswertung in der Task
	BaseType_t xHigherPriorityTaskWoken = pdFALSE;
	vTaskNotifyGiveFromISR(reset_task_handle, &xHigherPriorityTaskWoken);
	portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void reset_task(void *arg) {
	while (1) {
		ulTaskNotifyTake(pdTRUE, portMAX_DELAY); // Warte auf ISR

		ESP_LOGW(TAG, "🟡 Reset-Knopf erkannt – prüfe Haltezeit...");

		TickType_t press_time = xTaskGetTickCount();
		bool led_state = false;
		while (gpio_get_level(RESET_BUTTON_GPIO) == 0) {
			led_state = !led_state;
			if (led_state) {
				led_on();
			} else {
				led_off();
			}

			vTaskDelay(pdMS_TO_TICKS(LED_RESET_BLINK_INTERVAL_MS));

			if ((xTaskGetTickCount() - press_time) >= pdMS_TO_TICKS(
				    RESET_HOLD_DURATION_MS)) {
				ESP_LOGW(
					TAG, "✅ Knopf wurde 5 Sekunden gehalten – setze zurück...");

				reset = true;
				led_off(); // sicherheitshalber

				ESP_LOGW(TAG, "🟡 WLAN-Daten werden gelöscht...");
				esp_wifi_stop();
				esp_wifi_restore();

				ESP_LOGW(TAG, "🟡 User-Daten werden gelöscht...");
				erase_system_data();

				vTaskDelay(pdMS_TO_TICKS(500));
				ESP_LOGW(TAG, "🔁 Gerät wird neu gestartet...");
				esp_restart();
			}
		}

		// Wenn hier angekommen, wurde der Knopf zu früh losgelassen
		led_off();
		ESP_LOGI(TAG, "❌ Knopf wurde nicht lange genug gehalten. Kein Reset.");
	}
}


void gpio_interrupt_init(void) {
	gpio_config_t io_conf = {
		.pin_bit_mask = (1ULL << RESET_BUTTON_GPIO),
		.mode = GPIO_MODE_INPUT,
		.pull_up_en = GPIO_PULLUP_ENABLE,
		.intr_type = GPIO_INTR_NEGEDGE, // auf fallende Flanke reagieren
	};
	ESP_ERROR_CHECK(gpio_config(&io_conf));

	// ISR-Service starten
	ESP_ERROR_CHECK(gpio_install_isr_service(ESP_INTR_FLAG_LEVEL1));
	ESP_ERROR_CHECK(
		gpio_isr_handler_add(RESET_BUTTON_GPIO, gpio_isr_handler, NULL));

	// Reset-Task starten
	xTaskCreate(reset_task, "reset_task", 2048, NULL, 10, &reset_task_handle);
}


bool is_sta_connected(void) {
	esp_netif_ip_info_t ip_info;
	esp_netif_t *sta_netif = esp_netif_get_handle_from_ifkey("WIFI_STA_DEF");

	if (esp_netif_get_ip_info(sta_netif, &ip_info) == ESP_OK) {
		return ip_info.ip.addr != 0; // Falls IP gesetzt ist → verbunden
	}
	return false;
}

static esp_err_t setup_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	char resp[2048];

	bool failed_wifi_connection = false;
	bool failed_backend_connection = false;
	char error[8] = {0};

	if (httpd_req_get_url_query_str(req, NULL, 0) > 0) {
		char query[32];
		if (httpd_req_get_url_query_str(req, query, sizeof(query)) == ESP_OK) {
			if (httpd_query_key_value(query, "error", error, sizeof(error)) ==
			    ESP_OK) {
				int error_code = atoi(error);
				if (error_code & 0x01)
					failed_wifi_connection = true;
				if (error_code & 0x02)
					failed_backend_connection = true;
			}
		}
	}

	char error_html[512] = "";
	if (failed_wifi_connection) {
		strcat(error_html,
		       "<div class='error' id='wifi-error'>❌ Wifi-Verbindung fehlgeschlagen. Bitte erneut versuchen.</div>");
	} else if (failed_backend_connection) {
		strcat(error_html,
		       "<div class='error' id='backend-error'>❌ Geräteregistrierung fehlgeschlagen. Bitte später erneut versuchen.</div>");
	}

	snprintf(resp, sizeof(resp), wifi_setup_html, error_html);
	httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
	return ESP_OK;
}


static esp_err_t try_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	char buf[256];
	int ret = httpd_req_recv(req, buf, sizeof(buf) - 1);
	if (ret <= 0)
		return ESP_FAIL;

	buf[ret] = '\0';

	char ssid[32] = {0}, password[64] = {0}, username[32] = {0};

	httpd_query_key_value(buf, "ssid", ssid, sizeof(ssid));
	httpd_query_key_value(buf, "password", password, sizeof(password));
	httpd_query_key_value(buf, "username", username, sizeof(username));

	ESP_LOGI(TAG, "Received WIFI Data...");
	strncpy(system_data.username, username, sizeof(system_data.username));
	save_system_data(&system_data);

	wifi_config_t wifi_config = {};
	strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid));
	strncpy((char *)wifi_config.sta.password, password,
	        sizeof(wifi_config.sta.password));

	ESP_ERROR_CHECK(esp_wifi_disconnect());
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
	wifi_connect_state = CONNECT_STATE_CONNECTING;
	const char *response_html =
		"<html><head><meta charset='utf-8'>"
		"<style>body{font-family:sans-serif;padding:2rem;}</style>"
		"</head><body>"
		"<h2>⏳ Verbindung wird hergestellt...</h2>"
		"<p>Bitte warte einen Moment...</p>"
		"<script>"
		"let retries = 0;"
		"const maxRetries = 30;" // 30 × 2s = 60 Sekunden max
		"function checkStatus() {"
		"  fetch('/status').then(res => res.text()).then(html => {"
		"    if (html.includes('✅ Setup erfolgreich!')) {"
		"      document.body.innerHTML = html;"
		"    } else if (html.includes('Verbindung fehlgeschlagen')) {"
		"      window.location.href = '/?error=1';"
		"    } else if (html.includes('Geräteregistrierung fehlgeschlagen')) {"
		"      window.location.href = '/?error=2';"
		"    } else if (++retries < maxRetries) {"
		"      setTimeout(checkStatus, 2000);"
		"    } else {"
		"      window.location.href = '/?error=2';"
		"    }"
		"  }).catch(() => setTimeout(checkStatus, 2000));"
		"}"
		"checkStatus();"
		"</script>"
		"</body></html>";

	httpd_resp_set_type(req, "text/html");
	httpd_resp_send(req, response_html, HTTPD_RESP_USE_STRLEN);
	ESP_ERROR_CHECK(esp_wifi_connect());
	int loop_ctr = 0;
	while (wifi_connect_state == CONNECT_STATE_CONNECTING) {
		if (loop_ctr++ > 15) {
			wifi_connect_state = CONNECT_STATE_IDLE;
			ESP_LOGW(TAG, "❌ Initialer Verbindungsversuch fehlgeschlagen.");
		}
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
	if (!is_device_registered()) {
		register_device();
	}
	return ESP_OK;
}

static esp_err_t try_app_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	char buf[256];
	int ret = httpd_req_recv(req, buf, sizeof(buf) - 1);
	if (ret <= 0)
		return ESP_FAIL;

	buf[ret] = '\0';

	char ssid[32] = {0}, password[64] = {0}, username[32] = {0};

	httpd_query_key_value(buf, "ssid", ssid, sizeof(ssid));
	httpd_query_key_value(buf, "password", password, sizeof(password));
	httpd_query_key_value(buf, "username", username, sizeof(username));

	ESP_LOGI(TAG, "Received WIFI Data");

	strncpy(system_data.username, username, sizeof(system_data.username));
	save_system_data(&system_data);

	wifi_config_t wifi_config = {};
	strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid));
	strncpy((char *)wifi_config.sta.password, password,
	        sizeof(wifi_config.sta.password));

	ESP_ERROR_CHECK(esp_wifi_disconnect());
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
	wifi_connect_state = CONNECT_STATE_CONNECTING;
	ESP_ERROR_CHECK(esp_wifi_connect());
	int loop_ctr = 0;
	while (wifi_connect_state == CONNECT_STATE_CONNECTING) {
		if (loop_ctr++ > 15) {
			wifi_connect_state = CONNECT_STATE_IDLE;
			ESP_LOGW(TAG, "❌ Initialer Verbindungsversuch fehlgeschlagen.");
		}
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
	loop_ctr = 0;
	register_device();
	while (registration_state != REGISTRATION_STATE_IDLE) {
		if (loop_ctr++ > 15) {
			registration_state = REGISTRATION_STATE_IDLE;
			ESP_LOGW(TAG, "❌ Registrierung des Controllers fehlgeschlagen.");
		}
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
	if (!is_sta_connected()) {
		httpd_resp_set_status(req, "400 Bad Request");
		httpd_resp_set_type(req, "application/json");
		httpd_resp_sendstr(req, "{\"message\":\"addController.ErrorWlan\"}");
	} else if (!is_device_registered()) {
		httpd_resp_set_status(req, "400 Bad Request");
		httpd_resp_set_type(req, "application/json");
		httpd_resp_sendstr(req, "{\"message\":\"addController.ErrorUser\"}");
	} else {
		httpd_resp_set_status(req, "200 OK");
		httpd_resp_send(req, NULL, 0);
	}
	return ESP_OK;
}

static esp_err_t status_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	if (is_sta_connected()) {
		if (is_device_registered()) {
			const char *success_page =
				"<html><body style='font-family:sans-serif;padding:2rem;'>"
				"<h2>✅ Setup erfolgreich!</h2>"
				"<p>Das Gerät ist jetzt mit dem WLAN verbunden und wurde bei Sensora registriert.</p>"
				"<p>Du kannst dieses Fenster nun schließen.</p>"
				"</body></html>";

			httpd_resp_set_type(req, "text/html");
			httpd_resp_send(req, success_page, HTTPD_RESP_USE_STRLEN);
		} else {
			const char *wait_page =
				"<html><body><p>⏳ Daten werden geprüft...</p></body></html>";
			httpd_resp_set_type(req, "text/html");
			httpd_resp_send(req, wait_page, HTTPD_RESP_USE_STRLEN);
		}

	} else if (wifi_connect_state != CONNECT_STATE_CONNECTING) {
		// Nur weiterleiten, wenn ESP **nicht mehr aktiv verbindet**
		httpd_resp_set_status(req, "302 Found");
		httpd_resp_set_hdr(req, "Location", "/?error=1");
		httpd_resp_send(req, NULL, 0);
	} else if (!is_device_registered() && registration_state !=
	           REGISTRATION_STATE_REGISTERING) {
		// Nur weiterleiten, wenn ESP **nicht mehr aktiv verbindet**
		httpd_resp_set_status(req, "302 Found");
		httpd_resp_set_hdr(req, "Location", "/?error=2");
		httpd_resp_send(req, NULL, 0);
	} else {
		// Verbinde noch → gib neutrales HTML zurück
		const char *wait_page =
			"<html><body><p>⏳ Daten werden geprüft...</p></body></html>";
		httpd_resp_set_type(req, "text/html");
		httpd_resp_send(req, wait_page, HTTPD_RESP_USE_STRLEN);
	}
	return ESP_OK;
}


void start_webserver(void) {
	httpd_config_t config = HTTPD_DEFAULT_CONFIG();
	config.max_open_sockets = 6;
	config.recv_wait_timeout = 10;
	config.stack_size = 8192;

	if (httpd_start(&server, &config) == ESP_OK) {
		const httpd_uri_t uri_get = {
			.uri = "/",
			.method = HTTP_GET,
			.handler = setup_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_get);

		const httpd_uri_t uri_post = {
			.uri = "/connect",
			.method = HTTP_POST,
			.handler = try_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_post);

		const httpd_uri_t uri_post_app = {
			.uri = "/connectapp",
			.method = HTTP_POST,
			.handler = try_app_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_post_app);

		const httpd_uri_t uri_status = {
			.uri = "/status",
			.method = HTTP_GET,
			.handler = status_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_status);

		ESP_LOGI(TAG, "🌐 HTTP-Webserver gestartet.");
	}
}

void stop_webserver(void) {
	if (server) {
		httpd_stop(server);
		server = NULL;
		ESP_LOGI(TAG, "🛑 HTTP-Webserver gestoppt.");
	}
}


void start_ap(void) {
	// Wi-Fi-Config für den SoftAP-Modus
	wifi_config_t wifi_ap_config = {
		.ap = {
			.ssid = "Sensora",
			.ssid_len = strlen("Sensora"),
			.password = "",
			.max_connection = 4,
			.authmode = WIFI_AUTH_OPEN, // Offen – kein Passwort
		},
	};

	// Setze den Wi-Fi-Modus
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));

	// Setze die AP-Config
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));
	ESP_ERROR_CHECK(esp_wifi_start());

	start_webserver();
	led_blink_start();
	ESP_LOGI(TAG, "📡 SoftAP 'Sensora' aktiv. Öffne http://192.168.4.1");
}

void stop_ap(void) {
	wifi_mode_t current_mode;
	ESP_ERROR_CHECK(esp_wifi_get_mode(&current_mode));

	if (current_mode == WIFI_MODE_APSTA) {
		ESP_LOGI(TAG, "🛑 Stoppe Webserver");
		if (server) {
			stop_webserver();
		}
		ESP_LOGI(TAG, "🔄 Deaktiviere SoftAP");
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		suppress_reconnect = true;
		ESP_ERROR_CHECK(esp_wifi_stop());
		ESP_ERROR_CHECK(esp_wifi_start());
		int loop_ctr = 0;
		while (wifi_connect_state == CONNECT_STATE_CONNECTING) {
			if (loop_ctr++ > 15) {
				wifi_connect_state = CONNECT_STATE_IDLE;
				ESP_LOGW(TAG, "❌ Verbindungsversuch fehlgeschlagen.");
			}
			vTaskDelay(pdMS_TO_TICKS(1000));
		}
		suppress_reconnect = false;
		if (!is_sta_connected()) {
			ESP_LOGI(TAG, "📡 Kein aktives WLAN – versuche zu verbinden...");
			esp_wifi_connect(); // optional
		}

		ESP_LOGI(TAG, "📶 Jetzt nur noch im STA-Modus aktiv.");
	} else {
		ESP_LOGI(TAG, "ℹ️ SoftAP ist bereits deaktiviert.");
		if (server) {
			ESP_LOGI(TAG, "🛑 Stoppe Webserver");
			httpd_stop(server);
			server = NULL;
		}
	}
}


void wifi_event_handler(void *arg, const esp_event_base_t event_base,
                        const long event_id,
                        void *event_data) {
	if (event_base == WIFI_EVENT) {
		wifi_config_t stored_wifi_config;
		esp_wifi_get_config(WIFI_IF_STA, &stored_wifi_config);

		if (event_id == WIFI_EVENT_STA_START) {
			ESP_LOGI(
				TAG,
				"📶 Wi-Fi STA gestartet. Prüfe gespeicherte Konfiguration...");

			if (strlen((char *)stored_wifi_config.sta.ssid) > 0) {
				ESP_LOGI(TAG, "📡 Verbindung wird aufgebaut ...");
				ESP_ERROR_CHECK(esp_wifi_connect());
			} else {
				ESP_LOGW(
					TAG,
					"⚠️ Keine gültige STA-Konfiguration vorhanden – kein Verbindungsversuch.")
				;
			}

		} else if (event_id == WIFI_EVENT_STA_DISCONNECTED && !reset && !
		           suppress_reconnect) {
			if (wifi_connect_state == CONNECT_STATE_CONNECTING) {
				ESP_LOGW(TAG, "❌ Initialer Verbindungsversuch fehlgeschlagen.");
				wifi_connect_state = CONNECT_STATE_IDLE;

			} else {
				wifi_mode_t mode;
				esp_wifi_get_mode(&mode);
				if (mode == WIFI_MODE_AP || mode == WIFI_MODE_APSTA) {
					ESP_LOGI(
						TAG,
						"ℹ️ STA disconnected, aber AP ist aktiv – kein Reconnect.")
					;
					return;
				}
				wifi_connect_state = CONNECT_STATE_RECONNECTING;
				static int disconnect_count = 0;
				disconnect_count++;
				ESP_LOGW(TAG, "❌ Wi-Fi getrennt. Neuer Versuch (%d)...",
				         disconnect_count);
				led_off();
				if (disconnect_count > 5 && server == NULL) {
					ESP_LOGW(TAG, "🛑 Kein Erfolg. Starte SoftAP...");
					vTaskDelay(pdMS_TO_TICKS(5000));
					esp_wifi_stop();
					start_ap();
					disconnect_count = 0;
				} else {
					esp_wifi_connect();
				}
			}
		}

	} else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
		ESP_LOGI(TAG, "✅ Erfolgreich mit Wi-Fi verbunden!");
		wifi_connect_state = CONNECT_STATE_IDLE;
		led_blink_stop();
		led_on();
	}
}

bool device_init_done(void) {
	if (is_sta_connected()) {
		if (is_device_registered()) {
			return true;
		}
	}
	return false;
}

void device_init(void) {
	ESP_LOGI(TAG, "🚀 Initialisiere NVS...");
	//initialisiere das nvs
	system_data_storage_init();

	//lade daten aus nvs
	system_data_t system_data = {0};
	load_system_data(&system_data);

	ESP_LOGI(TAG, "🚀 Starte WIFI-Provisioning...");
	led_init();

	// Initialisiere Netzwerk & Event-Loop
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());

	// Erstelle Standard-Netzwerkschnittstellen für STA und AP
	esp_netif_create_default_wifi_sta();
	esp_netif_create_default_wifi_ap();

	// Initialisiere Wi-Fi
	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

	//Lade System Data
	gpio_interrupt_init();
	load_system_data(&system_data);

	// Registriere Event-Handler
	ESP_ERROR_CHECK(
		esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &
			wifi_event_handler, NULL));
	ESP_ERROR_CHECK(
		esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &
			wifi_event_handler, NULL));

	// Versuche gespeicherte WLAN-Konfiguration zu laden
	wifi_config_t stored_wifi_config;
	esp_err_t ret = esp_wifi_get_config(WIFI_IF_STA, &stored_wifi_config);

	if (ret == ESP_OK && strlen((char *)stored_wifi_config.sta.ssid) > 0 &&
	    is_device_registered()) {
		ESP_LOGI(TAG, "📶 Gespeicherte System-Daten gefunden");

		// Verbindung mit gespeicherten Daten herstellen
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_start());
	} else {
		ESP_LOGW(
			TAG,
			"⚠️  System-Daten unvollständig. Starte SoftAP-Modus...")
		;
		start_ap(); // Startet AP + Webserver zur Eingabe von SSID/PW
	}
}


/*void device_init(void) {	// Zum Testen
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());
	esp_netif_create_default_wifi_sta();

	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

	wifi_config_t wifi_config = {
		.sta = {
			.ssid = "Sensora_Test",
			.password = "sensora123",
		},
	};
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
	ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
	ESP_ERROR_CHECK(esp_wifi_start());
	ESP_ERROR_CHECK(esp_wifi_connect());
}*/
