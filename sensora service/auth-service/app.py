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
from flasgger import Swagger
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
swagger = Swagger(app)  # Initialisiere Flasgger für Swagger-Dokumentation

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
    "host": os.getenv("DB_HOST", "172.17.0.1"),  # Updated to use Docker's default gateway
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
        logger.debug(f"🔍 [DB] Attempting to register controller {controller_id} for user {username}...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Log the database configuration for debugging
        logger.debug(f"🔍 [DB] Database configuration: {DB_CONFIG}")
        
        # Check if user exists
        cur.execute("SELECT username FROM sensora.users WHERE username = %s", (username,))
        user_exists = cur.fetchone()
        if not user_exists:
            logger.error(f"❌ [DB] User {username} does not exist. Aborting registration.")
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
            logger.info(f"✅ [DB] Controller {controller_result[0]} registered successfully.")
        else:
            logger.warning(f"⚠️ [DB] Controller registration returned no result.")
        
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
            logger.info(f"✅ [DB] Default sensor {sensor_id} created for controller {controller_id}.")
        
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"✅ [DB] Controller {controller_id} successfully registered in database.")
        return True
        
    except psycopg2.Error as e:
        logger.error(f"❌ [DB] Database error: {e}")
        return False
    except Exception as e:
        logger.exception(f"❌ [DB] Unexpected error: {e}")
        return False

def create_solace_user(controller_id, model=None):
    """Create a Solace user for a controller with permissions for all its sensors"""
    acl_profile_name = f"acl_{controller_id[:8]}"
    username = f"controller_{controller_id[:8]}"
    password = secrets.token_urlsafe(32)

    headers = {
        'Authorization': f'Basic {SOLACE_AUTH}',
        'Content-Type': 'application/json'
    }

    try:
        # Create ACL Profile
        acl_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/aclProfiles"
        acl_data = {
            "aclProfileName": acl_profile_name,
            "clientConnectDefaultAction": "allow",
            "publishTopicDefaultAction": "disallow",
            "subscribeTopicDefaultAction": "disallow"
        }
        logger.debug(f"🔄 Creating ACL Profile: {acl_data}")
        acl_response = requests.post(acl_url, headers=headers, json=acl_data)
        if acl_response.status_code != 200:
            logger.error(f"❌ [Solace] Failed to create ACL Profile: {acl_response.text}")
            return None
        logger.info(f"✅ [Solace] ACL Profile {acl_profile_name} created successfully.")
        # Add publish permission
        pub_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/aclProfiles/{acl_profile_name}/publishTopicExceptions"
        pub_data = {
            "publishTopicException": f"sensora/v1/send/{controller_id}",
            "publishTopicExceptionSyntax": "mqtt"
        }
        logger.debug(f"🔄 Adding publish permission: {pub_data}")
        pub_response = requests.post(pub_url, headers=headers, json=pub_data)
        if pub_response.status_code != 200:
            logger.error(f"❌ [Solace] Failed to add publish permission: {pub_response.text}")
        else:
            logger.info(f"✅ [Solace] Publish permission added: {pub_data}")

        # Add subscribe permission
        sub_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/aclProfiles/{acl_profile_name}/subscribeTopicExceptions"
        sub_data = {
            "subscribeTopicException": f"sensora/v1/receive/{controller_id}/targetValues",
            "subscribeTopicExceptionSyntax": "mqtt"
        }
        logger.debug(f"🔄 Adding subscribe permission: {sub_data}")
        sub_response = requests.post(sub_url, headers=headers, json=sub_data)
        if sub_response.status_code != 200:
            logger.error(f"❌ [Solace] Failed to add subscribe permission: {sub_response.text}")
        else:
            logger.info(f"✅ [Solace] Subscribe permission added: {sub_data}")

        # Create user and assign ACL Profile
        user_url = f"{SOLACE_HOST}/SEMP/v2/config/msgVpns/{SOLACE_VPN}/clientUsernames"
        user_data = {
            "clientUsername": username,
            "password": password,
            "enabled": True,
            "aclProfileName": acl_profile_name
        }
        logger.debug(f"🔄 Creating Solace user: {user_data}")
        user_response = requests.post(user_url, headers=headers, json=user_data)
        if user_response.status_code != 200:
            logger.error(f"❌ [Solace] Failed to create user: {user_response.text}")
            return None
        logger.info(f"✅ [Solace] User {username} created successfully.")

        # Get broker URL from environment variables
        broker_url = os.getenv('SOLACE_PUBLIC_URL', 'maxtar.de')  # Default to 'solace' if not set
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
        logger.exception(f"❌ [Solace] Error creating user: {e}")
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
    """
    Initialisiere den Authentifizierungsprozess für einen Controller
    ---
    tags:
      - Auth-Service
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            token_hash:
              type: string
              example: "hashed-token"
    responses:
      200:
        description: Challenge erfolgreich generiert
      400:
        description: Fehlerhafte Anfrage
    """
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
    """
    Verifiziere die Challenge-Response und stelle verschlüsselte Credentials bereit
    ---
    tags:
      - Auth-Service
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            token_hash:
              type: string
              example: "hashed-token"
            challenge_response:
              type: string
              example: "calculated-response"
            username:
              type: string
              example: "example_user"
    responses:
      200:
        description: Verifizierung erfolgreich, verschlüsselte Credentials bereitgestellt
      400:
        description: Fehlerhafte Anfrage
      403:
        description: Ungültige Challenge-Response oder Token
    """
    data = request.get_json()
    
    # Überprüfe, ob alle erforderlichen Felder vorhanden sind
    if not all(k in data for k in ['token_hash', 'challenge_response', 'username']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    config = load_config()
    token_hash = data['token_hash']
    username = data['username']  # Username wird jetzt mitgeschickt
    
    # Überprüfe, ob die Challenge existiert
    if token_hash not in config['active_challenges']:
        return jsonify({'error': 'No active challenge'}), 400
    
    challenge = config['active_challenges'][token_hash]['challenge']
    
    # Finde das ursprüngliche Token basierend auf dem Hash
    original_token = None
    controller_id = None
    for cid, info in config['authorized_controllers'].items():
        if info['token_hash'] == token_hash:
            original_token = info['token']
            controller_id = cid
            break
    
    if not original_token:
        logger.error(f"❌ [Auth] Invalid token for hash: {token_hash}")
        return jsonify({'error': 'Invalid token'}), 403
    
    # Überprüfe die Challenge-Response
    if not verify_challenge_response(original_token, challenge, data['challenge_response']):
        logger.error(f"❌ [Auth] Invalid challenge response for controller {controller_id}")
        return jsonify({'error': 'Invalid challenge response'}), 403
    
    logger.info(f"✅ [Auth] Challenge verified successfully for controller {controller_id}")
    
    # Bereinige die Challenge
    del config['active_challenges'][token_hash]
    
    # Überprüfe, ob der Controller bereits registriert ist
    if controller_id in config['solace_credentials']:
        logger.info(f"ℹ️ [Auth] Controller {controller_id} already registered in Solace")
        credentials = config['solace_credentials'][controller_id]
    else:
        logger.debug(f"🔄 [Auth] Creating new Solace credentials for controller {controller_id}")
        # Erstelle neue Solace-Credentials
        credentials = create_solace_user(controller_id)
        if not credentials:
            logger.error(f"❌ [Auth] Failed to create Solace credentials for controller {controller_id}")
            return jsonify({'error': 'Failed to create Solace credentials'}), 500
        
        config['solace_credentials'][controller_id] = credentials
        logger.info(f"✅ [Auth] Solace credentials created for controller {controller_id}")
        
        # Registriere den Controller in der Datenbank
        logger.debug(f"🔄 [Auth] Attempting to register controller {controller_id} in database for user {username}")
        if not register_in_database(controller_id, username, credentials.get('model')):
            logger.error(f"❌ [Auth] Failed to register controller {controller_id} in database")
        else:
            logger.info(f"✅ [Auth] Successfully registered controller {controller_id} in database")
    
    save_config(config)
    
    # Generiere einen Session-Key für die sichere Übertragung der Credentials
    session_key = Fernet.generate_key()
    f = Fernet(session_key)
    
    # Verschlüssele die Credentials
    encrypted_credentials = f.encrypt(json.dumps(credentials).encode())
    
    # Erstelle einen Credential-Key basierend auf dem Token
    credential_key = hmac.new(
        original_token.encode(),
        session_key,
        hashlib.sha256
    ).hexdigest()
    logger.info(f"Debug: session_key: {session_key.decode()} encrypted_credentials: {encrypted_credentials.decode()} credential_key: {credential_key}")
    return jsonify({
        'session_key': session_key.decode(),
        'credential_key': credential_key,
        'encrypted_credentials': encrypted_credentials.decode()
    }), 200

@app.route('/api/admin/controller', methods=['POST'])
def register_controller():
    """
    Registriere einen neuen Controller
    ---
    tags:
      - Auth-Service
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            controller_id:
              type: string
              example: "controller123"
            model:
              type: string
              example: "Test-Model"
            username:
              type: string
              example: "admin_user"
            description:
              type: string
              example: "Test controller for authentication"
    responses:
      201:
        description: Controller erfolgreich registriert
      400:
        description: Fehlerhafte Anfrage
      403:
        description: Unbefugter Zugriff
    """
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
        logger.warning(f"Warning: Controller {controller_id} registered but database entry failed")
    
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