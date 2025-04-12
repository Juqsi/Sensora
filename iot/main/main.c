#include "device_manager.h"
#include "solace_manager.h"
#include "sensor_manager.h"
#include "system_data_manager.h"
#include "esp_log.h"

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
	ESP_LOGI("APP_MAIN", "✅ Inititalisierung abgeschlossen.");
	//initialisiere routine
	solace_init(); // Verbindet sich mit Solace MQTT Broker
	adc_init(); // Startet Sensor-Erfassung
}
