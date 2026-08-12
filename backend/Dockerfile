FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# ponytail: runs as root. The SQLite volume is root-owned, so a non-root
# user would need a chown step in an entrypoint. Add both together if the
# demo ever holds data worth protecting.
CMD ["gunicorn", "core.wsgi:application", \
     "--bind", "0.0.0.0:8000", "--workers", "3"]
