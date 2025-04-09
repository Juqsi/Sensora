#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "protocol_examples_common.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_http_client.h"
#include "mqtt_client.h"
#include "cJSON.h"
#include "mbedtls/md.h"
#include "mbedtls/base64.h"
#include "mbedtls/aes.h"

static const char *TAG = "SENSORA_CONTROLLER";

// Configuration
#define AUTH_SERVICE_URL "http://your-auth-service:5000"  // Updated port
#define MAX_HTTP_RESPONSE_SIZE 2048
#define MAX_CHALLENGE_SIZE 256
#define MAX_USERNAME_SIZE 32
#define MAX_PASSWORD_SIZE 32
#define MAX_BROKER_URL_SIZE 128

// Stored in flash memory (replace with your token from admin registration)
static const char* HARDWARE_TOKEN = "48021b5d-471d-46da-a27c-dadb7dce7fec";
static const char* TOKEN_SECRET = "your-secret-key-min-32-bytes-long!!";

// User credentials (to be set during WiFi initialization)
static char username[MAX_USERNAME_SIZE] = "";
static char password[MAX_PASSWORD_SIZE] = "";

// Global variables for MQTT credentials
static char* mqtt_username = NULL;
static char* mqtt_password = NULL;
static char* publish_topic = NULL;
static char* subscribe_topic = NULL;
static char* controller_id = NULL;
static char* broker_url = NULL;
static int broker_port = 1883;
static bool use_ssl = false;

// MQTT client handle
static esp_mqtt_client_handle_t mqtt_client = NULL;

// Buffer for HTTP responses
static char http_response_buffer[MAX_HTTP_RESPONSE_SIZE];
static int http_response_len = 0;

// Calculate HMAC-SHA256
static void calculate_hmac(const char* key, const char* data, char* output) {
    unsigned char hmac[32];
    mbedtls_md_context_t ctx;
    mbedtls_md_init(&ctx);
    mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
    mbedtls_md_hmac_starts(&ctx, (const unsigned char*)key, strlen(key));
    mbedtls_md_hmac_update(&ctx, (const unsigned char*)data, strlen(data));
    mbedtls_md_hmac_finish(&ctx, hmac);
    mbedtls_md_free(&ctx);

    // Convert to hex string
    for(int i = 0; i < 32; i++) {
        sprintf(output + (i * 2), "%02x", hmac[i]);
    }
}

// HTTP Event Handler
static esp_err_t http_event_handler(esp_http_client_event_t *evt) {
    switch(evt->event_id) {
        case HTTP_EVENT_ON_DATA:
            if (http_response_len + evt->data_len < MAX_HTTP_RESPONSE_SIZE) {
                memcpy(http_response_buffer + http_response_len, evt->data, evt->data_len);
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
static int base64_decode(const char* input, unsigned char* output) {
    size_t olen = 0;
    mbedtls_base64_decode(output, strlen(input), &olen, (const unsigned char*)input, strlen(input));
    return olen;
}

// Request authentication challenge
static char* request_challenge(const char* token_hash) {
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
    cJSON_AddStringToObject(root, "username", username);
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
static bool verify_challenge_and_get_credentials(const char* token_hash, const char* challenge_response) {
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
            cJSON *session_key_json = cJSON_GetObjectItem(response, "session_key");
            cJSON *credential_key_json = cJSON_GetObjectItem(response, "credential_key");
            cJSON *encrypted_credentials_json = cJSON_GetObjectItem(response, "encrypted_credentials");
            
            if (session_key_json && credential_key_json && encrypted_credentials_json) {
                // Verify credential key
                char expected_key[65] = {0};
                calculate_hmac(HARDWARE_TOKEN, session_key_json->valuestring, expected_key);
                
                if (strcmp(expected_key, credential_key_json->valuestring) == 0) {
                    ESP_LOGI(TAG, "Credential key verified");
                    
                    // Decrypt credentials using Fernet
                    unsigned char key[32];
                    base64_decode(session_key_json->valuestring, key);
                    
                    // Initialize AES context
                    mbedtls_aes_context aes;
                    mbedtls_aes_init(&aes);
                    mbedtls_aes_setkey_dec(&aes, key, 256);
                    
                    // Decode and decrypt credentials
                    unsigned char encrypted[MAX_HTTP_RESPONSE_SIZE];
                    int encrypted_len = base64_decode(encrypted_credentials_json->valuestring, encrypted);
                    
                    unsigned char decrypted[MAX_HTTP_RESPONSE_SIZE];
                    size_t decrypted_len = 0;
                    
                    // Decrypt in CBC mode (simplified for example)
                    unsigned char iv[16] = {0}; // In real implementation, get from encrypted data
                    mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_DECRYPT, encrypted_len, iv, encrypted, decrypted);
                    
                    // Parse decrypted credentials
                    cJSON *credentials = cJSON_Parse((char*)decrypted);
                    if (credentials) {
                        // Store credentials
                        cJSON *username = cJSON_GetObjectItem(credentials, "username");
                        cJSON *password = cJSON_GetObjectItem(credentials, "password");
                        cJSON *pub_topic = cJSON_GetObjectItem(credentials, "publish_topic");
                        cJSON *sub_topic = cJSON_GetObjectItem(credentials, "subscribe_topic");
                        cJSON *did = cJSON_GetObjectItem(credentials, "did");
                        cJSON *broker = cJSON_GetObjectItem(credentials, "broker_url");
                        cJSON *port = cJSON_GetObjectItem(credentials, "broker_port");
                        cJSON *ssl = cJSON_GetObjectItem(credentials, "broker_ssl");
                        
                        if (username && password && pub_topic && sub_topic && did && broker && port) {
                            mqtt_username = strdup(username->valuestring);
                            mqtt_password = strdup(password->valuestring);
                            publish_topic = strdup(pub_topic->valuestring);
                            subscribe_topic = strdup(sub_topic->valuestring);
                            controller_id = strdup(did->valuestring);
                            broker_url = strdup(broker->valuestring);
                            broker_port = port->valueint;
                            use_ssl = ssl ? ssl->valueint : false;
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

// MQTT Event Handler
static esp_err_t mqtt_event_handler(esp_mqtt_event_handle_t event) {
    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI("MQTT", "Connected to broker");
            // Subscribe to setpoints topic
            esp_mqtt_client_subscribe(mqtt_client, subscribe_topic, 1);
            break;
            
        case MQTT_EVENT_DATA:
            ESP_LOGI("MQTT", "Received data on topic %.*s", event->topic_len, event->topic);
            // Handle received data (e.g., setpoints)
            break;
            
        case MQTT_EVENT_ERROR:
            ESP_LOGE("MQTT", "Error occurred");
            break;
            
        default:
            break;
    }
    return ESP_OK;
}

// Initialize MQTT with received credentials
static void init_mqtt(void) {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = broker_url,
        .broker.address.port = broker_port,
        .credentials.username = mqtt_username,
        .credentials.authentication.password = mqtt_password,
        .session.keepalive = 60,
        .network.disable_auto_reconnect = false,
        .network.timeout_ms = 10000,
        .transport.type = use_ssl ? MQTT_TRANSPORT_OVER_SSL : MQTT_TRANSPORT_OVER_TCP
    };
    
    mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(mqtt_client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(mqtt_client);
}

// Publish sensor data
static void publish_sensor_data(void) {
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "did", controller_id);
    cJSON_AddStringToObject(root, "username", username);
    
    // Create sensors array
    cJSON *sensors = cJSON_AddArrayToObject(root, "sensors");
    
    // Add temperature sensor
    cJSON *temp_sensor = cJSON_CreateObject();
    cJSON_AddStringToObject(temp_sensor, "sid", "temp-1");
    cJSON_AddStringToObject(temp_sensor, "ilk", "temperature");
    cJSON_AddStringToObject(temp_sensor, "unit", "°C");
    cJSON_AddStringToObject(temp_sensor, "status", "active");
    
    cJSON *values = cJSON_AddArrayToObject(temp_sensor, "values");
    cJSON *value = cJSON_CreateObject();
    cJSON_AddStringToObject(value, "timestamp", "2024-03-20T12:00:00Z");
    cJSON_AddNumberToObject(value, "value", 23.5);
    cJSON_AddItemToArray(values, value);
    
    cJSON_AddItemToArray(sensors, temp_sensor);
    
    // Add humidity sensor
    cJSON *hum_sensor = cJSON_CreateObject();
    cJSON_AddStringToObject(hum_sensor, "sid", "hum-1");
    cJSON_AddStringToObject(hum_sensor, "ilk", "humidity");
    cJSON_AddStringToObject(hum_sensor, "unit", "%");
    cJSON_AddStringToObject(hum_sensor, "status", "active");
    
    values = cJSON_AddArrayToObject(hum_sensor, "values");
    value = cJSON_CreateObject();
    cJSON_AddStringToObject(value, "timestamp", "2024-03-20T12:00:00Z");
    cJSON_AddNumberToObject(value, "value", 55.5);
    cJSON_AddItemToArray(values, value);
    
    cJSON_AddItemToArray(sensors, hum_sensor);
    
    char *json_string = cJSON_Print(root);
    esp_mqtt_client_publish(mqtt_client, publish_topic, json_string, 0, 1, 0);
    
    cJSON_Delete(root);
    free(json_string);
}

// Main application
void app_main(void) {
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    // Initialize WiFi
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    ESP_ERROR_CHECK(example_connect());
    
    // Get user credentials (simulated for testing)
    strncpy(username, "user1", MAX_USERNAME_SIZE);
    strncpy(password, "password123", MAX_PASSWORD_SIZE);
    
    // Calculate token hash
    char token_hash[65] = {0};
    calculate_hmac(TOKEN_SECRET, HARDWARE_TOKEN, token_hash);
    
    // Request challenge
    char *challenge = request_challenge(token_hash);
    if (!challenge) {
        ESP_LOGE(TAG, "Failed to get challenge");
        return;
    }
    
    // Calculate challenge response
    char challenge_response[65] = {0};
    calculate_hmac(HARDWARE_TOKEN, challenge, challenge_response);
    
    // Verify challenge and get credentials
    if (!verify_challenge_and_get_credentials(token_hash, challenge_response)) {
        ESP_LOGE(TAG, "Failed to verify challenge");
        free(challenge);
        return;
    }
    
    free(challenge);
    
    // Initialize MQTT
    init_mqtt();
    
    // Main loop
    while (1) {
        publish_sensor_data();
        vTaskDelay(pdMS_TO_TICKS(5000)); // Publish every 5 seconds
    }
} 