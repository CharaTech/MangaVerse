# MANGAVERSE — Ultra-Modern Manga Studio & Reading Platform

## Executive Project Briefing v1.0

**Build Date:** April 17, 2026  
**Project Status:** Contest Development Phase  
**Version:** 1.0.0

---

## 1. PROJECT VISION

**MangaVerse** is a revolutionary Web3-powered manga creation and consumption platform that bridges the gap between traditional manga artistry and cutting-edge AI technology. The platform empowers manga artists with AI-assisted character generation, scene creation, and intelligent animations while providing readers with immersive, interactive reading experiences.

### Core Value Proposition

- **For Artists:** AI-powered character creation, reusable asset library, cloud collaboration, and monetization through blockchain
- **For Readers:** Interactive manga reading with one-click page animations, sound effects, and immersive storytelling
- **For the Ecosystem:** Decentralized ownership, creator royalties, and community governance

---

## 2. CORE FEATURES

### 2.1 Manga Studio (Artist Tools)

#### AI Character Generation

- Natural language prompts to generate manga characters
- Style customization (shonen, shoujo, seinen, etc.)
- Pose and expression variations
- Character consistency engine using LoRA/Checkpoint fine-tuning

#### Scene Builder

- Drag-and-drop scene composition
- Pre-built manga templates and layouts
- AI-assisted background generation
- Real-time collaboration tools

#### Character Library System

- Centralized character database per artist
- Reusable character assets across projects
- Character relationship mapping
- Animation pose sheets generation

#### Custom File Format (.MVX)

- Proprietary manga extension for MangaVerse
- Includes layers, vectors, AI metadata, animation data
- Blockchain-verified authorship
- DRM with watermarking

### 2.2 Manga Reader (Reader Experience)

#### Custom Reader Application

- Dedicated .MVX file support
- Variable reading modes (R2L, L2R, vertical scroll)
- Page-by-page or continuous scroll view
- Offline reading capability

#### One-Click Animation System

- **"Animate This" Button** on any page
- User choice: Current page only OR entire scene
- LTX Video Model integration for smooth animations
- Sound effects and music overlay
- Duration: 3-10 seconds per animation

#### Interactive Elements

- Clickable hotspots for character info
- Animated panel transitions
- Sound-reactive panels
- AR (Augmented Reality) manga panels

### 2.3 Blockchain Integration

#### Web3 Features

- **Creator Credentials:** NFT-based artist verification
- **Content Provenance:** Immutable authorship records
- **Token Gating:** Premium content access control
- **Royalties Engine:** Smart contract-based perpetual royalties
- **DAO Governance:** Community voting for platform decisions

#### $MANGA Token

- Platform utility token
- Staking for AI generation credits
- Governance voting weight
- Creator reward distribution

---

## 3. TARGET AUDIENCE

| Segment            | Description                              | Size Estimate  |
| ------------------ | ---------------------------------------- | -------------- |
| **Manga Artists**  | Independent creators, studio artists     | 500K+ globally |
| **Manga Readers**  | Otaku community, digital manga consumers | 50M+           |
| **Web3 Users**     | NFT collectors, crypto manga enthusiasts | 2M+            |
| **AI Enthusiasts** | Tech-forward creative professionals      | 10M+           |

---

## 4. BUSINESS MODEL

### Revenue Streams

1. **Subscription Tiers** (Freemium model) — managed via **RevenueCat** (entitlements `pro`, `studio`)
   - Free: Basic reader, limited AI generations
   - Pro ($9.99/mo): Unlimited AI, priority processing — `pro_monthly` / `pro_yearly` / `pro_lifetime`
   - Studio ($29.99/mo): Team features, API access — `studio_monthly` / `studio_yearly`

2. **Transaction Fees** (blockchain layer, separate from RevenueCat)
   - 5% on NFT manga sales
   - 2% on character asset trades
   - 1% on tips and donations

3. **AI Processing Credits** — consumable products via RevenueCat
   - Pay-per-generation model
   - Bulk credit packs: `ai_credits_100` ($4.99), `animation_pack_10` ($9.99)
   - Credited to user via RevenueCat webhook (`PRODUCT_PURCHASE`)

4. **White-Label Licensing**
   - License MangaVerse tech to publishers

### Monetization Architecture (RevenueCat)

- **Single RevenueCat Project** holds all apps (iOS, Android, Amazon, Galaxy, Web).
- **Entitlements** (`pro`, `studio`) are project-scoped and shared cross-platform via the same `appUserID`.
- **Offerings** (`default`, `winback`, `promo_*`) reference `current` so offers swap remotely.
- **Paywalls** configured in dashboard (AI Editor, custom variables, exit offers, custom fonts).
- **Web/Desktop** uses **RevenueCat Billing** (Stripe) to avoid 15–30% app-store fees.
- **Subscriptions**: App Store / Google Play / Amazon / Galaxy IAP.
- **Consumables**: credited by backend on webhook (not attached to entitlements).
- **Server re-validation**: privileged actions re-check `GET /v1/subscribers/{id}` server-side.
- Full spec: [`MangaVerse_Mobile_RevenueCat_Spec.md`](./MangaVerse_Mobile_RevenueCat_Spec.md).

---

## 4.1 MOBILE & DESKTOP CLIENTS

MangaVerse ships native mobile (iOS/Android) and desktop apps built from a **shared React Native + Expo** codebase that reuses the web reader, camera-pan, studio, and animation logic from `packages/shared`.

- **Mobile**: Expo dev builds; `react-native-purchases` + `react-native-purchases-ui`; EAS Build/Submit.
- **Desktop**: Tauri wrapper around the web/Expo-web build; uses `purchases-js` for web billing.
- **Unified entitlements**: same `appUserID` across web, mobile, desktop.
- **Capabilities**: offline reading, camera-pan reader, one-click animation playback, RevenueCat paywalls with Restore, push notifications for subscription state.
- **Compliance**: external/web checkout links shown only to eligible U.S. users per App Store ruling.

---

## 5. COMPETITIVE LANDSCAPE

| Platform              | Strengths         | Weaknesses                | MangaVerse Advantage    |
| --------------------- | ----------------- | ------------------------- | ----------------------- |
| **Clip Studio Paint** | Industry standard | No AI, No blockchain      | AI + Blockchain native  |
| **MediBang**          | Free, cloud-based | Limited AI                | Full AI suite           |
| **WebToon/Tapas**     | Large audience    | Centralized, no ownership | Decentralized ownership |
| **Novela/MangaRock**  | Reading focus     | No creation tools         | Full-stack platform     |

---

## 6. DEVELOPMENT PHASES

### Phase 1: Foundation (Month 1-2)

- Core web app structure
- Basic manga viewer
- Character prompt-to-image (Stable Diffusion)
- Single-page animations

### Phase 2: Studio (Month 3-4)

- Full Studio interface
- Character library system
- .MVX file format
- Team collaboration basics

### Phase 3: Blockchain (Month 5-6)

- NFT minting infrastructure
- $MANGA token deployment
- Smart contract royalties
- DAO governance setup

### Phase 4: Scale (Month 7-8)

- LTX Video Model integration
- Marketplace launch
- Mobile apps (iOS/Android)
- Community features

---

## 7. SUCCESS METRICS

### Month 6 Targets

- **Artists:** 1,000 registered creators
- **Readers:** 50,000 registered users
- **Manga Titles:** 500+ .MVX works
- **Animations Generated:** 10,000+
- **NFT Transactions:** 1,000+

### Month 12 Targets

- **Artists:** 10,000+ creators
- **Readers:** 500,000+ monthly active users
- **$MANGA Holders:** 25,000+
- **Marketplace GMV:** $1M+

---

## 8. RISK MITIGATION

| Risk                  | Mitigation Strategy                              |
| --------------------- | ------------------------------------------------ |
| AI generation quality | Human-in-the-loop editing, artist feedback loops |
| Copyright issues      | Content moderation AI, DMCA pipeline             |
| Blockchain complexity | Abstraction layer for non-crypto users           |
| Scalability           | Layer 2 solutions, IPFS for storage              |
| Regulatory changes    | Legal counsel, compliant architecture            |

---

## 10. IMPLEMENTATION DECISIONS

### 10.1 Architecture Decisions

| Decision               | Status               | Context                               |
| ---------------------- | -------------------- | ------------------------------------- |
| Monorepo vs Multi-repo | Monorepo             | Single pnpm workspace, shared tooling |
| Frontend Framework     | React 18             | Ecosystem maturity, TS support        |
| Backend Runtime        | Node.js 20 LTS       | Async I/O, large ecosystem            |
| Database               | PostgreSQL 16        | ACID compliance, JSONB                |
| State Management       | Zustand              | Minimal boilerplate                   |
| Build Tool             | Vite 5               | Fast HMR, optimized builds            |
| Styling                | TailwindCSS 3        | Utility-first, consistent design      |
| AI Model Hosting       | Self-hosted (RunPod) | Cost control, privacy                 |
| Blockchain             | Polygon zkEVM        | Low gas, EVM-compatible               |

### 10.2 Data Model Decisions

- **UUID v7** for all primary keys (time-ordered, index-friendly)
- **JSONB** for flexible profile/settings fields
- **Enum types** for status fields (draft/published/archived)
- **Timestamps** with `created_at`, `updated_at`, `deleted_at` (soft delete)

### 10.3 Security Decisions

- **bcrypt** cost factor 12 for password hashing
- **RS256** for JWT signing (asymmetric, key rotation)
- **Zod** for all input validation (schema-first)
- **Helmet** for security headers
- **Rate limiting** via Redis + token bucket

### 10.4 File Storage Decisions

- **IPFS** for immutable content (covers, characters)
- **CloudFlare R2** for mutable assets (manga pages, animations)
- **CIDs** stored in PostgreSQL, URLs generated via gateway

### 10.5 API Design Decisions

- **REST** for CRUD operations
- **WebSocket** for real-time (collaboration, notifications)
- **Pagination** via cursor-based (efficient for large datasets)
- **Error format:** RFC 7807 Problem Details

---

## 11. DEVELOPMENT WORKFLOW

### 11.1 Git Strategy

```
main (production) ← deploy ← release/v{version}
                    ↑
                 develop (integration)
                    ↑
              feature/{name} → PR → review → merge
```

### 11.2 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, security, perf, docs, style, refactor, test, chore, ci, build, revert

### 11.3 CI/CD Pipeline

| Stage   | Command                          | Description              |
| ------- | -------------------------------- | ------------------------ |
| Install | `pnpm install --frozen-lockfile` | Install dependencies     |
| Lint    | `pnpm lint`                      | ESLint + TypeScript      |
| Test    | `pnpm test:ci`                   | Unit tests with coverage |
| Build   | `pnpm build`                     | Production build         |
| Deploy  | `fly deploy`                     | Deploy to Fly.io         |

### 11.4 Code Review Checklist

- [ ] Tests added/updated for new code
- [ ] Type definitions updated
- [ ] JSDoc comments for exported symbols
- [ ] No console.log (only console.warn/error allowed)
- [ ] Single-letter variable names avoided
- [ ] Import order correct (alphabetized, grouped)
- [ ] Security review for auth-sensitive code

---

## 12. DEPLOYMENT SPECIFICATION

### 12.1 Environments

| Environment | URL                    | Purpose           |
| ----------- | ---------------------- | ----------------- |
| Development | localhost:5173         | Local development |
| Staging     | staging.mangaverse.xyz | Pre-production    |
| Production  | mangaverse.xyz         | Live              |

### 12.2 Infrastructure as Code

- **Kubernetes** via Fly.io
- **Database:** PostgreSQL via Fly.io managed
- **Cache:** Redis via Fly.io managed
- **Storage:** CloudFlare R2 + Workers

### 12.3 Secrets Management

| Secret       | Location       | Rotation  |
| ------------ | -------------- | --------- |
| JWT keys     | Vault          | Quarterly |
| Database URL | Vault          | N/A       |
| API keys     | GitHub Secrets | As needed |

---

## 13. SUCCESS METRICS & KPIs

### 13.1 Technical KPIs

| Metric                                 | Target        |
| -------------------------------------- | ------------- |
| Page load time                         | < 2 seconds   |
| API response time                      | < 200ms (p95) |
| AI generation success rate             | > 90%         |
| Animation generation time              | < 60 seconds  |
| Uptime                                 | > 99.9%       |
| Zero critical security vulnerabilities |               |

### 13.2 Business KPIs

| Metric               | Month 3 | Month 6 | Month 12 |
| -------------------- | ------- | ------- | -------- |
| Registered artists   | 1,000   | 5,000   | 10,000+  |
| Registered readers   | 50,000  | 500,000 | 500,000+ |
| Manga uploaded       | 500     | 5,000   | 50,000+  |
| Animations generated | 10,000  | 100,000 | 500,000+ |
| NFT transactions     | 1,000   | 10,000  | 100,000+ |
| Revenue positive     |         |         | Month 12 |

---

## 14. CONTACT & LINKS

- **Project Name:** MangaVerse
- **Tagline:** "Where Manga Meets Tomorrow"
- **Development Status:** Active Contest Build
- **Documentation:** See the [`docs/`](./) directory — Technical Blueprint, Tech Stack & Roadmap, ROADMAP, Sponsor Request

---

_This briefing is prepared for sponsor presentations and contest submissions. Last updated: July 18, 2026_
