# The following lines of boilerplate have to be in your project's CMakeLists
# in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.5)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(sensora_controller)

# Add required components
set(EXTRA_COMPONENT_DIRS ${CMAKE_CURRENT_SOURCE_DIR}/components)

# Add main source file
set(SOURCES
    "esp32_controller.c"
)

# Add required components
set(COMPONENTS
    "esp_wifi"
    "esp_http_client"
    "esp_https_ota"
    "mqtt"
    "cJSON"
    "mbedtls"
    "nvs_flash"
    "protocol_examples_common"
)

# Add source files
idf_component_register(SRCS ${SOURCES}
                    INCLUDE_DIRS "."
                    REQUIRES ${COMPONENTS})

# Set C standard
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON) 