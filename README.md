# SignageSyncWatch

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

Synchronization monitoring app for multi-screen digital signage. Upload screenshots from several displays, compare visual drift, and save sync reports.

## What It Does

SignageSyncWatch helps QA teams, AV integrators, and operators check whether screens in a group are showing the same content at the same moment. It stores screen groups, uploaded screenshots, comparisons, and reports with durable file-backed storage.

## Features

- Create screen groups for video walls or multi-display deployments.
- Upload screenshots from each screen.
- Compare visual differences with pixel-level image analysis.
- Detect outliers and sync drift.
- Save reports for later review.
- Generate AI-assisted sync analysis when a provider key is configured.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Browser **Canvas** + `pixelmatch` for image comparison (client-side)
- Anthropic SDK and OpenAI SDK (called with the visitor's own key)
- Cloudflare KV storage through a repository interface

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No `.env` is required — see Configuration below.

## Configuration

**Image comparison runs in the browser.** Screenshots are decoded, resized, and
diffed with the Canvas API + `pixelmatch` on the client (no server-side native
image library), so the app runs on the edge/Workers runtime.

**AI is bring-your-own-key.** There is no server-side API key. Each visitor adds
their own Anthropic or OpenAI key in the app's Settings; it is stored only in
their browser and sent per request (`x-api-key` header). Without a key the sync
summary falls back to a computed message.

**Storage:** groups, screens, and reports persist in **Cloudflare KV** (binding
`SIGNAGE_KV`). Local development also ships `file` and `memory` drivers via
`SIGNAGE_STORAGE_DRIVER`.

## Deployment

Deployed on **Cloudflare Pages** as a static export + Pages Functions:

- Build command `npx next build`, output directory `out`.
- Compatibility flag `nodejs_compat`.
- Bind a KV namespace as `SIGNAGE_KV`.
- Live at `signagesyncwatch.sudarshantechlabs.com`.

## Production Checks

```bash
pnpm typecheck
pnpm build
```

## Release Notes

- Do not commit `.env`, `.env.local`, uploaded screenshots, reports, or generated `.signage-data` files.
- Keep AI provider keys in the deployment environment.
- Verify the persistent storage volume before public release.

## Author

Built by [Sudarshan Chaudhari](https://github.com/SUDARSHANCHAUDHARI) for **SudarshanTechLabs**.

## License

MIT
