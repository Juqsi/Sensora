# See the build system documentation in IDF programming guide
# for more information about component CMakeLists.txt files.

idf_component_register(
        SRCS main.c device_manager.c led_control.c solace_manager.c sensor_manager.c auth_service.c system_data_manager.c pump_manager.c    # list the source files of this component
        INCLUDE_DIRS .        # optional, add here public include directories
        EMBED_TXTFILES "certs/auth_service_cert.pem"
        PRIV_INCLUDE_DIRS   # optional, add here private include directories
        REQUIRES            # optional, list the public requirements (component names)
        PRIV_REQUIRES       # optional, list the private requirements

)
