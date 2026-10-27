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

## Catalog API

All endpoints are public `GET` requests under `/api`.

| Endpoint | Description |
|---|---|
| `/home` | Banners, featured categories, featured products, new arrivals, on sale |
| `/categories` | Active categories as a nested tree |
| `/categories/{slug}` | One category with its subcategories and parent (breadcrumbs) |
| `/brands` | Active brands |
| `/products` | Product listing (see filters below) |
| `/products/filters` | Brands, sizes, colors and price range for the shop sidebar; accepts `filter[category]` |
| `/products/{slug}` | Product detail with images, options and variants |
| `/products/{slug}/related` | Up to 8 products from the same categories |

`/products` query parameters:

- **Filters:** `filter[category]=men`, `filter[brand]=stride,kite-studio`, `filter[min_price]=500`, `filter[max_price]=2000`, `filter[size]=M,L`, `filter[color]=Black`, `filter[search]=linen`, `filter[featured]=1`, `filter[on_sale]=1`, `filter[in_stock]=1`
- **Sort:** `sort=newest` (default, newest first with `-newest`), `sort=price`, `sort=-price`, `sort=name`
- **Pagination:** `page=2`, `per_page=12` (max 48)

A category filter includes its subcategories, and price filters use the sale price when one is set.

## Demo data

`php artisan migrate:fresh --seed` creates 14 categories, 6 brands, 33 products with size and color variants, and 2 home banners. Images are generated gradient placeholders (no downloads), and seeding takes about 30 seconds while thumbnails are generated.

## Useful commands

| Task | Command |
|---|---|
| Backend tests | `cd backend && vendor/bin/pest` |
| Backend code style | `cd backend && vendor/bin/pint` |
| Backend static analysis | `cd backend && vendor/bin/phpstan analyse` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend build | `cd frontend && npm run build` |

## Notes

- **Auth:** Sanctum SPA cookies. The frontend calls `/sanctum/csrf-cookie` before any POST, PUT, PATCH or DELETE (see `frontend/src/lib/api.ts`). `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` in `backend/.env` must match the frontend's domain. Locally, open both apps on `localhost` (not `127.0.0.1`) so they share cookies. In production, set `SESSION_DOMAIN` to the shared parent domain (e.g. `.example.com`).
- **Images:** Stored on Laravel's `public` disk and served from `/storage/...`. Next.js `remotePatterns` allows that path.
- **Admin access:** Only users with `is_admin = true` can open `/admin`.
