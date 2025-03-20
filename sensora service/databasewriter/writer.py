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
TIMEOUT_INTERVAL = 300  # Timeout nach 5 Minuten
CHECK_INTERVAL = 60  # Alle 60 Sekunden prüfen

# 🔹 Verbindung zur Datenbank
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG, client_encoding="UTF8")
        return conn
    except Exception as e:
        print(f"❌ [DB] Fehler beim Herstellen der Verbindung: {e}")
        return None

# 🔹 Sensorwerte speichern
def save_sensor_data(sensor_id, values, controller_id):
    conn = get_db_connection()
    if not conn:
        print("❌ [DB] Verbindung nicht verfügbar. Breche Speicherung ab.")
        return

    try:
        cur = conn.cursor()

        for entry in values:
            timestamp = entry.get("timestamp", "CURRENT_TIMESTAMP")
            value = entry.get("value", None)

            if value is None:
                print(f"⚠️ [DB] Kein Wert für Sensor {sensor_id} gefunden.")
                continue

            vid = str(uuid.uuid4())

            # 🔍 Plant aus der DB holen
            cur.execute("SELECT plant FROM sensora.sensors WHERE sid = %s", (sensor_id,))
            plant_result = cur.fetchone()
            plant_id = plant_result[0] if plant_result else None

            if not plant_id:
                print(f"⚠️ [DB] Kein `plant` für Sensor {sensor_id} gefunden. Wert wird nicht gespeichert.")
                continue

            print(f"🔍 [DB] Speichere Wert -> Sensor: {sensor_id}, Wert: {value}, Zeit: {timestamp}, Controller: {controller_id}, Plant: {plant_id}")

            cur.execute("""
                INSERT INTO sensora.values (vid, value, timestamp, sensor, plant)
                VALUES (%s, %s, %s, %s, %s)
            """, (vid, value, timestamp, sensor_id, plant_id))

        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ [DB] Alle Werte für Sensor {sensor_id} gespeichert.")

    except Exception as e:
        print(f"❌ [DB] Fehler beim Speichern in die Datenbank: {e}")

# 🔹 Sensor-Status speichern
def update_last_call(sensor_id, status="active"):
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE sensora.sensors
            SET last_call = CURRENT_TIMESTAMP, status = %s
            WHERE sid = %s
        """, (status, sensor_id))

        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ [DB] last_call für Sensor {sensor_id} erfolgreich aktualisiert.")

    except Exception as e:
        print(f"❌ [DB] Fehler beim Aktualisieren in der Datenbank: {e}")

# 🔹 Funktion zur Timeout-Prüfung
def check_sensor_timeouts():
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()

        print("⏳ [DB] Überprüfe Sensor-Timeouts...")
        cur.execute("""
            UPDATE sensora.sensors
            SET status = 'error'
            WHERE last_call < NOW() - INTERVAL '5 minutes'
            AND status = 'active';
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("✅ [DB] Timeout-Überprüfung abgeschlossen. Sensoren wurden ggf. auf 'error' gesetzt.")

    except Exception as e:
        print(f"❌ [DB] Fehler bei der Timeout-Überprüfung: {e}")

# 🔹 Solace-Verbindung aufbauen
messaging_service = messaging_service.MessagingService.builder().from_properties(SOLACE_CONFIG).build()
for i in range(10):
    try:
        messaging_service.connect()
        print("✅ [Solace] Verbunden mit Solace!")
        break
    except Exception as e:
        print(f"❌ [Solace] Versuch {i+1}/10 fehlgeschlagen: {e}")
        time.sleep(5)
else:
    print("❌ [Solace] Konnte keine Verbindung zu Solace herstellen.")
    exit(1)

# 🔹 Queue definieren & Receiver erstellen
queue = Queue.durable_exclusive_queue(QUEUE_NAME)
receiver = messaging_service.create_persistent_message_receiver_builder().build(queue)
receiver.start()
print(f"✅ [Solace] Queue-Receiver '{QUEUE_NAME}' ist aktiv!")

# 🔹 Nachrichtenhandler-Klasse
class SensorMessageHandler(MessageHandler):
    def on_message(self, message):
        try:
            # 🛠 Payload sicher dekodieren
            payload = message.get_payload_as_string()
            if payload is None:
                payload = message.get_payload_as_bytes().decode("utf-8")

            print(f"✅ [Solace] Nachricht empfangen: {payload}")

            # 📡 JSON-Parsing & Verarbeitung
            try:
                data = json.loads(payload)

                # 🔍 Controller-ID auslesen
                controller_id = data.get("did", "unknown")
                if controller_id == "unknown":
                    print("⚠️ [Solace] Ungültige Nachricht. Controller-ID fehlt.")
                    return

                # 🔍 Alle Sensoren durchgehen
                for sensor in data.get("sensors", []):
                    sensor_id = sensor.get("sid", "unknown")
                    sensor_status = sensor.get("status", "unknown")

                    if sensor_id == "unknown":
                        print("⚠️ [Solace] Sensor-ID fehlt in der Nachricht.")
                        continue

                    # ⏳ Status in der DB aktualisieren
                    update_last_call(sensor_id, sensor_status)

                    # 🔄 Werte speichern
                    values = sensor.get("values", [])
                    if values:
                        save_sensor_data(sensor_id, values, controller_id)

                # ✅ Nachricht bestätigen
                receiver.ack(message)

            except json.JSONDecodeError:
                print("⚠️ [Solace] Nachricht ist kein gültiges JSON!")

        except Exception as e:
            print(f"❌ [Solace] Fehler bei der Verarbeitung: {e}")

# 🔹 Receiver startet asynchron
receiver.receive_async(SensorMessageHandler())

print(f"🔄 [Solace] Warte auf Nachrichten aus der Queue '{QUEUE_NAME}' ...")

# 🔹 Hauptschleife mit Timeout-Check
counter = 0
while True:
    time.sleep(1)  # Verhindert 100% CPU-Auslastung

    counter += 1
    if counter >= CHECK_INTERVAL:
        check_sensor_timeouts()
        counter = 0
