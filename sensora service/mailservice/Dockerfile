# Basis-Image
FROM python:3.12-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Restlichen Code kopieren
COPY . /app

# Startbefehl
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
