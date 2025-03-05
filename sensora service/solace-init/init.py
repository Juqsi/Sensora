import os
import time
import requests
import json

SOLACE_USER = os.getenv("SOLACE_USER", "admin")
SOLACE_PASS = os.getenv("SOLACE_PASS", "admin")
SOLACE_HOST = os.getenv("SOLACE_HOST_SEMP", "http://solace:8080")
VPN_NAME = os.getenv("SOLACE_VPN", "default")

HEADERS = {
    "Content-Type": "application/json"
}

QUEUE_FILE = "queues.json"


def create_queue(queue_data):
    queue_name = queue_data["queueName"]
    print(f"🔄 Erstelle Queue: {queue_name}")

    url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{VPN_NAME}/queues"
    payload = {
        "queueName": queue_name,
        "ingressEnabled": queue_data.get("ingressEnabled", True),
        "egressEnabled": queue_data.get("egressEnabled", True),
        "accessType": queue_data.get("accessType", "exclusive"),
        "permission": queue_data.get("permission", "consume")
    }

    response = requests.post(
        url,
        auth=(SOLACE_USER, SOLACE_PASS),
        headers=HEADERS,
        json=payload
    )

    if response.status_code == 200 or response.status_code == 201:
        print(f"✅ Queue '{queue_name}' erfolgreich erstellt.")
    elif response.status_code == 409:
        print(f"⚠️ Queue '{queue_name}' existiert bereits.")
    else:
        print(f"❌ Fehler beim Erstellen der Queue '{queue_name}': {response.text}")
        return

    # Subscriptions hinzufügen
    for sub in queue_data.get("subscriptions", []):
        add_subscription(queue_name, sub["subscriptionTopic"])


def add_subscription(queue_name, topic):
    print(f"🔄 Füge Subscription hinzu: {topic} -> Queue: {queue_name}")

    url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{VPN_NAME}/queues/{queue_name}/subscriptions"
    payload = {
        "subscriptionTopic": topic
    }

    response = requests.post(
        url,
        auth=(SOLACE_USER, SOLACE_PASS),
        headers=HEADERS,
        json=payload
    )

    if response.status_code == 200 or response.status_code == 201:
        print(f"✅ Subscription '{topic}' für Queue '{queue_name}' hinzugefügt.")
    elif response.status_code == 409:
        print(f"⚠️ Subscription '{topic}' für Queue '{queue_name}' existiert bereits.")
    else:
        print(f"❌ Fehler beim Hinzufügen der Subscription '{topic}' zu Queue '{queue_name}': {response.text}")


def main():
    print("🚀 Solace Init gestartet.")
    try:
        with open(QUEUE_FILE, "r") as f:
            queues_config = json.load(f)
    except Exception as e:
        print(f"❌ Fehler beim Laden der Queue-Config: {e}")
        return

    for queue in queues_config.get("queues", []):
        create_queue(queue)

    print("✅ Alle Queues und Subscriptions wurden verarbeitet.")


if __name__ == "__main__":
    main()
