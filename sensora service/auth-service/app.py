import os
import json
import uuid
import hmac
import hashlib
import requests
import psycopg2
from pathlib import Path
from flask import Flask, request, jsonify
from base64 import b64encode
import datetime
from cryptography.fernet import Fernet
import secrets

app = Flask(__name__)

# Solace SEMP API configuration
SOLACE_HOST = os.getenv('SOLACE_HOST', 'http://solace:8080')
SOLACE_ADMIN_USER = os.getenv('SOLACE_ADMIN_USER')
SOLACE_ADMIN_PASS = os.getenv('SOLACE_ADMIN_PASS')
SOLACE_VPN = os.getenv('SOLACE_VPN', 'default')

# Database configuration
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "sensora"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "postgres"),
    "host": os.getenv("DB_HOST", "host.docker.internal"),
    "port": os.getenv("DB_PORT", "5432")
}

# Basic auth header for Solace SEMP API
SOLACE_AUTH = b64encode(f"{SOLACE_ADMIN_USER}:{SOLACE_ADMIN_PASS}".encode()).decode()

# Secret key for token verification (should be in env in production)
TOKEN_SECRET = os.getenv('TOKEN_SECRET', 'your-secret-key-min-32-bytes-long!!')

def load_config():
    """Load or create config file with authorized controllers"""
    config_path = Path("/config/auth_config.json")
    if not config_path.exists():
        config_path.parent.mkdir(exist_ok=True)
        with open(config_path, 'w') as f:
            json.dump({
                "authorized_controllers": {},
                "solace_credentials": {},
                "active_challenges": {}
            }, f, indent=2)
    
    with open(config_path) as f:
        return json.load(f)

def save_config(config):
    """Save config to file"""
    with open("/config/auth_config.json", 'w') as f:
        json.dump(config, f, indent=2)

def register_in_database(controller_id, username, model=None):
    """Register the controller in the database under the specified user"""
    try:
        print(f"🔍 [DB] Attempting to register controller {controller_id} for user {username}...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Log the database configuration for debugging
        print(f"🔍 [DB] Database configuration: {DB_CONFIG}")
        
        # Check if user exists
        cur.execute("SELECT username FROM sensora.users WHERE username = %s", (username,))
        user_exists = cur.fetchone()
        if not user_exists:
            print(f"❌ [DB] User {username} does not exist. Aborting registration.")
            return False
        
        # Insert or update controller
        cur.execute("""
            INSERT INTO sensora.controllers (did, model, secret, owner)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (did) DO UPDATE 
            SET model = EXCLUDED.model,
                owner = EXCLUDED.owner
            RETURNING did
        """, (
            controller_id, 
            model or "Unknown",
            secrets.token_urlsafe(32),  # Generate a random secret
            username
        ))
        controller_result = cur.fetchone()
        if controller_result:
            print(f"✅ [DB] Controller {controller_result[0]} registered successfully.")
        else:
            print(f"⚠️ [DB] Controller registration returned no result.")
        
        # Optionally create a default sensor for the controller
        if model:
            sensor_id = f"{controller_id[:8]}-temp"
            cur.execute("""
                INSERT INTO sensora.sensors (sid, ilk, unit, controller)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (sid) DO UPDATE 
                SET last_call = CURRENT_TIMESTAMP,
                    controller = EXCLUDED.controller
            """, (sensor_id, "temperature", "°C", controller_id))
            print(f"✅ [DB] Default sensor {sensor_id} created for controller {controller_id}.")
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ [DB] Controller {controller_id} successfully registered in database.")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ [DB] Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ [DB] Unexpected error: {e}")
        return False

def create_solace_user(controller_id, model=None):
    """Create a Solace user for a controller with permissions for all its sensors"""
    url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/clientUsernames"
    
    username = f"controller_{controller_id[:8]}"
    password = secrets.token_urlsafe(32)
    
    headers = {
        'Authorization': f'Basic {SOLACE_AUTH}',
        'Content-Type': 'application/json'
    }
    
    # Create user with basic permissions
    data = {
        "clientUsername": username,
        "password": password,
        "enabled": True
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            print(f"❌ [Solace] Failed to create user: {response.text}")
            return None
        
        # Add publish permission for send topic
        pub_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/clientUsernames/{username}/publishTopicExceptions"
        pub_data = {
            "publishTopicException": f"sensora/v1/send/{controller_id}",
            "topicSyntax": "smf"
        }
        requests.post(pub_url, headers=headers, json=pub_data)
        
        # Add subscribe permission for receive topic
        sub_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/clientUsernames/{username}/subscribeTopicExceptions"
        sub_data = {
            "subscribeTopicException": f"sensora/v1/receive/{controller_id}/targetValues",
            "topicSyntax": "smf"
        }
        requests.post(sub_url, headers=headers, json=sub_data)
        
        # Get broker URL from environment variables
        broker_url = os.getenv('SOLACE_PUBLIC_URL', 'solace')  # Default to 'solace' if not set
        broker_port = int(os.getenv('SOLACE_PUBLIC_PORT', 1883))
        use_ssl = os.getenv('SOLACE_USE_SSL', 'false').lower() == 'true'
        
        return {
            "username": username,
            "password": password,
            "publish_topic": f"sensora/v1/send/{controller_id}",
            "subscribe_topic": f"sensora/v1/receive/{controller_id}/targetValues",
            "did": controller_id,
            "model": model or "Unknown",
            "broker_url": broker_url,
            "broker_port": broker_port,
            "broker_ssl": use_ssl
        }
    except Exception as e:
        print(f"❌ [Solace] Error creating user: {e}")
        return None

def generate_challenge():
    """Generate a random challenge"""
    return secrets.token_hex(16)

def verify_challenge_response(token, challenge, response):
    """Verify the challenge response from the controller"""
    expected = hmac.new(
        token.encode(),
        challenge.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(response, expected)

@app.route('/api/controller/init', methods=['POST'])
def init_auth():
    """Initialize authentication process for a controller"""
    data = request.get_json()
    
    if 'token_hash' not in data:
        return jsonify({'error': 'No token hash provided'}), 400
    
    token_hash = data['token_hash']
    config = load_config()
    
    # Generate challenge
    challenge = generate_challenge()
    
    # Store challenge temporarily
    config['active_challenges'][token_hash] = {
        'challenge': challenge,
        'timestamp': str(datetime.datetime.utcnow())
    }
    save_config(config)
    
    return jsonify({
        'challenge': challenge
    }), 200

@app.route('/api/controller/verify', methods=['POST'])
def verify_auth():
    """Verify challenge response and provide encrypted credentials"""
    data = request.get_json()
    
    if not all(k in data for k in ['token_hash', 'challenge_response']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    config = load_config()
    token_hash = data['token_hash']
    
    # Check if challenge exists
    if token_hash not in config['active_challenges']:
        return jsonify({'error': 'No active challenge'}), 400
    
    challenge = config['active_challenges'][token_hash]['challenge']
    
    # Find original token from hash
    original_token = None
    controller_id = None
    for cid, info in config['authorized_controllers'].items():
        if info['token_hash'] == token_hash:
            original_token = info['token']
            controller_id = cid
            break
    
    if not original_token:
        print(f"❌ [Auth] Invalid token for hash: {token_hash}")
        return jsonify({'error': 'Invalid token'}), 403
    
    # Verify challenge response
    if not verify_challenge_response(original_token, challenge, data['challenge_response']):
        print(f"❌ [Auth] Invalid challenge response for controller {controller_id}")
        return jsonify({'error': 'Invalid challenge response'}), 403
    
    print(f"✅ [Auth] Challenge verified successfully for controller {controller_id}")
    
    # Clean up challenge
    del config['active_challenges'][token_hash]
    
    # Check if already registered
    if controller_id in config['solace_credentials']:
        print(f"ℹ️ [Auth] Controller {controller_id} already registered in Solace")
        credentials = config['solace_credentials'][controller_id]
    else:
        print(f"🔄 [Auth] Creating new Solace credentials for controller {controller_id}")
        # Create new Solace credentials
        credentials = create_solace_user(controller_id)
        if not credentials:
            print(f"❌ [Auth] Failed to create Solace credentials for controller {controller_id}")
            return jsonify({'error': 'Failed to create Solace credentials'}), 500
        
        config['solace_credentials'][controller_id] = credentials
        print(f"✅ [Auth] Solace credentials created for controller {controller_id}")
        
        # Register in database after successful challenge
        username = config['authorized_controllers'][controller_id]['username']
        model = config['authorized_controllers'][controller_id]['model']
        print(f"🔄 [Auth] Attempting to register controller {controller_id} in database for user {username}")
        if not register_in_database(controller_id, username, model):
            print(f"❌ [Auth] Failed to register controller {controller_id} in database")
        else:
            print(f"✅ [Auth] Successfully registered controller {controller_id} in database")
    
    save_config(config)
    
    # Generate session key for secure credential transfer
    session_key = Fernet.generate_key()
    f = Fernet(session_key)
    
    # Encrypt credentials
    encrypted_credentials = f.encrypt(json.dumps(credentials).encode())
    
    # Create credential key using token as key
    credential_key = hmac.new(
        original_token.encode(),
        session_key,
        hashlib.sha256
    ).hexdigest()
    
    return jsonify({
        'session_key': session_key.decode(),
        'credential_key': credential_key,
        'encrypted_credentials': encrypted_credentials.decode()
    }), 200

@app.route('/api/admin/controller', methods=['POST'])
def register_controller():
    """Register a new controller and generate its token"""
    data = request.get_json()
    admin_key = request.headers.get('X-Admin-Key')
    if admin_key != os.getenv('ADMIN_KEY', 'your-secure-admin-key'):
        return jsonify({'error': 'Unauthorized'}), 403
    
    controller_id = data.get('controller_id', str(uuid.uuid4()))
    model = data.get('model')  # Optional model information
    username = data.get('username')  # Required username
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    token = str(uuid.uuid4())
    token_hash = hmac.new(TOKEN_SECRET.encode(), token.encode(), hashlib.sha256).hexdigest()
    
    # Register in config file
    config = load_config()
    config['authorized_controllers'][controller_id] = {
        'token': token,
        'token_hash': token_hash,
        'model': model,
        'username': username,
        'description': data.get('description', ''),
        'created_at': str(datetime.datetime.utcnow())
    }
    save_config(config)
    
    # Register in database
    if not register_in_database(controller_id, username, model):
        print(f"Warning: Controller {controller_id} registered but database entry failed")
    
    return jsonify({
        'controller_id': controller_id,
        'token': token,
        'token_hash': token_hash,
        'model': model,
        'username': username,
        'message': 'Controller registered successfully'
    }), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)