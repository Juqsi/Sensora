import os
import psycopg2
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "sensora"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASS", "postgres"),
    "host": "localhost",
    "port": os.getenv("DB_PORT", "5432")
}

def test_db_connection():
    """Test database connection and insert a test controller"""
    try:
        print("🔍 Testing database connection...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("✅ Successfully connected to database!")
        
        # Test query
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"📝 PostgreSQL version: {version[0]}")
        
        # Test controller registration
        test_controller_id = "test_controller_123"
        test_username = "user1"
        test_model = "Test-Model"
        
        print(f"\n🔄 Attempting to register controller {test_controller_id}...")
        
        # Check if user exists
        cur.execute("SELECT username FROM sensora.users WHERE username = %s", (test_username,))
        if not cur.fetchone():
            print(f"❌ User {test_username} does not exist")
            return
        
        # Insert controller
        cur.execute("""
            INSERT INTO sensora.controllers (did, model, secret, owner)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (did) DO UPDATE 
            SET model = EXCLUDED.model,
                secret = EXCLUDED.secret,
                owner = EXCLUDED.owner
            RETURNING did
        """, (
            test_controller_id,
            test_model,
            secrets.token_urlsafe(32),
            test_username
        ))
        
        result = cur.fetchone()
        if result:
            print(f"✅ Successfully registered controller {result[0]}")
        else:
            print("❌ Failed to register controller")
        
        # Verify the insert
        cur.execute("SELECT * FROM sensora.controllers WHERE did = %s", (test_controller_id,))
        controller = cur.fetchone()
        if controller:
            print("\n📊 Controller details:")
            print(f"ID: {controller[0]}")
            print(f"Secret: {controller[1]}")
            print(f"Model: {controller[2]}")
            print(f"Owner: {controller[3]}")
        else:
            print("❌ Controller not found in database")
        
        conn.commit()
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_db_connection() 