# KanMind

Kanban board with a Django REST API ([backend/](backend/)) and a Next.js frontend ([frontend/](frontend/)).

For local development without Docker, follow [backend/README.md](backend/README.md) and `npm run dev` in `frontend/`. Everything below describes the Docker Compose stack that runs both on a server.

## Docker Compose stack

Two containers, one port each:

| Service | Port | Role |
| --- | --- | --- |
| `web` | `3071` | Next.js in standalone mode. |
| `api` | `3070` | Django behind gunicorn, serving `/api/`, `/admin/` and its own static files. |

The browser talks to both directly, so the API port has to be reachable from wherever the app is opened. Which port that is gets compiled into the frontend bundle at build time — the host name does not: the client derives it from the address the page was loaded from. The same image therefore runs on `localhost`, on a LAN address and on the demo server without a rebuild.

### Start

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(50))"   # -> DJANGO_SECRET_KEY
docker compose up -d --build
```

Compose refuses to start without `DJANGO_SECRET_KEY`. The frontend is then on `http://<host>:3071`, the API on `http://<host>:3070/api/`.

`migrate` and `collectstatic` run automatically on every start of the `api` container.

### Configuration

All of it lives in `.env`, see [.env.example](.env.example) for the full list with defaults. The ones that matter:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | — | Required. |
| `API_PORT` | `3070` | Host port of the API. Also compiled into the frontend bundle, so changing it requires `docker compose up --build`, not just a restart. |
| `WEB_PORT` | `3071` | Host port of the frontend. |
| `DJANGO_ALLOWED_HOSTS` | `*` | Comma separated. Narrow this once the host name is fixed. |
| `DJANGO_CORS_ALLOWED_ORIGINS` | empty | Comma separated origins the frontend runs on, scheme and host only. Empty allows every origin. |
| `NEXT_PUBLIC_API_BASE_URL` | empty | Only for setups where the API is not on `<same host>:<API_PORT>`, e.g. behind a domain: `https://api.example.com/api`. |

`DJANGO_DEBUG` defaults to `0` in the stack. Without any environment variables the settings keep their development defaults, so the local workflow in `backend/README.md` is unaffected.

### Data

The SQLite database is bind mounted to `./data/db.sqlite3`, so it survives rebuilds and can be copied or backed up like any file. `./data` is git ignored.

### Demo data

```bash
docker compose run --rm api python manage.py seed_demo
```

Creates the demo users and prints their credentials. Safe to run more than once.

### Admin user

```bash
docker compose run --rm api python manage.py createsuperuser
```

The admin is served by the API container at `http://<host>:3070/admin/`.

### Behind a TLS proxy

If something in front terminates HTTPS, set in `.env`:

```bash
DJANGO_TRUST_PROXY_SSL_HEADER=1
DJANGO_CSRF_TRUSTED_ORIGINS=https://demo.example.com
NEXT_PUBLIC_API_BASE_URL=https://demo.example.com/api
```

Without the first two the admin login rejects its own POST as a CSRF failure.

The frontend calls the API cross-origin, so CORS is required in any case. Without `DJANGO_CORS_ALLOWED_ORIGINS` every origin is accepted, which is fine in the local network and too wide for a public deployment:

```bash
DJANGO_CORS_ALLOWED_ORIGINS=https://demo.example.com
```
