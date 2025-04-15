import requests
import json
import uuid

# Test Configuration
AUTH_SERVICE_URL = "http://localhost:5001"  # Updated port
ADMIN_KEY = "your-secure-admin-key"  # Should match ADMIN_KEY in .env file

def register_controller(model="Test-Controller", username=None):
    """Register a new controller and get its credentials"""
    print("\n🔐 Registering new controller...")
    
    headers = {
        "X-Admin-Key": ADMIN_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "controller_id": str(uuid.uuid4()),  # Generate new UUID for each test
        "model": model,
        "description": "Test controller for authentication testing"
    }
    
    # Füge den Username nur hinzu, wenn er angegeben wurde
    if username:
        data["username"] = username
    
    response = requests.post(
        f"{AUTH_SERVICE_URL}/api/admin/controller",
        headers=headers,
        json=data
    )
    
    if response.status_code == 201:
        result = response.json()
        print("\n✅ Controller registered successfully!")
        print(f"📝 Controller ID: {result['controller_id']}")
        if "username" in result:
            print(f"📝 Username: {result['username']}")
        print(f"📝 Hardware Token: {result['token']}")
        print(f"📝 Token Hash: {result['token_hash']}")
        return result
    else:
        print(f"\n❌ Failed to register controller: {response.text}")
        return None

def main():
    print("🚀 Starting Admin Test\n")
    
    # Try to register with invalid admin key
    print("1️⃣ Testing invalid admin key...")
    headers = {
        "X-Admin-Key": "wrong-key",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{AUTH_SERVICE_URL}/api/admin/controller",
        headers=headers,
        json={
            "model": "Test",
            "username": "user1"  # Required username
        }
    )
    
    if response.status_code == 403:
        print("✅ Invalid admin key correctly rejected")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
    
    # Register a valid controller
    print("\n2️⃣ Registering valid controller...")
    result = register_controller()
    
    if not result:
        print("❌ Test failed")
        return
    
    print("\n✨ Admin test completed successfully!")
    print("\n💡 You can use these credentials in test_controller.py:")
    print(f"""
    Update these values in test_controller.py:
    HARDWARE_TOKEN = "{result['token']}"
    TOKEN_HASH = "{result['token_hash']}"
    USERNAME = "{result['username']}"
    """)

if __name__ == "__main__":
    main()