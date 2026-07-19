# MangaVerse — Implementation Roadmap

**Version:** 1.0  
**Last Updated:** 2026-07-18  
**Status:** Planning

---

## Overview

This document defines a **dependency-ordered, test-driven roadmap** from zero to production. Each level has explicit **Entry Criteria**, **Exit Criteria**, and **Key Deliverables**.

**Related Documentation:**

- [Technical Blueprint](./MangaVerse_Technical_Blueprint.md) — Detailed implementation specs
- [Tech Stack Roadmap](./MangaVerse_TechStack_Roadmap.md) — Dependencies and versions
- [Project Briefing](./MangaVerse_Project_Briefing.md) — Vision and business context
- [Mobile & RevenueCat Spec](./MangaVerse_Mobile_RevenueCat_Spec.md) — Mobile builds + billing/subscriptions

---

## Level 0: Project Bootstrap

**Entry Criteria:**

- Repository created, initial commit pushed
- `package.json` with pnpm workspace, husky, eslint, commitlint, vitest configured
- `.gitignore` excludes build artifacts, env, temp files
- README with TOC and quick-start instructions

**Exit Criteria:**

- `pnpm install` succeeds without errors
- `pnpm prepare` initializes husky hooks
- `pnpm lint` passes with max-warnings 0
- `pnpm check-types` passes (tsc --noEmit)
- `pnpm test:ci` passes (seed tests)
- `pnpm build` produces valid `dist/` with favicon

**Key Deliverables:**

- Root `package.json` + `tsconfig.json` + `tsconfig.base.json`
- ESLint config enforcing id-length, import/order, jsdoc, no-console, no-explicit-any
- Prettier config (100 printWidth, singleQuote, LF)
- Husky hooks: pre-commit (lint-staged, format, commitlint), pre-push (quality gate)
- CI workflow in `.github/workflows/ci.yml`

---

## Level 1: Core Infrastructure

**Entry Criteria:** Level 0 complete.

**Exit Criteria:**

- PostgreSQL connection established with Prisma schema
- Express server running locally with health endpoint
- JWT auth flow implemented and tested
- Redis cache layer configured

**Key Deliverables:**

- `apps/api/src/server.ts` — Express app with:
  - `/health` (GET)
  - `/api/v1/auth/register` (POST)
  - `/api/v1/auth/login` (POST)
  - `/api/v1/auth/refresh` (POST)
- `prisma/schema.prisma` — User, Manga, Character models
- `src/services/auth.ts` — JWT generation/validation
- `src/services/user.ts` — User CRUD
- Unit tests: `src/services/auth.test.ts`, `src/services/user.test.ts`

---

## Level 2: Web Client Shell

**Entry Criteria:** Level 0 complete.

**Exit Criteria:**

- Vite dev server starts at `localhost:5173`
- React Router configured with lazy-loaded routes
- Global state (Zustand) stores initialized
- TailwindCSS design system with dark mode

**Key Deliverables:**

- `apps/web/src/main.tsx` — Bootstrap
- `apps/web/src/App.tsx` — Router outlet
- `apps/web/src/routes/` — lazy-loaded route files
- `apps/web/src/stores/` — Zustand stores
- `apps/web/src/styles/tailwind.css` — base styles
- `index.html` — favicon, theme-color meta

---

## Level 3: Manga Core

**Entry Criteria:** Level 1 complete (API, DB).

**Exit Criteria:**

- Manga CRUD endpoints implemented
- Manga listing with pagination and search
- Manga detail endpoint with pages
- Web reader page with zoom/pan

**Key Deliverables:**

- `apps/api/src/services/manga.ts` — full CRUD + pagination
- `apps/api/src/routes/manga.ts` — REST endpoints
- `apps/web/src/features/reader/` — reader components
- `apps/web/src/features/studio/` — creation UI
- Tests: 90% coverage on services

---

## Level 4: AI Integration

**Entry Criteria:** Level 3 complete.

**Exit Criteria:**

- ComfyUI API wrapper functional
- Character image generation with LoRA prompt
- Scene/background generation pipeline
- Image upscaler integrated

**Key Deliverables:**

- `apps/api/src/services/comfyui.ts` — ComfyUI client
- `apps/api/src/services/ltx.ts` — video gen
- `apps/api/src/services/tts.ts` — ElevenLabs client
- `apps/web/src/features/studio/ai/` — AI controls

---

## Level 5: Animation Engine

**Entry Criteria:** Level 4 complete.

**Exit Criteria:**

- Single-page animation button functional
- Scene-wide animation generation
- LTX video output downloadable
- Sound effects and TTS overlay

**Key Deliverables:**

- `apps/api/src/services/animation.ts` — orchestrator
- `apps/web/src/features/animator/` — UI
- `apps/web/src/features/studio/animate/` — controls

---

## Level 6: Blockchain Layer

**Entry Criteria:** Level 5 complete.

**Exit Criteria:**

- Wallet connection (RainbowKit) working
- MangaNFT contract deployed (testnet)
- $MANGA token deployed with staking
- Royalty distribution contract

**Key Deliverables:**

- `blockchain/contracts/MangaNFT.sol`
- `blockchain/contracts/MangaToken.sol`
- `apps/api/src/services/web3.ts` — wallet utils
- `apps/api/src/services/nft.ts` — minting

---

## Level 7: Scale & Polish

**Entry Criteria:** Levels 1-6 complete.

**Exit Criteria:**

- CDN caching enabled for static assets
- Mobile apps build and sign
- Real-time collaboration via Socket.io
- Community features (comments, likes)

**Key Deliverables:**

- `infrastructure/k8s/` — production manifests
- `apps/mobile/` — React Native app
- `apps/desktop/` — Tauri app

---

## Level 8: Mobile & RevenueCat

**Entry Criteria:** Level 3 (Manga Core) + Level 7 (web client) functionally complete; `packages/shared` exposes reader/camera-pan/studio logic.

**Exit Criteria:**

- Expo app launches with `Purchases.configure()` per Platform.OS
- RevenueCat Paywalls present for `pro`/`studio`; Restore works
- `getCustomerInfo()` gates premium features; update listener syncs Zustand
- Web/desktop uses RevenueCat Billing (purchases-js) with shared `appUserID`
- Backend webhook credits consumables + sets subscription tier
- EAS build succeeds for iOS simulator + Android development

**Key Deliverables:**

- `apps/mobile/` — Expo + React Native app (iOS/Android)
- `apps/desktop/` — Tauri wrapper using purchases-js
- `apps/mobile/src/purchases/` — init, identify, paywall, entitlements
- RevenueCat dashboard: Project, Products, Entitlements (`pro`,`studio`), Offerings, Paywalls
- `apps/api/src/webhooks/revenuecat.ts` — signed webhook handler
- See [`MangaVerse_Mobile_RevenueCat_Spec.md`](./MangaVerse_Mobile_RevenueCat_Spec.md) for full detail

---

## Dynamics & Dynamism Systems

### Dynamic State Management (Levels 2-3)

- **Zustand stores** with dynamic selectors and memoized computation
- **Real-time subscriptions** via WebSocket for live updates
- **Optimistic UI** with rollback on failure
- **Dynamic zoom/pan/rotation** for reader experience

### Dynamic UI/UX Patterns (Levels 2-3)

- **Framer Motion** for physics-based animations
- **Gesture recognition** (swipe, pinch, drag)
- **Adaptive layouts** for mobile/desktop
- **Dynamic theme switching** with CSS variables

### Dynamic Data Flow (Levels 4-5)

- **Real-time collaboration** with conflict resolution
- **Infinite scroll** with intersection observer
- **Dynamic pagination** based on user behavior
- **Live presence indicators** for collaborative editing

### Dynamic Performance (Levels 4-7)

- **Adaptive quality scaling** based on device metrics
- **Dynamic resource loading** with priority queues
- **Network-aware optimization** (offline mode, slow connections)
- **Memory pressure handling** (cleanup unused resources)

### Dynamic API Interactions (Levels 4-7)

- **Feature flags** for A/B testing and gradual rollout
- **Optimistic updates** with automatic rollback
- **Exponential backoff** for retries
- **Request cancellation** for abandoned operations

### Dynamic Analytics (Levels 5-7)

- **Adaptive event sampling** based on user segments
- **Funnel tracking** with dynamic conversion points
- **Real-time dashboard** updates via WebSocket
- **Privacy-aware telemetry** (opt-out, anonymized)

---

## Dependency Graph

```
Level 0
    ↓
Level 1 (DB, Auth)
    ├─→ Level 2 (Web Shell)
    └─→ Level 3 (Manga Core)
              ↓
          Level 4 (AI)
              ↓
          Level 5 (Animation)
              ↓
          Level 6 (Blockchain)
              ↓
          Level 7 (Scale)
              ↓
          Level 8 (Mobile + RevenueCat)
```

---

## Testing Strategy

| Level | Test Type | Target Coverage                  |
| ----- | --------- | -------------------------------- |
| 0     | Unit      | 100% (seed)                      |
| 1     | Unit      | 80% services                     |
| 2     | Unit      | 70% components                   |
| 3     | Unit      | 80% services                     |
|       | E2E       | Critical flows                   |
| 4     | Unit      | 70% AI clients                   |
| 5     | Unit      | 70% animation                    |
| 6     | Unit      | 80% contracts                    |
|       | E2E       | Mint flow                        |
| 7     | E2E       | Full user flow                   |
| 8     | Unit      | 80% purchases                    |
|       | E2E       | Paywall→entitlement→feature gate |

---

## Deployment Pipeline

1. **CI:** lint → test → type-check → build
2. **Staging:** auto-deploy on `develop` push
3. **Production:** tag → build → deploy → smoke-test

---

## Risk Mitigation

| Risk             | Mitigation                                     |
| ---------------- | ---------------------------------------------- |
| AI quality fails | Human edit controls, fallback to API providers |
| GPU costs        | Tiered AI (free tier limited), credit system   |
| Blockchain gas   | Polygon zkEVM, batch transactions              |
| IP issues        | Content moderation, licensing system           |

---

## Next Actions

1. **Today:** Implement Level 1 (auth + DB)
2. **This Week:** Level 2 (web shell)
3. **Next Week:** Level 3 (manga CRUD + reader)
