from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
import asyncpg
import smtplib
from email.mime.text import MIMEText
import secrets
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/sensora")
SERVER_HOST = os.getenv("SERVER_HOST", "http://localhost:8000")
SMTP_USER = os.getenv("SMTP_USER", "SensoraMailVerify@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "lbvy fkey orwp solk")

# Lade den preshared key aus den Umgebungsvariablen
PSK = os.getenv("MAILSERVICE_PSK", "default-psk")

tokens = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.conn = await asyncpg.connect(DATABASE_URL)
        print("✅ DB verbunden.")
        yield
    finally:
        await app.state.conn.close()
        print("❌ DB getrennt.")

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Mailservice läuft!"}

# ✅ Hier das Pydantic-Model für JSON-Daten
class VerifyRequest(BaseModel):
    username: str
    mail: str
    key: str  # Neuer Key für die PSK-Überprüfung


@app.post("/verify")
async def send_verification(data: VerifyRequest, request: Request):
    # Überprüfe den preshared key
    if data.key != PSK:
        raise HTTPException(status_code=403, detail="Invalid preshared key.")

    username = data.username
    mail = data.mail

    conn = request.app.state.conn
    user = await conn.fetchrow(
        "SELECT * FROM sensora.users WHERE username = $1 AND mail = $2",
        username, mail
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    token = secrets.token_urlsafe(16)
    tokens[username] = token

    verification_link = f"{SERVER_HOST}/confirm/{username}/{token}"
    await send_email(mail, verification_link)

    return {"message": "Verification email sent."}


async def send_email(recipient: str, link: str):
    subject = "Bitte bestätige deine E-Mail"
    body = f"Klicke auf diesen Link zur Bestätigung:\n{link}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, recipient, msg.as_string())


@app.get("/confirm/{username}/{token}", response_class=HTMLResponse)
async def confirm_email(username: str, token: str, request: Request):
    stored_token = tokens.get(username)
    if stored_token != token:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    conn = request.app.state.conn
    await conn.execute(
        "UPDATE sensora.users SET active = TRUE WHERE username = $1",
        username
    )
    tokens.pop(username, None)
    return "<h1>Email erfolgreich bestätigt!</h1>"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
