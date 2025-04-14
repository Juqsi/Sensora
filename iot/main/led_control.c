#include "led_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static TaskHandle_t blink_task_handle = NULL;

static void led_blink_task(void *pvParameter) {
	while (1) {
		led_on();
		vTaskDelay(pdMS_TO_TICKS(500));
		led_off();
		vTaskDelay(pdMS_TO_TICKS(500));
	}
}

void led_init(void) {
	gpio_set_direction(LED_GPIO, GPIO_MODE_OUTPUT);
	led_off();
}

void led_on(void) {
	gpio_set_level(LED_GPIO, 1);
}

void led_off(void) {
	gpio_set_level(LED_GPIO, 0);
}

void led_blink_start(void) {
	if (blink_task_handle == NULL) {
		xTaskCreate(led_blink_task, "led_blink_task", 1024, NULL, 5, &blink_task_handle);
	}
}

void led_blink_stop(void) {
	if (blink_task_handle != NULL) {
		vTaskDelete(blink_task_handle);
		blink_task_handle = NULL;
		led_off();
	}
}
