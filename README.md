# KanMind

Kanban board with a Django REST API ([backend/](backend/)) and a Next.js frontend ([frontend/](frontend/)).

For local development without Docker, follow [backend/README.md](backend/README.md) and `npm run dev` in `frontend/`. Everything below describes the Docker Compose stack that runs both on a server.

## Docker Compose stack

Three containers:

| Service | Image | Role |
| --- | --- | --- |
| `caddy` | `caddy:2-alpine` | The only published port. Serves `/` from the frontend, `/api` and `/admin` from Django, `/static` from the collected static files. |
| `web` | built from `frontend/` | Next.js in standalone mode on port 3000, internal only. |
| `api` | built from `backend/` | gunicorn on port 8000, internal only. |

Because the proxy puts both on the same origin, the frontend is built with `NEXT_PUBLIC_API_BASE_URL=/api` and the image works under any host name or domain without a rebuild.

### Start

`DJANGO_SECRET_KEY` is required — Compose refuses to start without it. Generate one:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Put it into `.env` next to `compose.yaml` (or export it in the shell):

```bash
DJANGO_SECRET_KEY=<the generated value>
```

Then:

```bash
docker compose up -d --build
```

The app is served on port 80. `migrate` and `collectstatic` run automatically on every start of the `api` container.

### Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | — | Required. Django signing key. |
| `SITE_ADDRESS` | `:80` | Plain HTTP on any host. Set to a domain (`demo.example.com`) and Caddy requests a Let's Encrypt certificate automatically. |
| `HTTP_PORT` | `80` | Host port mapped to the proxy. |
| `DJANGO_ALLOWED_HOSTS` | `*` | Comma separated host names. Narrow this once the domain is fixed. |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | empty | Needed for the admin login over HTTPS, e.g. `https://demo.example.com`. |

`DEBUG` is forced to `0` in the stack. Without the environment variables the settings keep their development defaults, so the local workflow in `backend/README.md` is unaffected.

### Demo data

```bash
docker compose run --rm api python manage.py seed_demo
```

Creates the demo users and prints their credentials. Safe to run more than once.

### Admin user

```bash
docker compose run --rm api python manage.py createsuperuser
```

### Data

The SQLite database lives on the `db-data` volume, so `docker compose up --build` keeps existing data. `docker compose down -v` deletes it.

### Going public

Two things are still open for a deployment reachable from the internet:

- `CORS_ALLOW_ALL_ORIGINS = True` in `backend/core/settings.py`. The proxy makes the API same-origin, so this can be replaced by an explicit `CORS_ALLOWED_ORIGINS` list.
- The `api` container runs as root because the SQLite volume is root-owned.
