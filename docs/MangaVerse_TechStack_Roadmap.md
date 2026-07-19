# MangaVerse — Technology Stack & Development Roadmap

**Version:** 1.0  
**Last Updated:** 2026-07-18  
**Status:** Reference

---

## 1. Technology Stack Summary

### 1.1 Frontend Technologies

| Category         | Technology      | Version | Source |
| ---------------- | --------------- | ------- | ------ |
| Framework        | React 18        | 18.3.1  | npm    |
| Build Tool       | Vite 5          | 5.4.21  | npm    |
| State Management | Zustand         | 4.5.2   | npm    |
| Styling          | TailwindCSS     | 3.4.3   | npm    |
| Animation        | Framer Motion   | 11.18.2 | npm    |
| 3D Effects       | Three.js        | 0.165.0 | npm    |
| Canvas           | Fabric.js       | 6.9.1   | npm    |
| PDF Rendering    | react-pdf       | 8.11.0  | npm    |
| Icons            | Lucide React    | 0.511.0 | npm    |
| Forms            | React Hook Form | 7.53.0  | npm    |
| Validation       | Zod             | 3.23.8  | npm    |
| Data Fetching    | TanStack Query  | 5.56.0  | npm    |
| Routing          | React Router    | 6.29.0  | npm    |
| i18n             | i18next         | 13.6.0  | npm    |

### 1.2 Backend Technologies

| Category   | Technology  | Version     | Source |
| ---------- | ----------- | ----------- | ------ |
| Runtime    | Node.js     | 20.19.0 LTS | node   |
| Framework  | Express.js  | 4.21.2      | npm    |
| Validation | Zod         | 3.23.8      | npm    |
| ORM        | Prisma      | 5.22.0      | npm    |
| Task Queue | BullMQ      | 6.2.1       | npm    |
| Cache      | Redis       | 7.4.1       | npm    |
| Search     | Meilisearch | 1.10.1      | docker |

### 1.3 AI/ML Technologies

| Category              | Technology          | Version | Source |
| --------------------- | ------------------- | ------- | ------ |
| Image Generation      | Stable Diffusion XL | 1.0     | local  |
| Video Generation      | LTX Video           | Latest  | local  |
| Prompt Interface      | ComfyUI             | Latest  | github |
| Character Consistency | LoRA (Dreambooth)   | Latest  | local  |
| Upscaling             | Real-ESRGAN         | Latest  | local  |
| Inpainting            | PlaygroundAI        | Latest  | local  |
| TTS                   | ElevenLabs          | API v2  | api    |
| Sound Effects         | Meta Audiobox       | Latest  | API    |

### 1.4 Blockchain Technologies

| Category      | Technology         | Version            | Source    |
| ------------- | ------------------ | ------------------ | --------- |
| L1/L2 Chain   | Polygon zkEVM      | Latest             | polygon   |
| Alt L2        | Arbitrum           | Orbit              | arbitrum  |
| Wallet        | RainbowKit         | 2.0.8              | npm       |
| Wagmi         | wagmi              | 2.9.1              | npm       |
| NFT Standard  | ERC-721 + ERC-1155 | OpenZeppelin 5.0.2 | npm       |
| Token         | ERC-20             | OpenZeppelin 5.0.2 | npm       |
| Marketplace   | Seaport            | 1.6.0              | npm       |
| Oracles       | Chainlink          | VRF + Functions    | chainlink |
| Storage       | IPFS               | Latest             | pinata    |
| DID           | ENS + Lens         | Latest             | lens      |
| Dev Framework | Hardhat            | 2.22.10            | npm       |

### 1.5 Mobile & Desktop Technologies

| Category        | Technology                          | Version                 | Source |
| --------------- | ----------------------------------- | ----------------------- | ------ |
| Framework       | React Native                        | 0.74+                   | npm    |
| Tooling         | Expo (SDK 51+)                      | latest                  | npm    |
| Dev Client      | expo-dev-client                     | latest                  | npm    |
| Build           | EAS Build / Submit                  | latest                  | npm    |
| Purchases SDK   | react-native-purchases              | 9.5.4+ (Test Store min) | npm    |
| Paywalls UI     | react-native-purchases-ui           | latest                  | npm    |
| Galaxy Store    | react-native-purchases-store-galaxy | 10.3.0+                 | npm    |
| Web/Billing SDK | purchases-js                        | 1.15.0+                 | npm    |
| Desktop         | Tauri                               | 2.x                     | cargo  |
| Shared Code     | Turborepo `packages/shared`         | 2.x                     | npm    |

### 1.6 Payments & Monetization (RevenueCat)

| Capability           | RevenueCat Feature                           | Notes                                  |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| iOS IAP              | StoreKit wrapper                             | App Store Connect products             |
| Android IAP          | Google Play Billing wrapper                  | Play Console products                  |
| Amazon IAP           | Amazon Appstore adapter                      | `.pem` public key                      |
| Galaxy IAP           | Samsung Galaxy adapter                       | physical device for tests              |
| Web Billing          | RevenueCat Billing (Stripe)                  | no app-store fee                       |
| Entitlements         | `pro`, `studio`                              | project-scoped                         |
| Offerings/Packages   | `default`, `winback`                         | reference `current`                    |
| Paywalls             | RevenueCatUI + AI Editor                     | dashboard-configured                   |
| Webhooks             | `INITIAL_PURCHASE`, `PRODUCT_PURCHASE`, etc. | sign verified                          |
| REST API             | `/v1/subscribers/{id}`                       | server re-validation                   |
| Offline Entitlements | SDK local grant                              | subscriptions only                     |
| AI Toolkit           | MCP Server + skills                          | `npx skills add RevenueCat/ai-toolkit` |

---

## 2. Development Roadmap (Detailed)

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Project Setup**

```bash
# Bootstrap repository
git clone <repo-url>
pnpm install
pnpm prepare  # initializes husky

# Verify setup
pnpm lint
pnpm check-types
pnpm test:ci
```

**Deliverables:**

- Repository initialized with CI/CD
- Design system (TailwindCSS + components)
- Database schema design (Prisma)

**Week 2: Backend Core**

```bash
# Create Express server
pnpm add express zod cors helmet
pnpm add -D @types/express @types/cors @types/helmet

# Generate Prisma schema
npx prisma init
# Edit prisma/schema.prisma
npx prisma migrate dev --name init
```

**Deliverables:**

- Express API server
- User authentication (JWT + OAuth)
- PostgreSQL + Prisma setup

**Week 3: Frontend Core**

```bash
# Create React app
pnpm create vite apps/web --template react-ts
cd apps/web
pnpm add tailwindcss @tailwindcss/forms zustand react-router-dom

# Initialize Tailwind
npx tailwindcss init -p
```

**Deliverables:**

- React app with Vite
- Authentication flows
- Basic manga listing pages

**Week 4: Integration + MVP**

```bash
# Connect frontend to backend
# Add proxy to vite.config.ts
server.proxy = { '/api': 'http://localhost:3000' }

# Deploy staging
# Configure GitHub Actions for staging deployment
```

**Deliverables:**

- Connected frontend + backend
- Basic manga upload and reading
- Staging deployment

---

### Phase 2: AI Integration (Weeks 5-8)

**Week 5: ComfyUI Integration**

```bash
# Install ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
python main.py

# Create API wrapper
pnpm add axios ws
```

**Deliverables:**

- ComfyUI API wrapper
- SDXL model setup
- Character prompt interface

**Week 6: Character System**

```bash
# Create character service
src/services/character.ts

# Add LoRA training endpoint
# Implement character library CRUD
```

**Deliverables:**

- Character creation flow
- Reference image upload
- LoRA training pipeline

**Week 7: Scene Generation**

```bash
# Implement background generation
# Build panel layout editor
# Add text bubble placement
```

**Deliverables:**

- Scene generation tool
- Panel layout editor
- Text bubble placement

**Week 8: Studio MVP**

```bash
# Build full Studio interface
# Implement canvas-based editor
# Add AI-assisted panel creation
```

**Deliverables:**

- Full Studio interface
- Canvas-based manga editor
- AI-assisted tools

---

### Phase 3: Animation Engine (Weeks 9-12)

**Week 9: LTX Video Integration**

```bash
# Deploy LTX model
# Create image-to-video pipeline
# Implement prompt engineering
```

**Deliverables:**

- LTX model deployment
- Image-to-video pipeline
- Basic animation generation

**Week 10: Animation Controls**

```bash
# Implement page-only animation
# Add scene-wide animation option
# Create duration control
```

**Deliverables:**

- Animation controls
- Duration settings
- Quality settings

**Week 11: Audio Integration**

```bash
# Integrate TTS
# Add sound effect generation
# Implement audio-video sync
```

**Deliverables:**

- Sound effect generation
- TTS dialogue
- Audio-video sync

**Week 12: Reader Enhancement**

```bash
# Add animation playback
# Create user choice modal
# Build animation gallery
```

**Deliverables:**

- Animation playback in reader
- Animation gallery
- Download/share animations

---

### Phase 4: Blockchain (Weeks 13-16)

**Week 13: Wallet Integration**

```bash
# Install wallet packages
pnpm add wagmi viem @rainbow-me/rainbowkit

# Configure chains
# Implement wallet connection flow
```

**Deliverables:**

- RainbowKit/wagmi setup
- Multi-chain wallet connection
- Polygon zkEVM integration

**Week 14: NFT Contracts**

```bash
# Write MangaNFT contract (ERC-721)
# Write CharacterLicense contract (ERC-1155)
# Deploy and verify
```

**Deliverables:**

- MangaNFT contract
- CharacterLicense contract
- Royalty engine

**Week 15: NFT Features**

```bash
# Implement minting UI
# Build NFT gallery
# Add marketplace integration
```

**Deliverables:**

- NFT minting
- NFT gallery
- Marketplace integration

**Week 16: Token & DAO**

```bash
# Deploy $MANGA token
# Implement staking
# Add DAO governance
```

**Deliverables:**

- $MANGA token
- Staking mechanism
- DAO governance

---

### Phase 5: Scale & Polish (Weeks 17-20)

**Week 17: Performance**

```bash
# Configure CDN
# Implement image lazy loading
# Optimize database queries
```

**Deliverables:**

- CDN optimization
- Lazy loading
- Query optimization

**Week 18: Mobile Apps + RevenueCat**

```bash
# Create Expo project
npx create-expo-app@latest MangaVerseMobile
cd MangaVerseMobile
npx expo install expo-dev-client
npx expo install react-native-purchases react-native-purchases-ui
# Configure RevenueCat in App.tsx (Purchases.configure per Platform.OS)
# Wire Paywalls: RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'pro' })
# EAS build: ios-simulator + android development profiles
```

**Deliverables:**

- iOS build (App Store, IAP enabled)
- Android build (Google Play, BILLING permission)
- Mobile reader (reuses shared camera-pan + studio code)
- RevenueCat Paywalls (pro/studio) with Restore button
- Test Store dev testing + sandbox submission flow

**Week 19: Collaboration**

```bash
# Implement Socket.io
# Add project sharing
# Build comment system
```

**Deliverables:**

- Real-time collaboration
- Project sharing
- Comment system

**Week 20: Community & Launch**

```bash
# Launch community features
# Implement discovery algorithm
# Prepare public launch
```

**Deliverables:**

- Social features
- Discovery algorithm
- Public launch

---

## 3. Setup Commands Reference

### Root Level

```bash
pnpm install           # Install all dependencies
pnpm prepare           # Initialize husky
pnpm build             # Build all packages
pnpm lint              # Run ESLint
pnpm check-types       # Run TypeScript check
pnpm test              # Run tests
pnpm test:ci           # Run tests with coverage
```

### API (apps/api)

```bash
pnpm dev:api           # Start Express server
pnpm prisma studio     # Open Prisma Studio
pnpm prisma migrate dev --name <name>  # Create migration
```

### Web (apps/web)

```bash
pnpm dev               # Start Vite dev server
pnpm build             # Production build
pnpm preview           # Preview production build
```

### AI (apps/ai)

```bash
# Start ComfyUI server
python main.py --listen 0.0.0.0 --port 8188
```

---

## 4. Decision Log

| Date       | Decision                        | Context                        |
| ---------- | ------------------------------- | ------------------------------ |
| 2026-07-18 | Use Turborepo for build caching | Faster incremental builds      |
| 2026-07-18 | PostgreSQL + Prisma             | Type-safe ORM, relational data |
| 2026-07-18 | Zustand for state               | Lightweight, TS-native         |
| 2026-07-18 | Polygon zkEVM for NFTs          | Low gas, EVM-compatible        |

---

_Document Version: 1.0_  
_Last Updated: July 18, 2026_
