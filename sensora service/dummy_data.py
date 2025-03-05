import psycopg2
import uuid
import random
from datetime import datetime

# 🔹 PostgreSQL Verbindung
DB_CONFIG = {
    "dbname": "sensora",
    "user": "postgres",
    "password": "postgres",  # Setze hier dein DB-Passwort ein!
    "host": "localhost",
    "port": 5432,
}

# 🔹 Verbindung zur Datenbank
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

def generate_uuid():
    return str(uuid.uuid4())

# ✅ 1. Benutzer einfügen
def insert_users():
    users = [
        ("user1", "fynnth@outlook.de", "password1", "Alice", "Smith", "Peashooter", False),
        ("user2", "user2@example.com", "password2", "Bob", "Jones", "Sunflower", True),
    ]
    cur.executemany(
        "INSERT INTO sensora.users (username, mail, password, firstname, lastname, avatar_ref, active) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
        users,
    )
    conn.commit()
    print("✅ Benutzer erstellt")

# ✅ 2. Gruppen erstellen
def insert_groups():
    groups = [
        ("group1", "Gartenfreunde", "Chomper"),
        ("group2", "Gewächshaus-Team", "Marigold"),
    ]
    cur.executemany(
        "INSERT INTO sensora.groups (gid, name, avatar_ref) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
        groups,
    )
    conn.commit()
    print("✅ Gruppen erstellt")

# ✅ 3. Gruppenmitglieder zuweisen
def insert_group_members():
    members = [
        ("user1", "group1"),
        ("user2", "group2"),
    ]
    cur.executemany(
        'INSERT INTO sensora.group_members ("user", "group") VALUES (%s, %s) ON CONFLICT DO NOTHING',
        members,
    )
    conn.commit()
    print("✅ Gruppenmitglieder hinzugefügt")

# ✅ 4. Räume erstellen
def insert_rooms():
    rooms = [
        ("room1", "Tomaten-Gewächshaus", "group1", "user1"),
        ("room2", "Salatbeet", "group2", "user2"),
    ]

    for room in rooms:
        rid, name, group, owner = room
        try:
            cur.execute(
                'INSERT INTO sensora.rooms (rid, name, "group", owner) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING',
                (rid, name, group, owner),
            )
            print(f"✅ Raum '{name}' ({rid}) erfolgreich erstellt.")
        except Exception as e:
            print(f"❌ Fehler beim Einfügen von Raum '{name}': {e}")

    conn.commit()
    print("✅ Räume in der Datenbank gespeichert.")

# ✅ 5. Pflanzen hinzufügen (Raum muss existieren!)
def insert_plants():
    plants = [
        ("plant1", "Tomaten", "Fruchtig", "room1"),
        ("plant2", "Salat", "Grün", "room2"),
    ]

    for plant in plants:
        pid, name, variant, room = plant

        # 🔹 Prüfen, ob der Raum existiert
        cur.execute("SELECT COUNT(*) FROM sensora.rooms WHERE rid = %s", (room,))
        room_exists = cur.fetchone()[0] > 0

        if not room_exists:
            print(f"❌ Fehler: Raum '{room}' existiert nicht! Pflanze '{name}' kann nicht hinzugefügt werden.")
            continue  # Pflanze wird nicht eingefügt, wenn der Raum fehlt

        cur.execute(
            "INSERT INTO sensora.plants (pid, name, variant, room) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
            (pid, name, variant, room),
        )

    conn.commit()
    print("✅ Pflanzen erstellt")

# ✅ 6. Zielwerte für Pflanzen einfügen
def insert_target_values():
    target_values = [
        ("target1", 22.5, "temperature", "plant1"),
        ("target2", 50.0, "humidity", "plant2"),
    ]
    cur.executemany(
        "INSERT INTO sensora.target_values (tid, value, ilk, plant) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
        target_values,
    )
    conn.commit()
    print("✅ Zielwerte für Pflanzen erstellt")

# ✅ 7. Controller hinzufügen
def insert_controllers():
    controllers = [
        ("controller1", "secret123", "ESP32", "user1"),
        ("controller2", "secret456", "Arduino", "user2"),
    ]
    cur.executemany(
        "INSERT INTO sensora.controllers (did, secret, model, owner) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
        controllers,
    )
    conn.commit()
    print("✅ Mikrocontroller erstellt")

# ✅ 8. Sensoren einfügen (Pflanze muss existieren!)
def insert_sensors():
    sensors = [
        ("sensor1", datetime.now(), "temperature", "Celsius", "active", "plant1", "controller1"),
        ("sensor2", datetime.now(), "humidity", "%", "active", "plant2", "controller2"),
    ]

    for sensor in sensors:
        sid, last_call, ilk, unit, status, plant, controller = sensor

        cur.execute("SELECT COUNT(*) FROM sensora.plants WHERE pid = %s", (plant,))
        plant_exists = cur.fetchone()[0] > 0

        if not plant_exists:
            print(f"❌ Fehler: Pflanze '{plant}' existiert nicht! Sensor '{sid}' kann nicht hinzugefügt werden.")
            continue  # Sensor wird nicht eingefügt, wenn die Pflanze fehlt

        cur.execute(
            "INSERT INTO sensora.sensors (sid, last_call, ilk, unit, status, plant, controller) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
            (sid, last_call, ilk, unit, status, plant, controller),
        )

    conn.commit()
    print("✅ Sensoren erstellt")

# ✅ 9. Messwerte simulieren
def insert_values():
    values = [
        (generate_uuid(), random.uniform(20, 30), datetime.now(), "sensor1", "plant1"),
        (generate_uuid(), random.uniform(40, 60), datetime.now(), "sensor2", "plant2"),
    ]
    cur.executemany(
        "INSERT INTO sensora.values (vid, value, timestamp, sensor, plant) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
        values,
    )
    conn.commit()
    print("✅ Sensormesswerte erstellt")

# 🔥 Hauptfunktion: Alles in richtiger Reihenfolge ausführen
def main():
    insert_users()
    insert_groups()
    insert_group_members()
    insert_rooms()
    insert_plants()
    insert_target_values()
    insert_controllers()
    insert_sensors()
    insert_values()

    cur.close()
    conn.close()
    print("\n🚀 Dummy-Daten erfolgreich in die Datenbank eingefügt!")

if __name__ == "__main__":
    main()
