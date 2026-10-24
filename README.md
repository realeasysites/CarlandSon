# Carl's & Son Flooring — Website

Veteran-owned commercial & residential flooring, Naples ME / all of New England.
Node 20 + Express + SQLite. Quote form saves leads to a password-protected dashboard at `/admin`.

## Run locally
    npm install
    ADMIN_PASSWORD=choose-one SESSION_SECRET=long-random-string npm start
    open http://localhost:3000

## Deploy (Render)
- New Web Service → build `npm install`, start `npm start`, Node 20.
- Env vars: `ADMIN_PASSWORD` (required for /admin), `SESSION_SECRET`, `NOTIFY_EMAIL`, `SMTP_*` (optional email alerts).
- Add a persistent disk mounted at `/opt/render/project/src/db` (or set `DB_PATH`) so leads survive redeploys.

## Photos
- `public/images/hero.jpg` — top-of-page background (best finished floor, landscape).
- `public/images/about.jpg` — Carlos / crew on the job.
- `public/images/gallery/` — drop any project photos; they show in "Recent Work" automatically (sorted by filename).
