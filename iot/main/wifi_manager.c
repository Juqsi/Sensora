#include "wifi_manager.h"
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

#define RESET_BUTTON_GPIO 0 // GPIO 0 für den Reset-Button verwenden

static const char *TAG = "wifi_manager";
static httpd_handle_t server = NULL;
static TaskHandle_t reset_task_handle = NULL;
static bool reset = false;
static TaskHandle_t ap_delayed_stop_task_handle = NULL;

typedef enum {
	CONNECT_STATE_IDLE,
	CONNECT_STATE_CONNECTING,
	CONNECT_STATE_RECONNECTING
} connect_state_t;

static connect_state_t wifi_connect_state = CONNECT_STATE_IDLE;

void stop_ap(void);

//definiere Interrupt Routine für einen Input an GPIO0
static void IRAM_ATTR gpio_isr_handler(void *arg) {
	BaseType_t xHigherPriorityTaskWoken = pdFALSE;
	vTaskNotifyGiveFromISR(reset_task_handle, &xHigherPriorityTaskWoken);
	portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void reset_task(void *arg) {
	while (1) {
		ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
		// Blockiert bis Interrupt ausgelöst wurde

		ESP_LOGW(
			TAG, "🟡 GPIO Interrupt erkannt. WLAN-Daten werden gelöscht...");
		reset = true;
		esp_wifi_stop(); // sicherstellen, dass Wi-Fi nicht aktiv ist
		esp_wifi_restore();
		vTaskDelay(pdMS_TO_TICKS(500));

		ESP_LOGW(TAG, "🔁 Gerät wird neu gestartet...");
		esp_restart();
	}
}

// Initialisierung von GPIO und Interrupt
void gpio_interrupt_init(void) {
	gpio_config_t io_conf = {
		.pin_bit_mask = (1ULL << RESET_BUTTON_GPIO),
		.mode = GPIO_MODE_INPUT,
		.pull_up_en = GPIO_PULLUP_ENABLE,
		.intr_type = GPIO_INTR_NEGEDGE, // z.B. bei Knopfdruck (LOW)
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

static esp_err_t wifi_setup_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	char resp[2048]; // Buffer für die Antwort

	// Dynamisch die Fehlernachricht einfügen, falls erforderlich
	bool failed = false;
	char error[8] = {0};

	// URL-Parameter abfragen, um zu prüfen, ob ein Fehler vorliegt
	if (httpd_req_get_url_query_str(req, NULL, 0) > 0) {
		char query[32];
		if (httpd_req_get_url_query_str(req, query, sizeof(query)) == ESP_OK) {
			httpd_query_key_value(query, "error", error, sizeof(error));
			if (strcmp(error, "1") == 0) {
				failed = true;
			}
		}
	}

	// Den HTML-String mit der dynamischen Fehlermeldung füllen
	snprintf(resp, sizeof(resp), wifi_setup_html,
	         failed
		         ? "<div class='error' id='wifi-error'>❌ Verbindung fehlgeschlagen. Bitte erneut versuchen.</div>"
		         : "");

	// Die Antwort zurück an den Client senden
	httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
	return ESP_OK;
}


static esp_err_t try_wifi_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	char buf[256];
	int ret = httpd_req_recv(req, buf, sizeof(buf) - 1);
	if (ret <= 0)
		return ESP_FAIL;

	buf[ret] = '\0';

	char ssid[32] = {0}, password[64] = {0};

	httpd_query_key_value(buf, "ssid", ssid, sizeof(ssid));
	httpd_query_key_value(buf, "password", password, sizeof(password));

	ESP_LOGI(TAG, "Received SSID: %s, Password: %s", ssid, password);

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
		"    if (html.includes('✅ Verbindung erfolgreich!')) {"
		"      document.body.innerHTML = html;"
		"    } else if (html.includes('Verbindung fehlgeschlagen')) {"
		"      window.location.href = '/?error=1';"
		"    } else if (++retries < maxRetries) {"
		"      setTimeout(checkStatus, 2000);"
		"    } else {"
		"      window.location.href = '/?error=1';"
		"    }"
		"  }).catch(() => setTimeout(checkStatus, 2000));"
		"}"
		"checkStatus();"
		"</script>"
		"</body></html>";

	httpd_resp_set_type(req, "text/html");
	httpd_resp_send(req, response_html, HTTPD_RESP_USE_STRLEN);
	ESP_ERROR_CHECK(esp_wifi_connect());

	return ESP_OK;
}

static esp_err_t status_wifi_handler(httpd_req_t *req) {
	httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
	if (is_sta_connected()) {
		const char *success_page =
			"<html><body style='font-family:sans-serif;padding:2rem;'>"
			"<h2>✅ Verbindung erfolgreich!</h2>"
			"<p>Das Gerät ist jetzt mit dem WLAN verbunden.</p>"
			"<p>Du kannst dieses Fenster nun schließen.</p>"
			"</body></html>";

		httpd_resp_set_type(req, "text/html");
		httpd_resp_send(req, success_page, HTTPD_RESP_USE_STRLEN);

		stop_ap();
	} else if (wifi_connect_state != CONNECT_STATE_CONNECTING) {
		// Nur weiterleiten, wenn ESP **nicht mehr aktiv verbindet**
		httpd_resp_set_status(req, "302 Found");
		httpd_resp_set_hdr(req, "Location", "/?error=1");
		httpd_resp_send(req, NULL, 0);
	} else {
		// Verbinde noch → gib neutrales HTML zurück
		const char *wait_page =
			"<html><body><p>⏳ Verbindung wird geprüft...</p></body></html>";
		httpd_resp_set_type(req, "text/html");
		httpd_resp_send(req, wait_page, HTTPD_RESP_USE_STRLEN);
	}
	return ESP_OK;
}


void start_webserver(void) {
	httpd_config_t config = HTTPD_DEFAULT_CONFIG();
	config.recv_wait_timeout = 10;
	config.stack_size = 8192;

	if (httpd_start(&server, &config) == ESP_OK) {
		httpd_uri_t uri_get_wifi = {
			.uri = "/",
			.method = HTTP_GET,
			.handler = wifi_setup_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_get_wifi);

		httpd_uri_t uri_post_wifi = {
			.uri = "/connect",
			.method = HTTP_POST,
			.handler = try_wifi_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_post_wifi);

		httpd_uri_t uri_status_wifi = {
			.uri = "/status",
			.method = HTTP_GET,
			.handler = status_wifi_handler,
			.user_ctx = NULL
		};
		httpd_register_uri_handler(server, &uri_status_wifi);

		ESP_LOGI(TAG, "🌐 Webserver gestartet.");
	}
}


void start_ap(void) {
	// Wi-Fi-Config für den SoftAP-Modus
	wifi_config_t wifi_ap_config = {
		.ap = {
			.ssid = "Sensora", // SSID des AP
			.ssid_len = strlen("Sensora"),
			.password = "setup123",
			// Passwort für den AP (mindestens 8 Zeichen)
			.max_connection = 4, // Maximal 4 Verbindungen
			.authmode = WIFI_AUTH_WPA2_PSK, // WPA2 Verschlüsselung
		},
	};

	// Setze den Wi-Fi-Modus
	ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));

	// Setze die AP-Config
	ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));
	ESP_ERROR_CHECK(esp_wifi_start());

	// Registriere Ereignishandler
	ESP_ERROR_CHECK(
		esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &
			wifi_event_handler, NULL));
	ESP_ERROR_CHECK(
		esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &
			wifi_event_handler, NULL));

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
			httpd_stop(server);
			server = NULL;
		}
		ESP_LOGI(TAG, "🔄 Deaktiviere SoftAP");
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_stop());
		ESP_ERROR_CHECK(esp_wifi_start());

		if (!is_sta_connected()) {
			ESP_LOGI(TAG, "📡 Kein aktives WLAN – versuche zu verbinden...");
			esp_wifi_connect();  // optional
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

	ap_delayed_stop_task_handle = NULL;
}


void ap_delayed_stop_task(void *arg) {
	const TickType_t delay = pdMS_TO_TICKS(5 * 60 * 1000); // 5 Minuten

	ESP_LOGI(TAG, "🕒 Warte 5 Minuten, bevor AP gestoppt wird...");

	vTaskDelay(delay);

	ESP_LOGI(TAG, "⏱️ Zeit abgelaufen – AP wird nun deaktiviert.");
	stop_ap(); // nur wenn noch nötig
	ap_delayed_stop_task_handle = NULL;
	vTaskDelete(NULL);
}


void wifi_event_handler(void *arg, esp_event_base_t event_base, long event_id,
                        void *event_data) {
	if (event_base == WIFI_EVENT) {
		wifi_config_t stored_wifi_config;
		esp_wifi_get_config(WIFI_IF_STA, &stored_wifi_config);

		if (event_id == WIFI_EVENT_STA_START) {
			ESP_LOGI(
				TAG,
				"📶 Wi-Fi STA gestartet. Prüfe gespeicherte Konfiguration...");

			if (strlen((char *)stored_wifi_config.sta.ssid) > 0) {
				ESP_LOGI(TAG, "📡 Verbindung wird aufgebaut mit SSID: %s",
				         stored_wifi_config.sta.ssid);
				ESP_ERROR_CHECK(esp_wifi_connect());
			} else {
				ESP_LOGW(
					TAG,
					"⚠️ Keine gültige STA-Konfiguration vorhanden – kein Verbindungsversuch.")
				;
			}

		} else if (event_id == WIFI_EVENT_STA_DISCONNECTED && !reset) {
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
		if (ap_delayed_stop_task_handle == NULL) {
			xTaskCreate(ap_delayed_stop_task, "ap_stop_delayed", 2048, NULL, 5,
			            &ap_delayed_stop_task_handle);
		}

	}
}


void wifi_init(void) {
	ESP_LOGI(TAG, "🚀 Starte WIFI-Provisioning...");

	// Initialisiere Netzwerk & Event-Loop
	ESP_ERROR_CHECK(esp_netif_init());
	ESP_ERROR_CHECK(esp_event_loop_create_default());

	// Erstelle Standard-Netzwerkschnittstellen für STA und AP
	esp_netif_create_default_wifi_sta();
	esp_netif_create_default_wifi_ap();

	// Initialisiere Wi-Fi
	wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
	ESP_ERROR_CHECK(esp_wifi_init(&cfg));

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

	if (ret == ESP_OK && strlen((char *)stored_wifi_config.sta.ssid) > 0) {
		ESP_LOGI(TAG, "📶 Gespeicherte WLAN-Daten gefunden: %s",
		         stored_wifi_config.sta.ssid);

		// Verbindung mit gespeicherten Daten herstellen
		ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
		ESP_ERROR_CHECK(esp_wifi_start());
	} else {
		ESP_LOGW(
			TAG,
			"⚠️  Keine gespeicherten WLAN-Daten gefunden. Starte SoftAP-Modus...")
		;
		start_ap(); // Startet AP + Webserver zur Eingabe von SSID/PW
	}
}


/*void wifi_init(void) {	// Zum Testen
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