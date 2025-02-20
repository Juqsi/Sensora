#ifndef SOLACE_MANAGER_H
#define SOLACE_MANAGER_H

#include "esp_event.h"

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data);
void solace_init();

#endif // SOLACE_MANAGER_H
