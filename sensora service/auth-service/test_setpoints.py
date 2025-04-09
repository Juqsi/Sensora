import paho.mqtt.client as mqtt
import json
import time
import uuid

# Test Configuration
SOLACE_HOST = "localhost"
SOLACE_PORT = 1883
SOLACE_USER = "admin"  # Should match your Solace admin credentials
SOLACE_PASSWORD = "admin"

class SetpointTester:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_publish = self.on_publish
        self.messages_received = []
        self.publish_confirmed = False
        
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ Connected to Solace broker")
            # Subscribe to all setpoint messages for testing
            self.client.subscribe("sensora/v1/receive/+/targetValues")
        else:
            print(f"❌ Connection failed with code {rc}")
    
    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            print(f"\n📥 Received message on {msg.topic}:")
            print(json.dumps(payload, indent=2))
            self.messages_received.append({
                "topic": msg.topic,
                "payload": payload
            })
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON received: {msg.payload.decode()}")
    
    def on_publish(self, client, userdata, mid):
        print("✅ Message published successfully")
        self.publish_confirmed = True
    
    def connect(self):
        print("\n🔌 Connecting to Solace broker...")
        self.client.username_pw_set(SOLACE_USER, SOLACE_PASSWORD)
        self.client.connect(SOLACE_HOST, SOLACE_PORT, 60)
        self.client.loop_start()
    
    def publish_test_setpoint(self, controller_id):
        """Publish a test setpoint for a specific controller"""
        topic = f"sensora/v1/receive/{controller_id}/targetValues"
        payload = {
            "timestamp": int(time.time()),
            "setpoints": {
                "temperature": 22.5,
                "humidity": 45
            }
        }
        
        print(f"\n📤 Publishing test setpoint to {topic}:")
        print(json.dumps(payload, indent=2))
        
        self.publish_confirmed = False
        self.client.publish(topic, json.dumps(payload), qos=1)
        
        # Wait for confirmation
        timeout = time.time() + 5
        while not self.publish_confirmed and time.time() < timeout:
            time.sleep(0.1)
        
        if not self.publish_confirmed:
            print("❌ Publish confirmation timeout")
    
    def disconnect(self):
        print("\n🔌 Disconnecting from Solace broker...")
        self.client.loop_stop()
        self.client.disconnect()

def main():
    print("🚀 Starting Setpoint API Test\n")
    
    # Create test controller ID
    test_controller_id = str(uuid.uuid4())
    print(f"📝 Test Controller ID: {test_controller_id}")
    
    tester = SetpointTester()
    tester.connect()
    
    # Wait for connection
    time.sleep(2)
    
    # Publish test setpoint
    tester.publish_test_setpoint(test_controller_id)
    
    # Wait for messages
    print("\n⏳ Waiting for messages (5 seconds)...")
    time.sleep(5)
    
    # Check results
    if tester.messages_received:
        print("\n✅ Test completed successfully!")
        print(f"📊 Received {len(tester.messages_received)} messages")
    else:
        print("\n❌ No messages received during test")
    
    tester.disconnect()

if __name__ == "__main__":
    main() 