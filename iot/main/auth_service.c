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


#include <system_data_manager.h>

static const char *TAG = "AUTH_SERVICE";

// Configuration
#define AUTH_SERVICE_URL "https://fynnsauthservice.maxtar.de"
#define MAX_HTTP_RESPONSE_SIZE 2048
#define MAX_CHALLENGE_SIZE 256
static system_data_t system_data;


// Global variables for MQTT credentials
static char *mqtt_username = NULL;
static char *mqtt_password = NULL;
static char *publish_topic = NULL;
static char *subscribe_topic = NULL;
static char *controller_id = NULL;


// Buffer for HTTP responses
static char http_response_buffer[MAX_HTTP_RESPONSE_SIZE];
static int http_response_len = 0;

// Calculate HMAC-SHA256
static void calculate_hmac(const char *key, const char *data, char *output) {
	unsigned char hmac[32];
	mbedtls_md_context_t ctx;
	mbedtls_md_init(&ctx);
	mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
	mbedtls_md_hmac_starts(&ctx, (const unsigned char *)key, strlen(key));
	mbedtls_md_hmac_update(&ctx, (const unsigned char *)data, strlen(data));
	mbedtls_md_hmac_finish(&ctx, hmac);
	mbedtls_md_free(&ctx);

	// Convert to hex string
	for (int i = 0; i < 32; i++) {
		sprintf(output + (i * 2), "%02x", hmac[i]);
	}
}

// HTTP Event Handler
static esp_err_t http_event_handler(esp_http_client_event_t *evt) {
	switch (evt->event_id) {
	case HTTP_EVENT_ON_DATA:
		if (http_response_len + evt->data_len < MAX_HTTP_RESPONSE_SIZE) {
			memcpy(http_response_buffer + http_response_len, evt->data,
			       evt->data_len);
			http_response_len += evt->data_len;
		}
		break;
	case HTTP_EVENT_ON_FINISH:
		http_response_buffer[http_response_len] = 0; // Null terminate
		break;
	default:
		break;
	}
	return ESP_OK;
}

// Base64 decode helper
static int base64_decode(const char *input, unsigned char *output, int output_len) {
	size_t olen = 0;
	mbedtls_base64_decode(output, output_len, &olen,
	                      (const unsigned char *)input, strlen(input));
	return olen;
}

// Request authentication challenge
static char *request_challenge(const char *token_hash) {
	http_response_len = 0;
	esp_http_client_config_t config = {
		.url = AUTH_SERVICE_URL "/api/controller/init",
		.event_handler = http_event_handler,
		.method = HTTP_METHOD_POST
	};

	esp_http_client_handle_t client = esp_http_client_init(&config);

	// Prepare JSON payload with username
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
			cJSON *challenge_json = cJSON_GetObjectItem(response, "challenge");
			if (challenge_json && challenge_json->valuestring) {
				challenge = strdup(challenge_json->valuestring);
			}
			cJSON_Delete(response);
		}
	}

	cJSON_Delete(root);
	free(post_data);
	esp_http_client_cleanup(client);

	return challenge;
}

// Verify challenge and get credentials
static bool verify_challenge_and_get_credentials(
	const char *token_hash, const char *challenge_response) {
	http_response_len = 0;
	esp_http_client_config_t config = {
		.url = AUTH_SERVICE_URL "/api/controller/verify",
		.event_handler = http_event_handler,
		.method = HTTP_METHOD_POST
	};

	esp_http_client_handle_t client = esp_http_client_init(&config);

	// Prepare JSON payload
	cJSON *root = cJSON_CreateObject();
	cJSON_AddStringToObject(root, "token_hash", token_hash);
	cJSON_AddStringToObject(root, "challenge_response", challenge_response);
	char *post_data = cJSON_Print(root);

	esp_http_client_set_post_field(client, post_data, strlen(post_data));
	esp_http_client_set_header(client, "Content-Type", "application/json");

	esp_err_t err = esp_http_client_perform(client);
	bool success = false;

	if (err == ESP_OK) {
		cJSON *response = cJSON_Parse(http_response_buffer);
		if (response) {
			cJSON *session_key_json = cJSON_GetObjectItem(
				response, "session_key");
			cJSON *credential_key_json = cJSON_GetObjectItem(
				response, "credential_key");
			cJSON *encrypted_credentials_json = cJSON_GetObjectItem(
				response, "encrypted_credentials");

			if (session_key_json && credential_key_json &&
			    encrypted_credentials_json) {
				// Verify credential key
				char expected_key[65] = {0};
				calculate_hmac(system_data.hardware_token,
				               session_key_json->valuestring, expected_key);

				if (strcmp(expected_key, credential_key_json->valuestring) ==
				    0) {
					ESP_LOGI(TAG, "Credential key verified");

					// Decrypt credentials using Fernet
					unsigned char key[32];
					base64_decode(session_key_json->valuestring, key, 32);

					// Initialize AES context
					mbedtls_aes_context aes;
					mbedtls_aes_init(&aes);
					mbedtls_aes_setkey_dec(&aes, key, 256);

					// Decode and decrypt credentials
					unsigned char encrypted[MAX_HTTP_RESPONSE_SIZE];
					int encrypted_len = base64_decode(
						encrypted_credentials_json->valuestring, encrypted, MAX_HTTP_RESPONSE_SIZE);

					unsigned char decrypted[MAX_HTTP_RESPONSE_SIZE];
					size_t decrypted_len = 0;

					// Decrypt in CBC mode (simplified for example)
					unsigned char iv[16] = {0};
					// In real implementation, get from encrypted data
					mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_DECRYPT,
					                      encrypted_len, iv, encrypted,
					                      decrypted);

					// Parse decrypted credentials
					cJSON *credentials = cJSON_Parse((char *)decrypted);
					if (credentials) {
						// Store credentials
						cJSON *username = cJSON_GetObjectItem(
							credentials, "username");
						cJSON *password = cJSON_GetObjectItem(
							credentials, "password");
						cJSON *pub_topic = cJSON_GetObjectItem(
							credentials, "publish_topic");
						cJSON *sub_topic = cJSON_GetObjectItem(
							credentials, "subscribe_topic");
						cJSON *did = cJSON_GetObjectItem(credentials, "did");

						if (username && password && pub_topic && sub_topic &&
						    did) {
							mqtt_username = strdup(username->valuestring);
							mqtt_password = strdup(password->valuestring);
							publish_topic = strdup(pub_topic->valuestring);
							subscribe_topic = strdup(sub_topic->valuestring);
							controller_id = strdup(did->valuestring);
							success = true;
						}
						cJSON_Delete(credentials);
					}
					mbedtls_aes_free(&aes);
				}
			}
			cJSON_Delete(response);
		}
	}

	cJSON_Delete(root);
	free(post_data);
	esp_http_client_cleanup(client);

	return success;
}

void register_device(void) {

	// Get system_data
	load_system_data(&system_data);
	strncpy(system_data.hardware_token, "48021b5d-471d-46da-a27c-dadb7dce7fec", sizeof(system_data.hardware_token));
	strncpy(system_data.software_token, "your-secret-key-min-32-bytes-long!!", sizeof(system_data.software_token));


	//static const char* TOKEN_SECRET = "your-secret-key-min-32-bytes-long!!";

	// Calculate token hash
	char token_hash[65] = {0};
	calculate_hmac(system_data.software_token, system_data.hardware_token,
	               token_hash);

	// Request challenge
	char *challenge = request_challenge(token_hash);
	if (!challenge) {
		ESP_LOGE(TAG, "Failed to get challenge");
		return;
	}

	// Calculate challenge response
	char challenge_response[65] = {0};
	calculate_hmac(system_data.hardware_token, challenge, challenge_response);

	// Verify challenge and get credentials
	if (!verify_challenge_and_get_credentials(token_hash, challenge_response)) {
		ESP_LOGE(TAG, "Failed to verify challenge");
		free(challenge);
		return;
	}
	free(challenge);
	ESP_LOGI(TAG, "MQTT Username: %s", mqtt_username);
	ESP_LOGI(TAG, "MQTT Password: %s", mqtt_password);
	strncpy(system_data.solace_username, mqtt_username, sizeof(system_data.solace_username));
	strncpy(system_data.solace_password, mqtt_password, sizeof(system_data.solace_password));
	strncpy(system_data.solace_publish_topic, publish_topic, sizeof(system_data.solace_publish_topic));
	strncpy(system_data.solace_subscribe_topic, subscribe_topic, sizeof(system_data.solace_subscribe_topic));
	strncpy(system_data.solace_controller_id,controller_id,sizeof(system_data.solace_controller_id));
	save_system_data(&system_data);
	free(mqtt_username);
	free(mqtt_password);
	free(publish_topic);
	free(subscribe_topic);
	free(controller_id);
}