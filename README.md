# Double Materiality 2026 — The Corporate

A single static page that plots The Corporate's 16 material ESG topics on an interactive double materiality matrix (Financial Materiality × Impact Materiality, 1–5), with E/S/G toggles and per-topic tooltips.

Full requirements: [docs/product-spec.md](docs/product-spec.md). Source documents: [docs/reference/](docs/reference/).

## Files

| File | Purpose |
|------|---------|
| `index.html` | The page |
| `styles.css` | Brand styling (black / off-white / beige / taupe, Georgia + Arial) |
| `data.js` | The 16 hardcoded topic scores and the zone classification rules |
| `selfcheck.js` | Data self-check (runs in the browser console on load, and in Node) |
| `app.js` | Hand-written SVG chart, collision nudging, filters, tooltips |
| `tests/selfcheck.test.js` | Node runner for the self-check |

No build step, no dependencies, no credentials.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
```

Run the data self-check:

```bash
node tests/selfcheck.test.js
```

## Updating scores

Edit the `TOPICS` array in `data.js`. If a topic's zone changes, update `EXPECTED_ZONES` in `selfcheck.js` too, then rerun the self-check.

## Deploying to Vercel

1. Push this repo to GitHub (`main`).
2. In the Vercel dashboard: **Add New → Project → Import Git Repository** and pick this repo.
3. Framework preset: **Other**. Build command: **none** (leave empty). **Output directory: the repo root** (`.` — `index.html` sits at the top level).
4. Deploy. No environment variables are needed. Every later push to `main` redeploys automatically.
