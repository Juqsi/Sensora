#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include "esp_event.h"

void wifi_init(void);
void wifi_event_handler(void *arg, esp_event_base_t event_base, long event_id, void *event_data);
void gpio_interrupt_init(void);

#endif // WIFI_MANAGER_H