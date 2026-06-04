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
- `sharp`, `pngjs`, and `pixelmatch` for image processing
- Anthropic SDK and OpenAI SDK
- File-backed JSON storage through a repository interface

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SIGNAGE_DATA_DIR=.signage-data
SIGNAGE_STORAGE_DRIVER=file
```

## Production Storage

Production uses file-backed JSON under `SIGNAGE_DATA_DIR`.

- Mount `SIGNAGE_DATA_DIR` as persistent writable storage.
- Keep `SIGNAGE_STORAGE_DRIVER=file` in production.
- Use `SIGNAGE_STORAGE_DRIVER=memory` only for disposable demos.

### Hosting Notes

File-backed storage is suitable for a VPS, Docker host, or platform with a persistent disk. For example:

```env
SIGNAGE_STORAGE_DRIVER=file
SIGNAGE_DATA_DIR=/data/signage-sync-watch
```

If you deploy on Vercel or another serverless host, do not rely on local file writes for saved groups, screenshots, or reports. Serverless filesystems can reset between deployments or function instances. For that setup, use this release as the public app/code release and add a managed database adapter before depending on saved report history in production.

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
