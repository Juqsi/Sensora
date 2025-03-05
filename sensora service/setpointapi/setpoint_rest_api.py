# setpoint_rest_api.py
from flask import Flask, request, jsonify
import solace.messaging.messaging_service as messaging_service
from solace.messaging.resources.queue import Queue
from solace.messaging.resources.topic import Topic
import json
import os
import time

# 🔹 Solace Konfiguration
SOLACE_CONFIG = {
    "solace.messaging.transport.host": os.getenv("SOLACE_HOST", "tcp://localhost:55555"),
    "solace.messaging.service.vpn-name": os.getenv("SOLACE_VPN", "default"),
    "solace.messaging.authentication.basic.username": os.getenv("SOLACE_USER", "admin"),
    "solace.messaging.authentication.basic.password": os.getenv("SOLACE_PASS", "admin"),
}

QUEUE_NAME = "sensor_setpoints"

app = Flask(__name__)

# 🔹 Solace-Verbindung & Publisher
messaging_service = messaging_service.MessagingService.builder().from_properties(SOLACE_CONFIG).build()


for i in range(10):
    try:
        messaging_service.connect()
        print("✅ Verbunden mit Solace!")
        break
    except Exception as e:
        print(f"❌ Versuch {i+1}/10 fehlgeschlagen: {e}")
        time.sleep(5)
else:
    print("❌ Konnte keine Verbindung zu Solace herstellen.")
    exit(1)


publisher = messaging_service.create_persistent_message_publisher_builder().build()
publisher.start()

@app.route('/sollwert', methods=['POST'])
def post_sollwert():
    data = request.get_json()
    sensor_id = data.get("sensor_id")
    sollwert = data.get("sollwert")

    if not sensor_id or sollwert is None:
        return jsonify({"error": "sensor_id und sollwert erforderlich"}), 400

    payload = json.dumps({
        "sensor_id": sensor_id,
        "sollwert": sollwert
    })

    topic = Topic.of(f"sensor/setpoints/{sensor_id}")
    publisher.publish(messaging_service.message_builder().build(payload), topic)

    print(f"✅ Sollwert gesendet -> Sensor: {sensor_id}, Sollwert: {sollwert}")
    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
