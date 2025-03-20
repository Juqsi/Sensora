import paho.mqtt.client as mqtt
import json
import time

# 🔹 Solace MQTT Konfiguration
BROKER = "localhost"
PORT = 1883
CONTROLLER_ID = "controller1"  # Simulierter ESP-Controller
TOPIC = f"sensora/v1/send/{CONTROLLER_ID}"
SUBSCRIPTION = "sensora/v1/send/#"  # Alle Controller-IDs empfangen

# 🔹 Callback für Verbindung (wichtig für Subscription)
def on_connect(client, userdata, flags, rc):
    print(f"🔌 Verbunden mit Code {rc}")
    client.subscribe(SUBSCRIPTION)
    print(f"📡 Subscribed auf {SUBSCRIPTION}")

client = mqtt.Client()
client.on_connect = on_connect
client.connect(BROKER, PORT, 60)

time.sleep(2)  # Kurz warten, bis die Verbindung stabil ist

# 🔹 Simulierte Sensordaten
sensors = [
    {
        "sid": "sensor1",
        "ilk": "temperature",
        "unit": "°C",
        "status": "active",
        "values": [
            {"timestamp": "2025-03-02T12:00:00Z", "value": 21.5},
            {"timestamp": "2025-03-02T12:05:00Z", "value": 22.1}
        ]
    },
    {
        "sid": "sensor2",
        "ilk": "humidity",
        "unit": "%",
        "status": "active",
        "values": [
            {"timestamp": "2025-03-02T12:00:00Z", "value": 60.2},
            {"timestamp": "2025-03-02T12:05:00Z", "value": 61.0}
        ]
    }
]

# 🔹 JSON-Payload für das neue Format
payload = json.dumps({
    "did": CONTROLLER_ID,
    "model": "FullControll-4-Sensors",
    "sensors": sensors
})

# 🔹 Senden an Solace MQTT-Broker
client.publish(TOPIC, payload, qos=1)
print(f"📡 Messwerte gesendet an {TOPIC}:")
print(json.dumps(json.loads(payload), indent=4))

time.sleep(1)  # Warten, damit das MQTT-Message-Handling Zeit hat

print("✅ Test abgeschlossen!")

client.disconnect()
