#include "device_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"
#include "system_data_manager.h"
#include "esp_log.h"

void app_main(void) {
	//initialisiere Gerät
	device_init();
	ESP_LOGI("APP_MAIN", "⏳ Initialisierung läuft...");
	while (!device_init_done()) {
		vTaskDelay(pdMS_TO_TICKS(1000));
	}
	stop_ap();
	ESP_LOGI("APP_MAIN", "✅ Inititalisierung abgeschlossen.");
	//initialisiere routine
	solace_init(); // Verbindet sich mit Solace MQTT Broker
	adc_init(); // Startet Sensor-Erfassung
}
