import paho.mqtt.client as mqtt
import json
import time

# 🔹 Solace MQTT Konfiguration
BROKER = "localhost"
PORT = 1883
TOPIC = "sensor/data/sensor1"
SUBSCRIPTION = "sensor/data/#"  # Für alle Sensoren

# 🔹 Callback für Verbindung (wichtig für Subscription)
def on_connect(client, userdata, flags, rc):
    print(f"🔌 Verbunden mit Code {rc}")
    client.subscribe(SUBSCRIPTION)
    print(f"📡 Subscribed auf {SUBSCRIPTION}")

client = mqtt.Client()
client.on_connect = on_connect
client.connect(BROKER, PORT, 60)

sensor_id = "sensor1"

time.sleep(2)

for temp in [222.5, 23.0, 24.5, 26.0]:
    value_payload = json.dumps({
        "type": "value",
        "sensor_id": sensor_id,
        "value": temp
    })
    client.publish(TOPIC, value_payload, qos=1)
    print(f"📡 Messwert gesendet: {value_payload}")
    time.sleep(1)

print("✅ Test abgeschlossen!")

client.disconnect()
