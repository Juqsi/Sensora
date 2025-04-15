#ifndef DEVICE_MANAGER_H
#define DEVICE_MANAGER_H

#include "esp_event.h"
#include "stdbool.h"

typedef enum
{
	REGISTRATION_STATE_IDLE,
	REGISTRATION_STATE_REGISTERING,
} registration_state_t;

extern registration_state_t registration_state;
extern TaskHandle_t ap_delayed_stop_task_handle;

void device_init(void);
void wifi_event_handler(void *arg, esp_event_base_t event_base, long event_id, void *event_data);
bool device_init_done(void);
void stop_ap(void);


#endif
