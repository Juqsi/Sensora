#include "auth_service.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"
#include "esp_http_client.h"
#include "cJSON.h"
#include "mbedtls/md.h"
#include "mbedtls/base64.h"
#include "mbedtls/aes.h"
#include "device_manager.h"
#include <system_data_manager.h>

#define FERNET_TOKEN_MAX_SIZE 1024

static const char *TAG = "AUTH_SERVICE";
#define AUTH_SERVICE_URL "https://fynnsauthservice.maxtar.de"
#define MAX_HTTP_RESPONSE_SIZE 2048
static system_data_t system_data;

static char *mqtt_username = NULL;
static char *mqtt_password = NULL;
static char *publish_topic = NULL;
static char *subscribe_topic = NULL;
static char *controller_id = NULL;

static char http_response_buffer[MAX_HTTP_RESPONSE_SIZE];
static int http_response_len = 0;

extern const uint8_t auth_service_cert_pem_start[] asm(
	"_binary_auth_service_cert_pem_start");
extern const uint8_t auth_service_cert_pem_end[] asm(
	"_binary_auth_service_cert_pem_end");

static void calculate_hmac(const char *key, const char *data, char *output) {
	ESP_LOGD(TAG, "Calculating HMAC-SHA256...");
	unsigned char hmac[32];
	mbedtls_md_context_t ctx;
	mbedtls_md_init(&ctx);
	mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
	mbedtls_md_hmac_starts(&ctx, (const unsigned char *)key, strlen(key));
	mbedtls_md_hmac_update(&ctx, (const unsigned char *)data, strlen(data));
	mbedtls_md_hmac_finish(&ctx, hmac);
	mbedtls_md_free(&ctx);
	for (int i = 0; i < 32; i++) {
		sprintf(output + (i * 2), "%02x", hmac[i]);
	}
	ESP_LOGD(TAG, "HMAC calculation completed.");
}

static esp_err_t http_event_handler(esp_http_client_event_t *evt) {
	switch (evt->event_id) {
	case HTTP_EVENT_ON_DATA:
		if (http_response_len + evt->data_len < MAX_HTTP_RESPONSE_SIZE) {
			memcpy(http_response_buffer + http_response_len, evt->data,
			       evt->data_len);
			http_response_len += evt->data_len;
		} else {
			ESP_LOGE(TAG, "HTTP response buffer overflow");
		}
		break;
	case HTTP_EVENT_ON_FINISH:
		http_response_buffer[http_response_len] = 0;
		break;
	default:
		break;
	}
	return ESP_OK;
}

static int base64_decode(const char *input, unsigned char *output, int output_len) {
	size_t olen = 0;
	if (mbedtls_base64_decode(output, output_len, &olen, (const unsigned char *)input, strlen(input)) != 0) {
		ESP_LOGE(TAG, "Base64 decoding failed");
		return -1;
	}
	return (int)olen;
}

static int fernet_decrypt(const char *base64_token, const uint8_t *key,
                          size_t key_len, uint8_t *plaintext,
                          size_t *plaintext_len) {
	ESP_LOGD(TAG, "Starting Fernet decryption...");
	uint8_t token[FERNET_TOKEN_MAX_SIZE];
	size_t token_len;

	if (mbedtls_base64_decode(token, sizeof(token), &token_len,
	                          (const uint8_t *)base64_token,
	                          strlen(base64_token)) != 0) {
		ESP_LOGE(TAG, "Base64 decoding failed");
		return -1;
	}

	if (token_len < (1 + 8 + 16 + 32)) {
		ESP_LOGE(TAG, "Token too short");
		return -1;
	}

	uint8_t *iv = token + 9;
	uint8_t *ciphertext = token + 25;
	size_t ciphertext_len = token_len - 25 - 32;
	uint8_t *hmac_ptr = token + token_len - 32;

	uint8_t computed_hmac[32];
	const mbedtls_md_info_t *md_info = mbedtls_md_info_from_type(
		MBEDTLS_MD_SHA256);
	mbedtls_md_context_t md_ctx;
	mbedtls_md_init(&md_ctx);
	mbedtls_md_setup(&md_ctx, md_info, 1);
	mbedtls_md_hmac_starts(&md_ctx, key + 16, 16);
	mbedtls_md_hmac_update(&md_ctx, token, token_len - 32);
	mbedtls_md_hmac_finish(&md_ctx, computed_hmac);
	mbedtls_md_free(&md_ctx);

	if (memcmp(hmac_ptr, computed_hmac, 32) != 0) {
		ESP_LOGE(TAG, "HMAC verification failed");
		return -1;
	}

	mbedtls_aes_context aes_ctx;
	mbedtls_aes_init(&aes_ctx);
	if (mbedtls_aes_setkey_dec(&aes_ctx, key, 128) != 0) {
		ESP_LOGE(TAG, "AES key setup failed");
		mbedtls_aes_free(&aes_ctx);
		return -1;
	}
	uint8_t iv_copy[16];
	memcpy(iv_copy, iv, 16);
	if (mbedtls_aes_crypt_cbc(&aes_ctx, MBEDTLS_AES_DECRYPT, ciphertext_len,
	                          iv_copy, ciphertext, plaintext) != 0) {
		mbedtls_aes_free(&aes_ctx);
		ESP_LOGE(TAG, "AES decryption failed");
		return -1;
	}
	mbedtls_aes_free(&aes_ctx);

	// NEW: Prüfe das Padding ausführlicher
	uint8_t pad_len = plaintext[ciphertext_len - 1];
	if (pad_len < 1 || pad_len > 16) {
		ESP_LOGE(TAG, "Invalid padding length: %d", pad_len);
		return -1;
	}
	// Verifiziere, dass alle Padding-Bytes gleich sind
	for (int i = 0; i < pad_len; i++) {
		if (plaintext[ciphertext_len - 1 - i] != pad_len) {
			ESP_LOGE(TAG, "Invalid padding byte detected");
			return -1;
		}
	}
	*plaintext_len = ciphertext_len - pad_len;

	ESP_LOGD(TAG, "Fernet decryption succeeded");
	return 0;
}

static char *request_challenge(const char *token_hash) {
	http_response_len = 0;
	esp_http_client_config_t config = {
		.url = AUTH_SERVICE_URL "/api/controller/init",
		.cert_pem = (const char *)auth_service_cert_pem_start,
		.cert_len = auth_service_cert_pem_end - auth_service_cert_pem_start,
		.event_handler = http_event_handler,
		.method = HTTP_METHOD_POST
	};
	esp_http_client_handle_t client = esp_http_client_init(&config);

    cJSON *root = cJSON_CreateObject();
	cJSON_AddStringToObject(root, "token_hash", token_hash);
	cJSON_AddStringToObject(root, "username", system_data.username);
	char *post_data = cJSON_Print(root);

	esp_http_client_set_post_field(client, post_data, strlen(post_data));
	esp_http_client_set_header(client, "Content-Type", "application/json");

	esp_err_t err = esp_http_client_perform(client);
	char *challenge = NULL;
	if (err == ESP_OK) {
		cJSON *response = cJSON_Parse(http_response_buffer);
		if (response) {
			// NEW: Zusätzliche Prüfung, ob "challenge" existiert
			cJSON *challenge_json = cJSON_GetObjectItem(response, "challenge");
			if (challenge_json && cJSON_IsString(challenge_json)) {
				challenge = strdup(challenge_json->valuestring);
			} else {
				ESP_LOGE(TAG, "Challenge field missing or not a string");
			}
			cJSON_Delete(response);
		} else {
			ESP_LOGE(TAG, "Failed to parse JSON from server response");
		}
	} else {
		ESP_LOGE(TAG, "HTTP request failed: %s", esp_err_to_name(err));
	}

	cJSON_Delete(root);
	free(post_data);
	esp_http_client_cleanup(client);

    return challenge;
}

static bool verify_challenge_and_get_credentials(const char *token_hash, const
                                                 char *challenge_response) {
	ESP_LOGI(TAG, "Verifying challenge response and retrieving credentials...");
	http_response_len = 0;
	esp_http_client_config_t config = {
		.url = AUTH_SERVICE_URL "/api/controller/verify",
		.cert_pem = (const char *)auth_service_cert_pem_start,
		.cert_len = auth_service_cert_pem_end - auth_service_cert_pem_start,
		.event_handler = http_event_handler,
		// NEW: Event-Handler hinzufügen, um Daten zu sammeln
		.method = HTTP_METHOD_POST
	};
	esp_http_client_handle_t client = esp_http_client_init(&config);

	cJSON *root = cJSON_CreateObject();
	cJSON_AddStringToObject(root, "token_hash", token_hash);
	cJSON_AddStringToObject(root, "challenge_response", challenge_response);
    cJSON_AddStringToObject(root, "username", system_data.username);
	char *post_data = cJSON_Print(root);

	esp_http_client_set_post_field(client, post_data, strlen(post_data));
	esp_http_client_set_header(client, "Content-Type", "application/json");
	esp_err_t err = esp_http_client_perform(client);
	if (err != ESP_OK) {
		ESP_LOGE(TAG, "HTTP request failed: %s", esp_err_to_name(err));
		cJSON_Delete(root);
		free(post_data);
		esp_http_client_cleanup(client);
		return false;
	}

	bool success = false;
	cJSON *response = cJSON_Parse(http_response_buffer);
	if (response) {
		cJSON *session_key_json = cJSON_GetObjectItem(response, "session_key");
		cJSON *credential_key_json = cJSON_GetObjectItem(
			response, "credential_key");
		cJSON *encrypted_credentials_json = cJSON_GetObjectItem(
			response, "encrypted_credentials");

		if (!session_key_json || !credential_key_json || !
		    encrypted_credentials_json ||
		    !cJSON_IsString(session_key_json) || !
		    cJSON_IsString(credential_key_json) || !cJSON_IsString(
			    encrypted_credentials_json)) {
			ESP_LOGE(TAG, "Missing or invalid fields in server response");
			char *pretty = cJSON_Print(response);
			if (pretty) {
				ESP_LOGI(TAG, "JSON Response:\n%s", pretty);
				free(pretty);
			}
		} else {
			const char *session_key_b64 = session_key_json->valuestring;
			const char *credential_key = credential_key_json->valuestring;
			const char *encrypted_credentials_b64 = encrypted_credentials_json->
				valuestring;

			ESP_LOGD(TAG, "Received session_key: %s", session_key_b64);
			ESP_LOGD(TAG, "Received credential_key: %s", credential_key);
			ESP_LOGD(TAG, "Received encrypted_credentials");

			char expected_key[65] = {0};
            calculate_hmac(system_data.hardware_token, session_key_b64, expected_key);

			if (strcmp(expected_key, credential_key) == 0) {
				ESP_LOGI(TAG, "Credential key verified successfully.");
				uint8_t session_key_bin[32];
				int decoded_len = base64_decode(
					session_key_b64, session_key_bin, sizeof(session_key_bin));
				if (decoded_len <= 0) {
					ESP_LOGE(TAG, "Session key Base64 decoding failed");
				} else {
					uint8_t decrypted[1024];
					size_t decrypted_len = 0;
					if (fernet_decrypt(encrypted_credentials_b64,
					                   session_key_bin, 32, decrypted,
					                   &decrypted_len) == 0) {
						decrypted[decrypted_len] = '\0';
						cJSON *credentials = cJSON_Parse((char *)decrypted);
						if (credentials) {
							cJSON *mqtt_username_json = cJSON_GetObjectItem(
								credentials, "username");
							cJSON *mqtt_password_json = cJSON_GetObjectItem(
								credentials, "password");
							cJSON *publish_topic_json = cJSON_GetObjectItem(
								credentials, "publish_topic");
							cJSON *subscribe_topic_json = cJSON_GetObjectItem(
								credentials, "subscribe_topic");
							cJSON *controller_id_json = cJSON_GetObjectItem(
								credentials, "did");

							if (!mqtt_username_json || !mqtt_password_json || !
							    publish_topic_json ||
							    !subscribe_topic_json || !controller_id_json ||
							    !cJSON_IsString(mqtt_username_json) || !
							    cJSON_IsString(mqtt_password_json) ||
							    !cJSON_IsString(publish_topic_json) || !
							    cJSON_IsString(subscribe_topic_json) ||
							    !cJSON_IsString(controller_id_json)) {
                                ESP_LOGE(TAG, "Missing or invalid fields in decrypted credentials");
                            } else {
								mqtt_username = strdup(
									mqtt_username_json->valuestring);
								mqtt_password = strdup(
									mqtt_password_json->valuestring);
								publish_topic = strdup(
									publish_topic_json->valuestring);
								subscribe_topic = strdup(
									subscribe_topic_json->valuestring);
								controller_id = strdup(
									controller_id_json->valuestring);
								ESP_LOGI(
									TAG,
									"Successfully parsed and stored MQTT credentials.")
								;
								success = true;
							}
							cJSON_Delete(credentials);
						} else {
							ESP_LOGE(
								TAG,
								"Failed to parse decrypted credentials JSON.");
						}
					} else {
						ESP_LOGE(TAG, "Fernet decryption failed.");
					}
				}
			} else {
				ESP_LOGE(TAG, "Credential key mismatch.");
			}
		}
		cJSON_Delete(response);
	} else {
		ESP_LOGE(TAG, "Failed to parse server response JSON.");
	}

	cJSON_Delete(root);
	free(post_data);
	esp_http_client_cleanup(client);
	return success;
}

bool is_device_registered(void) {
	registration_state = REGISTRATION_STATE_REGISTERING;
	system_data_t temp_system_data;
	load_system_data(&temp_system_data);
	registration_state = REGISTRATION_STATE_IDLE;
	return system_data.registered;
}

void register_device(void) {
	ESP_LOGI(TAG, "🚀 Starte Geräteregistrierung...");

	ESP_LOGI(TAG, "📦 Lade Systemdaten...");
	load_system_data(&system_data);

	ESP_LOGI(TAG, "🔐 Setze Hardware- und Softwaretoken...");
	strncpy(system_data.hardware_token, "b9b05aa9-85ac-4a3d-a188-cf2ca029e163", sizeof(system_data.hardware_token));
    strncpy(system_data.software_token, "your-secret-key-min-32-bytes-long!!", sizeof(system_data.software_token));

    char token_hash[65] = {0};
    calculate_hmac(system_data.software_token, system_data.hardware_token, token_hash);
	ESP_LOGI(TAG, "🔑 Token-Hash berechnet: %s", token_hash);

	ESP_LOGI(TAG, "📡 Anfrage an Auth-Service: Challenge wird angefordert...");
	char *challenge = request_challenge(token_hash);
	if (!challenge) {
		ESP_LOGE(TAG, "❌ Fehler beim Abrufen der Challenge vom Server.");
		return;
	}
	ESP_LOGI(TAG, "✅ Challenge erhalten.");

	char challenge_response[65] = {0};
    calculate_hmac(system_data.hardware_token, challenge, challenge_response);
	ESP_LOGI(TAG, "🧠 Challenge-Response berechnet.");

	ESP_LOGI(TAG, "🔐 Überprüfe Challenge und erhalte MQTT-Zugangsdaten...");
	if (!verify_challenge_and_get_credentials(token_hash, challenge_response)) {
		ESP_LOGE(TAG, "❌ Verifizierung der Challenge fehlgeschlagen.");
		system_data.registered = false;
		free(challenge);
		save_system_data(&system_data);
        return;
	}
	free(challenge);
	ESP_LOGI(TAG, "✅ Verifizierung erfolgreich. Zugangsdaten empfangen.");

	ESP_LOGI(TAG, "📨 MQTT Username: %s", mqtt_username);
	ESP_LOGI(TAG, "📨 MQTT Password: %s", mqtt_password);
	ESP_LOGI(TAG, "📨 Publish Topic: %s", publish_topic);
	ESP_LOGI(TAG, "📨 Subscribe Topic: %s", subscribe_topic);
	ESP_LOGI(TAG, "📨 Controller-ID: %s", controller_id);

	strncpy(system_data.solace_username, mqtt_username,
	        sizeof(system_data.solace_username));
	strncpy(system_data.solace_password, mqtt_password,
	        sizeof(system_data.solace_password));
	strncpy(system_data.solace_publish_topic, publish_topic,
	        sizeof(system_data.solace_publish_topic));
	strncpy(system_data.solace_subscribe_topic, subscribe_topic,
	        sizeof(system_data.solace_subscribe_topic));
	strncpy(system_data.solace_controller_id, controller_id,
	        sizeof(system_data.solace_controller_id));
	save_system_data(&system_data);

	ESP_LOGI(TAG, "🧹 Räume temporäre Daten auf...");
	free(mqtt_username);
	free(mqtt_password);
	free(publish_topic);
	free(subscribe_topic);
	free(controller_id);

	ESP_LOGI(TAG, "🎉 Registrierung abgeschlossen!");
	system_data.registered = true;
	registration_state = REGISTRATION_STATE_IDLE;
}
