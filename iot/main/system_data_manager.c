#include "system_data_manager.h"
#include <string.h>
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "mqtt_client.h"

static const char *TAG = "system_data_storage";

static const char *NVS_NAMESPACE = "storage";
static const char *NVS_KEY = "system_data";

system_data_t stored_system_data;

esp_err_t system_data_storage_init() {
	esp_err_t err = nvs_flash_init();
	if (err == ESP_ERR_NVS_NO_FREE_PAGES || err ==
	    ESP_ERR_NVS_NEW_VERSION_FOUND) {
		ESP_ERROR_CHECK(nvs_flash_erase());
		err = nvs_flash_init();
	}
	return err;
}

esp_err_t save_system_data(const system_data_t *info) {
	nvs_handle_t handle;
	esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle);
	if (err != ESP_OK)
		return err;

	err = nvs_set_blob(handle, NVS_KEY, info, sizeof(system_data_t));
	if (err == ESP_OK) {
		err = nvs_commit(handle);
		ESP_LOGI(TAG, "✅ Benutzerdaten gespeichert");
	} else {
		ESP_LOGE(TAG, "❌ Fehler beim Speichern: %s", esp_err_to_name(err));
	}

	nvs_close(handle);
	return err;
}

esp_err_t load_system_data(system_data_t *info) {
	nvs_handle_t handle;
	size_t required_size = sizeof(system_data_t);
	esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle);
	if (err != ESP_OK)
		return err;

	err = nvs_get_blob(handle, NVS_KEY, info, &required_size);
	nvs_close(handle);

	if (err == ESP_OK) {
		ESP_LOGI(TAG, "📥 Systemdaten geladen");
	} else {
		ESP_LOGW(TAG, "⚠️ Keine Systemdaten gefunden.");
	}

	return err;
}

esp_err_t erase_system_data() {
	nvs_handle_t handle;
	esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle);
	if (err != ESP_OK)
		return err;

	err = nvs_erase_key(handle, NVS_KEY);
	if (err == ESP_OK) {
		err = nvs_commit(handle);
		ESP_LOGI(TAG, "🗑️ Benutzerdaten gelöscht.");
	} else {
		ESP_LOGW(TAG, "⚠️ Konnte Benutzerdaten nicht löschen: %s",
		         esp_err_to_name(err));
	}

	nvs_close(handle);
	return err;
}

