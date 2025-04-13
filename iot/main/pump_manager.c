#include "pump_manager.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "driver/gpio.h"
#include "nvs.h"
#include "esp_log.h"
#include "esp_err.h"
#include <stdlib.h>

#define NVS_NAMESPACE       "storage"
#define NVS_KEY_TARGET      "target_moisture"

#define PUMP_GPIO  GPIO_NUM_4
#define DEFAULT_TARGET_MOISTURE 40
#define MIN_WATERING_TIME       2000
#define MAX_WATERING_TIME       10000
#define WATERING_K_FACTOR       100
#define PUMP_QUEUE_LENGTH  10


// Globaler Queue-Handle
QueueHandle_t pumpQueue = NULL;

// Funktion für die Bewässerungslogik
int calculate_watering_duration(int current_moisture) {
	int32_t target_moisture = DEFAULT_TARGET_MOISTURE;
	nvs_handle_t handle;
	esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle);
	if (err == ESP_OK) {
		err = nvs_get_i32(handle, NVS_KEY_TARGET, &target_moisture);
		if (err != ESP_OK) {
			ESP_LOGW("WATERING_DURATION", "NVS get target failed, using default target: %d", DEFAULT_TARGET_MOISTURE);
		}
		nvs_close(handle);
	} else {
		ESP_LOGW("WATERING_DURATION", "NVS open failed, using default target: %d", DEFAULT_TARGET_MOISTURE);
	}

	ESP_LOGI("WATERING_DURATION", "Aktuelle Bodenfeuchte: %d%%, Soll-Bodenfeuchte: %d%%", current_moisture, target_moisture);

	if (current_moisture >= target_moisture) {
		ESP_LOGI("WATERING_DURATION", "Kein Bewässerungsbedarf, da aktuelle Feuchte >= Sollwert.");
		return 0;
	}

	int deficit = target_moisture - current_moisture;
	int duration = deficit * WATERING_K_FACTOR;

	if (duration < MIN_WATERING_TIME) {
		ESP_LOGI("WATERING_DURATION", "Berechnete Bewässerungsdauer %d ms liegt unter dem Mindestwert %d ms, keine Bewässerung.",
				 duration, MIN_WATERING_TIME);
		return 0;
	}

	if (duration > MAX_WATERING_TIME) {
		duration = MAX_WATERING_TIME;
	}
	ESP_LOGI("WATERING_DURATION", "Defizit: %d%%, Berechnete Bewässerungsdauer: %d ms", deficit, duration);
	return duration;
}

// Bewässerungslogik
void pump_task(void *pvParameters) {
	/*pump_params_t *params = (pump_params_t *)pvParameters;
	int duration = params->duration;

	ESP_LOGI("PUMP_TASK", "Pumpe einschalten");
	gpio_set_level(PUMP_GPIO, 0);

	vTaskDelay(duration / portTICK_PERIOD_MS);

	ESP_LOGI("PUMP_TASK", "Pumpe ausschalten");
	gpio_set_level(PUMP_GPIO, 1);

	vTaskDelay(pdMS_TO_TICKS(30000));
	free(params);
	vTaskDelete(NULL);*/

	pump_params_t cmd;
	ESP_LOGI("PUMP_TASK", "Pumpen-Task gestartet, warte auf Befehle.");

	for (;;) {
		// Blockierende Wartezeit (portMAX_DELAY, d.h. unendlich), bis eine Nachricht in der Queue liegt
		if (xQueueReceive(pumpQueue, &cmd, portMAX_DELAY) == pdTRUE) {
			ESP_LOGI("PUMP_TASK", "Pumpenbefehl empfangen: Dauer = %d ms", cmd.duration);

			// Pumpe einschalten (angenommene invertierte Logik: LOW = Pumpe an)
			ESP_LOGI("PUMP_TASK", "Pumpe einschalten");
			gpio_set_level(PUMP_GPIO, 0);

			// Die Pumpe läuft für die angegebene Dauer
			vTaskDelay(pdMS_TO_TICKS(cmd.duration));

			// Pumpe ausschalten
			ESP_LOGI("PUMP_TASK", "Pumpe ausschalten");
			gpio_set_level(PUMP_GPIO, 1);

			// Nachdem die Pumpe ausgeschaltet wurde, wartet sie eine definierte Zeit
			// (z. B. 30 Sekunden Pause, um Überschaltung oder zu häufiges Schalten zu vermeiden)
			ESP_LOGI("PUMP_TASK", "Pause von 30 Sekunden nach Pumpenvorgang");
			vTaskDelay(pdMS_TO_TICKS(30000));
		}
	}
	vTaskDelete(NULL);
}


BaseType_t pump_send_command(const pump_params_t *cmd, TickType_t ticksToWait) {
	if (pumpQueue == NULL) {
		ESP_LOGE("PUMP_TASK", "Fehler: Pumpen-Queue ist nicht initialisiert");
		return errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY;
	}
	return xQueueSend(pumpQueue, cmd, ticksToWait);
}


void pump_init(void) {
	gpio_config_t io_conf = {
		.pin_bit_mask = (1ULL << PUMP_GPIO),
		.mode = GPIO_MODE_OUTPUT,
		.pull_up_en = 0,
		.pull_down_en = 0,
		.intr_type = GPIO_INTR_DISABLE
	};
	gpio_config(&io_conf);
	gpio_set_level(PUMP_GPIO, 1);
	ESP_LOGI("PUMP_TASK", "Pump GPIO initialisiert, Zustand: AUS");

	// Erstelle die Queue für Pumpenbefehle
	pumpQueue = xQueueCreate(PUMP_QUEUE_LENGTH, sizeof(pump_params_t));
	if (pumpQueue == NULL) {
		ESP_LOGE("PUMP_TASK", "Fehler: Pumpen-Queue konnte nicht erstellt werden");
		return;
	}

	// Starte die Pumpen-Task. Hier kannst du xTaskCreatePinnedToCore oder xTaskCreate verwenden.
	BaseType_t result = xTaskCreatePinnedToCore(pump_task, "pump_task", 2048, NULL, 5, NULL, 1);
	if (result != pdPASS) {
		ESP_LOGE("PUMP_TASK", "Fehler: Pump-Task konnte nicht gestartet werden");
	} else {
		ESP_LOGI("PUMP_TASK", "Pump-Task gestartet");
	}
}
