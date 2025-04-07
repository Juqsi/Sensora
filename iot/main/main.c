#include "nvs_flash.h"
#include "esp_sntp.h"
#include <time.h>
#include "led_control.h"
#include "wifi_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"


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
	esp_err_t ret = nvs_flash_init();
	if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
		ESP_ERROR_CHECK(nvs_flash_erase());
		ret = nvs_flash_init();
	}
	ESP_ERROR_CHECK(ret);

	led_init();
	wifi_init();
	initialize_sntp();
	wait_for_time_sync();
	solace_init();
	adc_init();
}