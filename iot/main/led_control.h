#ifndef LED_CONTROL_H
#define LED_CONTROL_H

#include "driver/gpio.h"

#define LED_GPIO GPIO_NUM_2  // Integrierte LED des ESP32 (meist GPIO 2)

// Funktionsprototypen (öffentliche API für LED-Steuerung)
void led_init(void);          // Initialisiert den LED-Pin
void led_on(void);            // Schaltet die LED ein
void led_off(void);           // Schaltet die LED aus
void led_blink_start(void);   // Startet die Blink-Task
void led_blink_stop(void);    // Stoppt die Blink-Task

#endif // LED_CONTROL_H
