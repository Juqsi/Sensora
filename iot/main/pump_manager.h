#ifndef PUMP_MANAGER_H
#define PUMP_MANAGER_H

#include "freertos/FreeRTOS.h"

extern QueueHandle_t pumpQueue;

typedef struct {
	int duration;
} pump_params_t;

int calculate_watering_duration(int current_moisture);
void pump_task(void *pvParameters);
BaseType_t pump_send_command(const pump_params_t *cmd, TickType_t ticksToWait);
void pump_init(void);

#endif // PUMP_MANAGER_H
