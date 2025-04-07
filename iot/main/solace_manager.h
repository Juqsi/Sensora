#ifndef SOLACE_MANAGER_H
#define SOLACE_MANAGER_H

#include "esp_event.h"
#include "cJSON.h"

cJSON* create_json_sensor(char sid[], char did[], int values[], int valueCount, char ilk[], char unit[], char status[], char timestamps[][20], char lastCall[20]);
char* create_json_message(char did[], cJSON *sensors[], int num_sensors);
void send_message(const char *message);
void solace_init(void);

#endif // SOLACE_MANAGER_H
