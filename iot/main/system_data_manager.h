#ifndef SYSTEM_DATA_MANAGER_H
#define SYSTEM_DATA_MANAGER_H

#pragma once

#include "esp_err.h"
#include "mqtt_client.h"

// Struktur zur Speicherung der Benutzerdaten
typedef struct {
	char username[32];
	char hardware_token[32];
	char software_token[64];
	char solace_username[32];
	char solace_password[32];
}system_data_t;

// Initialisiert NVS (nur einmal beim Start notwendig)
esp_err_t system_data_storage_init(void);

// Speichert die Benutzerdaten im Flash
esp_err_t save_system_data(const system_data_t *info);

// Lädt die Benutzerdaten aus dem Flash
esp_err_t load_system_data(system_data_t *info);

// Löscht die Benutzerdaten aus dem Flash
esp_err_t erase_system_data(void);

#endif
