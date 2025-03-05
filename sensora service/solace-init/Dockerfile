# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis
WORKDIR /app

# Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Restliche Dateien kopieren (init.py, queues.json, etc.)
COPY . .

# Startbefehl
CMD ["python", "init.py"]
