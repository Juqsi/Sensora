#ifndef SOLACE_MANAGER_H
#define SOLACE_MANAGER_H

#include "esp_event.h"

void send_message(const char *message);
void solace_init(void);

#endif // SOLACE_MANAGER_H
