# Backend Dockerfile
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (ffmpeg placeholder, adjust as needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (leverage layer cache)
COPY Backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend source
COPY Backend/ .

# Create runtime directories (ensure exist before switching user)
RUN mkdir -p /app/output /app/assets /app/jobs && \
    adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["python","-m","uvicorn","main:app","--host","0.0.0.0","--port","8000"]
