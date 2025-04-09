#include "nvs_flash.h"
#include "led_control.h"
#include "wifi_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"

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
	gpio_interrupt_init();
	solace_init();
	adc_init();
}