# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Restlichen Code kopieren
COPY . .

# Kein EXPOSE nötig, da dieser Service passiv lauscht (optional für Doku)
EXPOSE 55555

# Startbefehl
CMD ["python", "writer.py"]
