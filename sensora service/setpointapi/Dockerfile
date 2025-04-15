FROM python:3.12-slim

WORKDIR /app

# Copy application files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "setpoint_rest_api.py"]
