#!/bin/bash
set -e

echo "==================== Django Startup ===================="

# Wait for database to be ready (optional, healthcheck으로 이미 처리됨)
# echo "Waiting for database..."
# python -c "import time; time.sleep(2)"

# Migration 실행 (기존 마이그레이션 파일 적용)
echo "Running database migrations..."
python manage.py migrate --noinput
echo "✅ Migrations completed!"

# Static 파일 수집
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || true
echo "✅ Static files collected!"

echo "Starting Django server..."
echo "========================================================"

# 원래 CMD 실행 (Dockerfile의 CMD 또는 docker-compose의 command)
exec "$@"
