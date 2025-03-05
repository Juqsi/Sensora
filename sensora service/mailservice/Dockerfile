# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Restlichen Code kopieren
COPY . .

# Exponiere den Port (wichtig für Compose)
EXPOSE 8000

# Startbefehl
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
