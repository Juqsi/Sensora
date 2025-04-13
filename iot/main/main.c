#include "device_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"
#include <time.h>
#include "esp_sntp.h"
#include "pump_manager.h"
#include "i2cdev.h"
#include "esp_log.h"
#include "system_data_manager.h"
#include "esp_log.h"


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
	//initialisiere Gerät
	device_init();
	ESP_LOGI("APP_MAIN", "⏳ Warte auf WLAN-Verbindung...");
	while (!device_init_done()) {
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
	if (ap_delayed_stop_task_handle == NULL) {
		xTaskCreate(ap_delayed_stop_task, "ap_stop_delayed", 2048, NULL, 5,
		            &ap_delayed_stop_task_handle);
	}

	// Globalen I²C-Dev-Stack initialisieren
	esp_err_t ret_i2c = i2cdev_init();
	if (ret_i2c != ESP_OK) {
		ESP_LOGE("APP_MAIN", "i2cdev_init failed: %s", esp_err_to_name(ret_i2c));
		return;
	}

	ESP_LOGI("APP_MAIN", "✅ Inititalisierung abgeschlossen.");
	//initialisiere routine

	initialize_sntp();
	wait_for_time_sync();
	solace_init();
	pump_init();
	sensor_init();
}