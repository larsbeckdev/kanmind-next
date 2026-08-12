# KanMind Frontend (Next.js)

The frontend for the KanMind API, built with Next.js App Router, shadcn/ui
(Base UI, `base-mira` style) and Tailwind v4. It replaces the plain HTML client
this project started with and speaks the same REST API without any backend
change.

## Requirements

- Node 24 (managed with fnm)
- The KanMind Django backend running and reachable

## Getting started

```powershell
npm install
npm run dev
```

The app expects the API at `http://127.0.0.1:8000/api`. To point it somewhere
else, create `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://10.0.0.5:8000/api
```

Optional: when both variables below are set, the login screen shows a
"Continue as guest" button. Leave them out and no demo credentials exist in the
build.

```dotenv
NEXT_PUBLIC_GUEST_EMAIL=demo@kanmind.de
NEXT_PUBLIC_GUEST_PASSWORD=demo12345
```

The matching example data is created on the backend with:

```powershell
python manage.py reset_demo
```

That command deletes every account first, so it also removes the boards, tasks
and comments that hang off them. It then creates:

| Account | Password | Role |
| --- | --- | --- |
| `admin@kanmind.de` | `admin12345` | Django admin (staff + superuser) |
| `demo@kanmind.de` | `demo12345` | Owner of both example boards |
| `anna@kanmind.de` | `demo12345` | Member |
| `ben@kanmind.de` | `demo12345` | Member |
| `clara@kanmind.de` | `demo12345` | Member |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint incl. the React Compiler rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

## Routes

| Route | Content |
| --- | --- |
| `/login`, `/register` | Authentication, redirects to the dashboard when a session exists |
| `/dashboard` | Counters, status donut, workload per board, task tables |
| `/boards` | All boards with their counters, search and creation |
| `/boards/[boardId]` | Kanban board with drag and drop, task dialog and comments |
| `/imprint`, `/privacy` | Legal pages, reachable without a session |

## API coverage

Every endpoint of the KanMind API documentation is used:

| Endpoint | Where |
| --- | --- |
| `POST /api/registration/` | Registration form |
| `POST /api/login/` | Login form |
| `GET /api/email-check/` | Member picker in the board dialog |
| `GET /api/boards/` | Board overview and dashboard |
| `POST /api/boards/` | Create board dialog |
| `GET /api/boards/{id}/` | Board detail |
| `PATCH /api/boards/{id}/` | Board settings (title and members) |
| `DELETE /api/boards/{id}/` | Delete board (owner only) |
| `GET /api/tasks/assigned-to-me/` | Dashboard |
| `GET /api/tasks/reviewing/` | Dashboard |
| `POST /api/tasks/` | New task dialog |
| `PATCH /api/tasks/{id}/` | Task dialog and drag and drop between columns |
| `DELETE /api/tasks/{id}/` | Task detail dialog |
| `GET /api/tasks/{id}/comments/` | Comment thread |
| `POST /api/tasks/{id}/comments/` | Comment form |
| `DELETE /api/tasks/{id}/comments/{commentId}/` | Own comments |

## Structure

```text
app/
  (auth)/       login and registration, split layout with the brand panel
  (app)/        signed-in shell with header, nav and footer
  (legal)/      imprint and privacy
components/
  auth/ board/ boards/ dashboard/ layout/ forms/ brand/
  ui/           shadcn components
hooks/          TanStack Query hooks per resource
lib/
  api/          one module per API resource, zod schemas for every response
  auth/         session storage and the useSession hook
```

## Notes

- The API authenticates with a DRF token that the browser has to send on every
  request, so the token is kept in `localStorage`. In an app that controls its
  own backend, an httpOnly cookie would be the better place.
- Responses are validated with zod. A contract change on the Django side shows
  up as an explicit error instead of a crash somewhere in a component.
- Colours, the Mulish font and the logo are taken from the original KanMind
  frontend. The theme is dark only, which is what the brand is.
