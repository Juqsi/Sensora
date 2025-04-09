import requests
import json
import hmac
import hashlib
from base64 import b64decode
from cryptography.fernet import Fernet
import paho.mqtt.client as mqtt
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Test Configuration
AUTH_SERVICE_URL = "http://localhost:5001"  # Updated port

# Simulated Controller Data
HARDWARE_TOKEN = "4b05ba9a-1da7-48ba-88c9-bb7fa6c305a9"
TOKEN_HASH = hmac.new(
    b"your-secret-key-min-32-bytes-long!!", 
    HARDWARE_TOKEN.encode(), 
    hashlib.sha256
).hexdigest()

# Simulated User Data
USERNAME = "user1"  # Using existing test user

class TestController:
    def __init__(self):
        self.credentials = None
        self.mqtt_client = None
        self.received_messages = []

    def calculate_hmac(self, challenge):
        """Calculate HMAC for challenge response"""
        return hmac.new(
            HARDWARE_TOKEN.encode(),
            challenge.encode(),
            hashlib.sha256
        ).hexdigest()

    def authenticate(self):
        """Go through the complete authentication process"""
        print("\n🔐 Starting authentication process...")
        
        # Step 1: Request Challenge
        print("\n1️⃣ Requesting challenge...")
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/controller/init",
            json={
                "token_hash": TOKEN_HASH,
                "username": USERNAME  # Include username in request
            }
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get challenge: {response.text}")
            return False
            
        challenge = response.json()["challenge"]
        print(f"✅ Received challenge: {challenge}")

        # Step 2: Respond to Challenge
        print("\n2️⃣ Sending challenge response...")
        challenge_response = self.calculate_hmac(challenge)
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/controller/verify",
            json={
                "token_hash": TOKEN_HASH,
                "challenge_response": challenge_response
            }
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to verify challenge: {response.text}")
            return False
            
        print("✅ Challenge verified successfully")

        # Step 3: Decrypt Credentials
        print("\n3️⃣ Decrypting credentials...")
        data = response.json()
        session_key = data["session_key"]
        credential_key = data["credential_key"]
        encrypted_credentials = data["encrypted_credentials"]

        # Verify credential key
        expected_key = hmac.new(
            HARDWARE_TOKEN.encode(),
            session_key.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if credential_key != expected_key:
            print("❌ Credential key verification failed!")
            return False
            
        print("✅ Credential key verified")

        # Decrypt credentials
        f = Fernet(session_key.encode())
        decrypted_data = f.decrypt(encrypted_credentials.encode())
        self.credentials = json.loads(decrypted_data)
        
        # Override broker URL with local environment variable
        self.credentials['broker_url'] = os.getenv('SOLACE_PUBLIC_URL', 'localhost')
        
        print("✅ Credentials decrypted successfully")
        print(f"📝 Username: {self.credentials['username']}")
        print(f"📝 Broker URL: {self.credentials['broker_url']}")
        print(f"📝 Broker Port: {self.credentials['broker_port']}")
        print(f"📝 Use SSL: {self.credentials['broker_ssl']}")
        print(f"📝 Publish Topic: {self.credentials['publish_topic']}")
        print(f"📝 Subscribe Topic: {self.credentials['subscribe_topic']}")
        
        return True

    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print("\n✅ Connected to Solace successfully!")
            # Subscribe to receive topic
            client.subscribe(self.credentials['subscribe_topic'])
            print(f"✅ Subscribed to: {self.credentials['subscribe_topic']}")
        else:
            print(f"❌ Failed to connect to Solace: {rc}")

    def on_message(self, client, userdata, msg):
        """Callback when message is received"""
        print(f"\n📨 Received message on {msg.topic}:")
        try:
            payload = json.loads(msg.payload.decode())
            print(json.dumps(payload, indent=2))
            self.received_messages.append(payload)
        except:
            print(msg.payload.decode())

    def connect_mqtt(self):
        """Connect to Solace MQTT"""
        print("\n🔄 Connecting to Solace...")
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        
        # Set credentials
        self.mqtt_client.username_pw_set(
            self.credentials['username'],
            self.credentials['password']
        )
        
        # Use localhost when running locally
        broker_url = "localhost"  # Always use localhost for local testing
        broker_port = self.credentials['broker_port']
        
        print(f"🔄 Connecting to {broker_url}:{broker_port}...")
        
        try:
            self.mqtt_client.connect(
                broker_url,
                broker_port,
                60
            )
            self.mqtt_client.loop_start()
            return True
        except Exception as e:
            print(f"❌ Failed to connect to MQTT: {e}")
            return False

    def wait_for_messages(self, timeout=10):
        """Wait for messages for a specified timeout"""
        print(f"\n⏳ Waiting for messages ({timeout} seconds)...")
        start_time = time.time()
        while time.time() - start_time < timeout:
            time.sleep(1)  # Allow MQTT loop to process messages
        print("\n⏳ Message wait timeout reached.")

    def publish_test_data(self):
        """Publish test sensor data"""
        print("\n📤 Publishing test sensor data...")
        
        test_data = {
            "did": self.credentials['did'],
            "model": self.credentials['model'],
            "username": USERNAME,
            "sensors": [
                {
                    "sid": f"{self.credentials['did'][:8]}-temp",
                    "ilk": "temperature",
                    "unit": "°C",
                    "status": "active",
                    "values": [
                        {
                            "timestamp": "2024-03-20T12:00:00Z",
                            "value": 23.5
                        },
                        {
                            "timestamp": "2024-03-20T12:05:00Z",
                            "value": 24.0
                        }
                    ]
                },
                {
                    "sid": f"{self.credentials['did'][:8]}-hum",
                    "ilk": "humidity",
                    "unit": "%",
                    "status": "active",
                    "values": [
                        {
                            "timestamp": "2024-03-20T12:00:00Z",
                            "value": 55.5
                        },
                        {
                            "timestamp": "2024-03-20T12:05:00Z",
                            "value": 56.0
                        }
                    ]
                }
            ]
        }
        
        print("\n📤 Sending data:")
        print(json.dumps(test_data, indent=2))
        
        result = self.mqtt_client.publish(
            self.credentials['publish_topic'],
            json.dumps(test_data)
        )
        
        if result.rc == 0:
            print("✅ Test data published successfully")
        else:
            print(f"❌ Failed to publish test data: {result.rc}")

def main():
    print("🚀 Starting Controller Test\n")
    
    # Create and authenticate controller
    controller = TestController()
    if not controller.authenticate():
        print("❌ Authentication failed")
        return
        
    # Connect to Solace
    if not controller.connect_mqtt():
        print("❌ MQTT connection failed")
        return
        
    # Wait for connection to establish
    time.sleep(2)
    
    # Publish test data
    controller.publish_test_data()
    
    # Wait for potential responses
    controller.wait_for_messages(timeout=10)
    
    # Cleanup
    if controller.mqtt_client:
        controller.mqtt_client.loop_stop()
        controller.mqtt_client.disconnect()
    
    print("\n✨ Test completed!")

if __name__ == "__main__":
    main()