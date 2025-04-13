#include "nvs_flash.h"
#include "esp_sntp.h"
#include <time.h>
#include "led_control.h"
#include "wifi_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"
#include "pump_manager.h"
#include "i2cdev.h"
#include "esp_log.h"

#define NVS_NAMESPACE "storage"
#define NVS_KEY_TARGET       "target_moisture"


void initialize_sntp(void) {
	esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);
	esp_sntp_setservername(0, "pool.ntp.org");
	esp_sntp_init();
}


void wait_for_time_sync(void) {
	time_t now;
	struct tm timeinfo;
	time(&now);
	localtime_r(&now, &timeinfo);

	while (timeinfo.tm_year < (2016 - 1900)) {
		vTaskDelay(pdMS_TO_TICKS(2000));
		time(&now);
		localtime_r(&now, &timeinfo);
	}
}


void app_main(void) {
	// Initialisierung von NVS
	esp_err_t ret_nvs = nvs_flash_init();
	if (ret_nvs == ESP_ERR_NVS_NO_FREE_PAGES ||
		ret_nvs == ESP_ERR_NVS_NEW_VERSION_FOUND) {
		ESP_ERROR_CHECK(nvs_flash_erase());
		ret_nvs = nvs_flash_init();
	}
	ESP_ERROR_CHECK(ret_nvs);

	// Globalen I²C-Dev-Stack initialisieren
	esp_err_t ret_i2c = i2cdev_init();
	if (ret_i2c != ESP_OK) {
		ESP_LOGE("APP_MAIN", "i2cdev_init failed: %s", esp_err_to_name(ret_i2c));
		return;
	}

	// Schreibe einen Testwert in den NVS
	nvs_handle_t handle;
	esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle);
	if (err != ESP_OK) {
		ESP_LOGE("NVS", "Fehler beim Öffnen des NVS (%s)", esp_err_to_name(err));
	} else {
		int32_t test_value = 40;  // Hier hardgecodeter Sollwert fürs Testing
		err = nvs_set_i32(handle, NVS_KEY_TARGET, test_value);
		if (err != ESP_OK) {
			ESP_LOGE("NVS", "Fehler beim Schreiben in den NVS (%s)", esp_err_to_name(err));
		} else {
			ESP_LOGI("NVS", "Wert %d in NVS gespeichert", test_value);
		}
		// Änderungen übernehmen
		err = nvs_commit(handle);
		if (err != ESP_OK) {
			ESP_LOGE("NVS", "Fehler beim Commit in den NVS (%s)", esp_err_to_name(err));
		}
		nvs_close(handle);
	}

	led_init();
	wifi_init();
	vTaskDelay(pdMS_TO_TICKS(2000));
	initialize_sntp();
	wait_for_time_sync();
	solace_init();
	pump_init();
	sensor_init();
}