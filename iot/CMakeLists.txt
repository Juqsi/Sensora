# The following lines of boilerplate have to be in your project's
# CMakeLists in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.5)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
set(CMAKE_FIND_ROOT_PATH "C:/Users/lukas/Espressif/tools/xtensa-esp-elf/esp-14.2.0_20241119/xtensa-esp-elf")
set(CMAKE_C_COMPILER "C:/Users/lukas/Espressif/tools/xtensa-esp-elf/esp-14.2.0_20241119/xtensa-esp-elf/bin/xtensa-esp32-elf-gcc.exe")
set(CMAKE_CXX_COMPILER "C:/Users/lukas/Espressif/tools/xtensa-esp-elf/esp-14.2.0_20241119/xtensa-esp-elf/bin/xtensa-esp32-elf-g++.exe")
set(CMAKE_ASM_COMPILER "C:/Users/lukas/Espressif/tools/xtensa-esp-elf/esp-14.2.0_20241119/xtensa-esp-elf/bin/xtensa-esp32-elf-gcc.exe")
project(app-template)
