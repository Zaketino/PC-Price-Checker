# PC Price Watcher


A lightweight price-watcher for PC parts that:
- checks multiple official price sources (PriceAPI / Geizhals, Keepa for Amazon, SerpApi for Google Shopping)
- stores price history in Supabase
- sends email alerts via MailerSend
- runs scheduled checks via GitHub Actions (no paid server required)


This repo is optimized for **free deployment**: use Supabase free tier, MailerSend free tier, and GitHub Actions scheduled runs. Optionally deploy the optional frontend to Vercel/Netlify/GitHub Pages.


## Files in this repo
- `package.json` — project metadata
- `src/` — app code
- `run-scrape.js` — main orchestrator (used by GitHub Actions)
- `server.js` — optional Express server for local testing or Vercel deployment
- `db.js`, `email.js`, `config.js` — infra helpers
- `scrapers/` — connectors to PriceAPI, Keepa, SerpApi, plus HTML fallback
- `.github/workflows/schedule.yml` — scheduled run (every 6 hours)
- `supabase/migrations.sql` — Supabase table schema


## High-level architecture
1. GitHub Actions cron runs `node src/run-scrape.js` on a schedule.
2. The script queries official APIs (PriceAPI, Keepa, SerpApi) for each watched item.
3. Prices are saved to Supabase.
4. If an alert rule fires (percent or absolute drop), MailerSend sends an email.
5. Optional small frontend reads price history from Supabase for visualization.


## Quick Start
1. Create accounts and keys:
    - Supabase project (free tier): copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into GitHub Secrets.
    - MailerSend: create API key `MAILERSEND_API_KEY`.
    - PriceAPI (or another partner that supports Geizhals/Idealo): `PRICEAPI_KEY`.
    - Keepa API key for Amazon: `KEEPA_API_KEY` (optional but recommended for Amazon tracking).
    - SerpApi key for Google Shopping results: `SERPAPI_KEY` (optional).
2. Create a GitHub repo and push files.
3. Add GitHub Secrets (see `.github/workflows/schedule.yml` for names). Add your `WATCHER_ITEMS` JSON or configure items using Supabase directly.
4. From Supabase SQL editor, run `supabase/migrations.sql` to create tables.
5. Manually run `node src/run-scrape.js` locally for testing (requires `.env` or process env vars).
6. Enable GitHub Actions. The scheduled job will run and populate the database.


## Security & legal
- Use official APIs where possible. Scraping vendor pages without permission may violate terms of service. The repository includes a limited HTML fallback for small shareable vendor pages but **you are responsible** for following TOS.
