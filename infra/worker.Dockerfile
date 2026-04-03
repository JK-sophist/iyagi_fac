FROM python:3.12-slim

WORKDIR /app
COPY apps/worker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/worker /app
CMD ["python", "-m", "worker.main"]
