# SignageSyncWatch

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

Synchronization monitoring app for multi-screen digital signage. Upload screenshots from several displays, compare visual drift, and save sync reports.

## Table of Contents

- [What It Does](#what-it-does)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Production Checks](#production-checks)
- [Release Notes](#release-notes)
- [License](#license)
- [About](#about)

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

## License

MIT

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
