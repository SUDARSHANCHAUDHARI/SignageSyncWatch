# SignageSyncWatch

Digital signage synchronization monitoring platform. Upload screenshots from multiple displays and detect visual desynchronization — screen drift, playlist mismatch, delayed transitions, and frozen playback.

## Use Cases
- Signage QA teams verifying multi-screen deployments
- AV integrators checking video wall sync
- Retail/restaurant operations monitoring display fleets

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- pnpm

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Production Storage

`SignageSyncWatch` stores groups, uploaded screens, and comparison reports in file-backed JSON under `SIGNAGE_DATA_DIR`.

```env
SIGNAGE_DATA_DIR=.signage-data
SIGNAGE_STORAGE_DRIVER=file
```

Use a persistent mounted volume for `SIGNAGE_DATA_DIR` in production. Set `SIGNAGE_STORAGE_DRIVER=memory` only for disposable demos.

## License
MIT — SudarshanTechLabs
