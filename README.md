# m-commerce

Modern e-commerce store: a **Laravel** API and admin panel with a **Next.js** storefront. Payment is Cash on Delivery only.

| Folder | Stack | Dev URL |
|---|---|---|
| [`backend/`](backend) | Laravel 13, Sanctum (SPA auth), Filament 5 admin, Pest | http://localhost:8000 |
| [`frontend/`](frontend) | Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand | http://localhost:3000 |

## Requirements

- PHP 8.4+ and Composer
- Node.js 24+ and npm
- SQLite for local development (MySQL in production)

## Getting started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

- Admin panel: http://localhost:8000/admin
- Seeded local accounts (password `password`): `admin@example.com` (admin) and `customer@example.com`
- Health check: http://localhost:8000/api/health

To use MySQL, set `DB_CONNECTION=mysql` and the `DB_*` values in `backend/.env`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The home page shows **API connected** when the backend is running.

## Useful commands

| Task | Command |
|---|---|
| Backend tests | `cd backend && vendor/bin/pest` |
| Backend code style | `cd backend && vendor/bin/pint` |
| Backend static analysis | `cd backend && vendor/bin/phpstan analyse` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend build | `cd frontend && npm run build` |

## Notes

- **Auth:** Sanctum SPA cookies. The frontend calls `/sanctum/csrf-cookie` before any POST, PUT, PATCH or DELETE (see `frontend/src/lib/api.ts`). `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` in `backend/.env` must match the frontend's domain.
- **Images:** Stored on Laravel's `public` disk and served from `/storage/...`. Next.js `remotePatterns` allows that path.
- **Admin access:** Only users with `is_admin = true` can open `/admin`.
