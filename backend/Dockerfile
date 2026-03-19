FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/app/.cache/transformers \
    PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies and Chromium
RUN apt-get update && apt-get install -y \
    wget curl unzip gnupg ca-certificates \
    fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    chromium chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for compatibility
RUN ln -s /usr/bin/chromium /usr/bin/google-chrome && \
    ln -s /usr/bin/chromedriver /usr/local/bin/chromedriver

# Copy requirements first for better caching
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . /app

# Pre-download the model to cache it in the image
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')" && \
    rm -rf /app/.cache

# Verify directory structure and imports
RUN python -c "import app.schemas.scholarship; print('✅ Modules found successfully!')"

# Test scraper functionality (optional - comment out if you don't want to test during build)
# RUN python test_scraper.py

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Run the application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4"]
