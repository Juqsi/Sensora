FROM python:3.12-slim

WORKDIR /app

# Copy application files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Ensure the init script is executable
RUN chmod +x /app/init.py

CMD ["python", "init.py"]
