import time
import solace.messaging.messaging_service as messaging_service
from solace.messaging.resources.queue import Queue
from solace.messaging.receiver.message_receiver import MessageHandler
import json
import psycopg2
import uuid
import os

# 🔹 PostgreSQL Verbindungskonfiguration
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "sensora"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "postgres"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# 🔹 Solace Konfiguration
SOLACE_CONFIG = {
    "solace.messaging.transport.host": os.getenv("SOLACE_HOST", "tcp://localhost:55555"),
    "solace.messaging.service.vpn-name": os.getenv("SOLACE_VPN", "default"),
    "solace.messaging.authentication.basic.username": os.getenv("SOLACE_USER", "admin"),
    "solace.messaging.authentication.basic.password": os.getenv("SOLACE_PASS", "admin"),
}

QUEUE_NAME = "sensor_data"

# 🔹 Verbindung zur Datenbank
def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, client_encoding="UTF8")

# 🔹 Sensorwerte speichern
def save_sensor_data(sensor_id, value):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        print(f"🔍 Debug: Speichere Sensor-Daten -> ID: {sensor_id}, Wert: {value}")

        # ✅ Fix: Kein Encoding/Decoding mehr!
        sensor_id = str(sensor_id).strip()

        # 🔄 Sensorwerte speichern
        vid = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO sensora.values (vid, value, timestamp, sensor, plant)
            VALUES (%s, %s, CURRENT_TIMESTAMP, %s, (SELECT plant FROM sensora.sensors WHERE sid = %s))
        """, (vid, value, sensor_id, sensor_id))

        print(f"✅ Wert {value} für Sensor {sensor_id, sensor_id} erfolgreich gespeichert.")

        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Fehler beim Speichern in die Datenbank: {e}")

# 🔹 Sensorwerte speichern
def update_last_call(sensor_id, status="active"):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        print(f"🔍 Debug: Aktualisiere last_call -> ID: {sensor_id}")

        # ✅ Fix: Kein Encoding/Decoding mehr!
        sensor_id = str(sensor_id).strip()

        # 🔄 Sensorwerte speichern
        cur.execute("""
            UPDATE sensora.sensors
            SET last_call = CURRENT_TIMESTAMP, status = %s
            WHERE sid = %s
        """, (status, sensor_id))

        print(f"✅ last_call für Sensor {sensor_id, sensor_id} erfolgreich gespeichert.")

        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Fehler beim Aktualisieren in die Datenbank: {e}")



# 🔹 Solace-Verbindung aufbauen
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

# 🔹 Queue definieren & Receiver erstellen
queue = Queue.durable_exclusive_queue(QUEUE_NAME)
receiver = messaging_service.create_persistent_message_receiver_builder().build(queue)
receiver.start()
print(f"✅ Queue-Receiver '{QUEUE_NAME}' ist aktiv!")

# 🔹 Nachrichtenhandler-Klasse
class SensorMessageHandler(MessageHandler):
    def on_message(self, message):
        try:
            # 🛠 Payload sicher dekodieren
            payload = message.get_payload_as_string()
            if payload is None:
                payload = message.get_payload_as_bytes().decode("utf-8")

            print(f"✅ Nachricht empfangen: {payload}")

            # 📡 JSON-Parsing & Verarbeitung
            try:
                data = json.loads(payload)

                if data.get("type") == "value":
                    sensor_id = data.get("sensor_id", "unknown")
                    value = data.get("value", None)

                    # 🛠 Validierung: Sensor-ID darf nicht leer sein
                    if sensor_id == "unknown" or value == None:
                        print("⚠️ Ungültige Wert-Nachricht. Sensor-ID oder Wert fehlt.")
                        return

                    # 💾 Sensordaten speichern
                    save_sensor_data(sensor_id, value)
                    update_last_call(sensor_id)
                elif data.get("type") == "status":
                    sensor_id = data.get("sensor_id", "unknown")
                    status = data.get("status", "unknown")

                    # 🛠 Validierung: Sensor-ID darf nicht leer sein
                    if sensor_id == "unknown":
                        print("⚠️ Ungültige Status-Nachricht. Sensor-ID fehlt.")
                        return

                    # 💾 Sensordaten speichern
                    update_last_call(sensor_id, status=status)
                else:
                    print("⚠️ Unbekannter Nachrichtentyp!")

                # ✅ Nachricht bestätigen
                receiver.ack(message)

            except json.JSONDecodeError:
                print("⚠️ Nachricht ist kein gültiges JSON!")

        except Exception as e:
            print(f"❌ Fehler bei der Verarbeitung: {e}")

# 🔹 Receiver startet asynchron
receiver.receive_async(SensorMessageHandler())

print(f"🔄 Warte auf Nachrichten aus der Queue '{QUEUE_NAME}' ...")

# 🔹 Halte das Skript am Laufen
while True:
    time.sleep(1)
