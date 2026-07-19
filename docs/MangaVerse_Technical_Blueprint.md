# MangaVerse — Technical Blueprint & Implementation Specification

**Version:** 1.0  
**Last Updated:** 2026-07-18  
**Authors:** MangaVerse Development Team

---

## 1. Architecture Overview

### 1.1 System Context

```
┌───────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │   Web App   │  │  Desktop    │  │   Mobile    │                    │
│  │  (React)    │  │   (Tauri)   │  │ (ReactNat.) │                    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                    │
└─────────┼────────────────┼────────────────┼─────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY (CloudFlare)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   REST API   │  │  GraphQL     │  │  WebSocket   │              │
│  │  (Express)   │  │ (Apollo)     │  │   (Socket.io)│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   AUTH SERVICE   │ │  MANGA SERVICE   │ │ CHARACTER SERVICE│
│  (JWT, OAuth)    │ │ (CRUD, Pages)    │ │ (Library, LoRA)  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
           │                   │                   │
           └─────────┬─────────┴─────────┬─────────┘
                     ▼                   ▼
              ┌──────────────┐   ┌──────────────┐
              │   DATABASE   │   │    CACHE     │
              │  PostgreSQL  │   │   Redis      │
              │  (Primary)   │   │ (Cache/Queue)│
              └──────────────┘   └──────────────┘
```

### 1.2 Service Boundaries

| Service    | Port | Dependencies      | Owner    |
| ---------- | ---- | ----------------- | -------- |
| api        | 3000 | postgres, redis   | backend  |
| web        | 5173 | api, ipfs-gateway | frontend |
| ai         | 8000 | comfyui, redis    | ml       |
| blockchain | 8545 | hardhat, ethers   | web3     |

---

## 2. Data Models

### 2.1 User Entity

```typescript
// src/entities/user.ts
export interface User {
  id: string; // UUID v7, primary key
  email: string; // UNIQUE, validated by Zod
  passwordHash: string; // bcrypt, cost factor 12
  username: string; // UNIQUE, 3-32 chars, alphanumeric + _
  walletAddress?: string; // Ethereum address, UNIQUE if present
  profile: UserProfile;
  settings: UserSettings;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface UserProfile {
  displayName: string; // 1-50 chars
  avatarUrl: string | null; // IPFS CID or null
  bio: string | null; // max 500 chars
  website: string | null; // URL validated
  twitter: string | null; // @handle format
  discord: string | null; // Discord tag
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string; // ISO 639-1 (en, ja, zh, ...)
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  notifications: {
    email: boolean;
    push: boolean;
    discord: boolean;
  };
  privacy: {
    profilePublic: boolean;
    statsPublic: boolean;
  };
}

export type Subscription = {
  tier: 'free' | 'pro' | 'studio';
  expiresAt: Date | null;
  credits: {
    aiGenerations: number;
    animations: number;
  };
};
```

**PostgreSQL Schema:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username VARCHAR(32) UNIQUE NOT NULL,
  wallet_address VARCHAR(42) UNIQUE,
  profile JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  subscription JSONB NOT NULL DEFAULT '{"tier":"free"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);
```

### 2.2 Manga Entity

```typescript
// src/entities/manga.ts
export interface Manga {
  id: string; // UUID v7
  authorId: string; // FK: users.id
  title: string; // 1-200 chars
  description: string; // max 5000 chars
  coverId?: string; // FK: assets.id
  genres: string[]; // array of genre slugs
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'unlisted' | 'public';
  chapters: ChapterRef[];
  settings: MangaSettings;
  nft?: MangaNFT;
  stats: MangaStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface MangaSettings {
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  allowAnimations: boolean;
  allowNft: boolean;
}

export interface ChapterRef {
  id: string; // UUID v7 of chapter
  number: number; // 1-based
  title: string;
  thumbnailId?: string; // FK: assets.id
}

export interface MangaNFT {
  contractAddress: string;
  tokenId: string;
  mintPrice: string; // in $MANGA tokens
}

export interface MangaStats {
  views: number; // counter
  likes: number; // counter
  shares: number; // counter
}
```

### 2.3 Character Entity

```typescript
// src/entities/character.ts
export interface Character {
  id: string; // UUID v7
  ownerId: string; // FK: users.id
  name: string; // 1-100 chars
  description: string; // max 2000 chars
  referenceImages: string[]; // IPFS CIDs
  loraPath?: string; // trained LoRA path
  attributes: CharacterAttributes;
  poses: CharacterPose[];
  relationships: CharacterRelationship[];
  licensing: CharacterLicensing;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterAttributes {
  gender?: string;
  age?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  personality?: string[];
  species?: string;
  occupation?: string;
}

export interface CharacterPose {
  id: string;
  name: string;
  imageId: string; // IPFS CID
  prompt: string; // generation prompt
}

export interface CharacterRelationship {
  characterId: string; // FK: characters.id
  type: 'friend' | 'family' | 'rival' | 'romantic' | 'neutral';
  description: string;
}

export interface CharacterLicensing {
  isLicensable: boolean;
  price?: string; // in $MANGA tokens
  usageTerms?: string; // SPDX or custom
}
```

---

## 3. API Specification

### 3.1 Authentication

#### POST `/api/v1/auth/register`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Min8Char!@",
  "username": "artist_name"
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "artist_name"
  }
}
```

**Errors:**

- `400` — validation error (Zod)
- `409` — email/username already exists

#### POST `/api/v1/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Min8Char!@"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "username": "..." }
}
```

**Errors:**

- `401` — invalid credentials

#### GET `/api/v1/auth/me`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{ "user": { ... } }
```

### 3.2 Manga CRUD

#### GET `/api/v1/manga`

**Query Params:**

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional string)
- `genre` (optional, can be multiple)
- `sort` (default: `newest`, options: `newest`, `oldest`, `popular`)

**Response (200):**

```json
{
  "data": [{ "id": "...", "title": "...", "coverId": "..." }],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1234,
    "hasNext": true
  }
}
```

#### GET `/api/v1/manga/:id`

**Response (200):**

```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "author": { "id": "...", "username": "..." },
  "chapters": [{ "id": "...", "number": 1, "title": "..." }],
  "stats": { "views": 123, "likes": 45, "shares": 12 }
}
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

1. Client sends credentials to `/auth/register` or `/auth/login`
2. Server validates input with Zod schema
3. Password hashed with bcrypt (cost 12)
4. JWT signed with RS256 (2048-bit key)
5. Access token TTL: 15 minutes
6. Refresh token TTL: 7 days, stored as httpOnly cookie

### 4.2 Authorization Matrix

| Resource               | Role  | Action           |
| ---------------------- | ----- | ---------------- |
| /api/v1/manga          | user  | create, read own |
| /api/v1/manga          | any   | read public      |
| /api/v1/manga/:id      | owner | update, delete   |
| /api/v1/characters     | user  | create, read own |
| /api/v1/characters/:id | owner | update, delete   |

### 4.3 Input Validation

All endpoints use Zod schemas:

```typescript
// src/schemas/auth.ts
export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/[0-9]/, 'Must include number')
    .regex(/[^A-Za-z0-9]/, 'Must include special char'),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
});
```

---

## 5. Deployment Architecture

### 5.1 Kubernetes Manifests

```yaml
# infrastructure/k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mangaverse-api
  labels:
    app: mangaverse-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mangaverse-api
  template:
    metadata:
      labels:
        app: mangaverse-api
    spec:
      containers:
        - name: api
          image: ghcr.io/mangaverse/api:${GITHUB_SHA}
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: mangaverse-secrets
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '2Gi'
              cpu: '1000m'
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: mangaverse-api
spec:
  selector:
    app: mangaverse-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### 5.2 Environment Variables

| Name                   | Description           | Example                             |
| ---------------------- | --------------------- | ----------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| `REDIS_URL`            | Redis connection      | `redis://host:6379`                 |
| `JWT_PRIVATE_KEY`      | RS256 private key     | PEM string                          |
| `JWT_PUBLIC_KEY`       | RS256 public key      | PEM string                          |
| `ENCRYPTION_KEY`       | Field encryption key  | 256-bit hex                         |
| `CLOUDFLARE_API_TOKEN` | R2 access             | -                                   |
| `IPFS_GATEWAY`         | IPFS gateway URL      | `https://gateway.ipfs.io`           |

---

## 6. Monitoring & Observability

### 6.1 Metrics

| Metric                           | Type      | Description            |
| -------------------------------- | --------- | ---------------------- |
| `http_requests_total`            | Counter   | All HTTP requests      |
| `http_request_duration_seconds`  | Histogram | Request latency        |
| `db_query_duration_seconds`      | Histogram | Database query time    |
| `ai_generation_duration_seconds` | Histogram | AI generation time     |
| `ai_generation_errors_total`     | Counter   | AI generation failures |

### 6.2 Tracing

OpenTelemetry traces for:

- Request flow (HTTP → Service → DB)
- AI generation pipeline
- Blockchain transactions

---

## 7. Migration Guide

### 7.1 Database Migrations (Prisma)

```bash
# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Reset (dev only)
npx prisma migrate reset
```

### 7.2 Environment Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
pnpm prisma generate

# Run dev
pnpm dev:api   # API on :3000
pnpm dev:ai    # AI on :8000
```

---

## 8. Manga Studio Implementation Specification

### 8.1 AI Character Generation System

#### 8.1.1 Request Flow

```
Client → POST /api/v1/characters/generate
         ↓
         Validate with Zod schema
         ↓
         Queue job to Redis (BullMQ)
         ↓
         Worker picks up job
         ↓
         Call ComfyUI /prompt endpoint
         ↓
         Receive base64 image
         ↓
         Upload to CloudFlare R2 / IPFS
         ↓
         Store CID in database
         ↓
         Return CID to client
```

#### 8.1.2 API Contract: POST `/api/v1/characters/generate`

**Request Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**

```typescript
interface GenerateCharacterRequest {
  name?: string; // 1-100 chars, optional
  description: string; // 1-500 chars, required
  style?: 'shonen' | 'shoujo' | 'seinen' | 'josei' | 'koma-komi';
  count?: number; // 1-4, default 1
  width?: number; // 512, 768, 1024 (default 768)
  height?: number; // 512, 768, 1024 (default 1024)
  seed?: number; // optional, for reproducibility
  referenceImage?: string; // base64 or IPFS CID
  negativePrompt?: string; // things to avoid
}
```

**Default Negative Prompt:**

```
lowres, bad anatomy, bad hands, text, watermark, blurry, out of focus,
 deformed, distorted, ugly, extra limbs, missing limbs, malformed
```

**Response (200):**

```typescript
interface GenerateCharacterResponse {
  characterId: string; // UUID v7
  images: Array<{
    cid: string; // IPFS Content Identifier
    url: string; // gateway URL
    prompt: string; // full generation prompt
  }>;
  jobId: string; // BullMQ job ID
  estimatedTime: number; // seconds
}
```

**Response (202 - Async):**

```typescript
interface AsyncGenerateResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;
}
```

**Error Codes:**

- `400` — validation error
- `401` — unauthorized
- `403` — insufficient credits (subscription tier)
- `429` — rate limited (max 5 concurrent generations)
- `503` — AI service unavailable

#### 8.1.3 ComfyUI Prompt Template

```python
# Prompt template for character generation
prompt_template = """
1girl, {description}, {style_description},
masterpiece, best quality, ultra detailed, 8k,
manga style, clean lines, cel shading,
{additional_constraints}
Negative prompt: {negative_prompt}
Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7,
Size: {width}x{height}, Model: sdxl_v1_0
"""

style_descriptions = {
  'shonen': 'dynamic pose, spiky hair, bright colors, energetic',
  'shoujo': 'soft features, large eyes, flowing hair, romantic',
  'seinen': 'mature, detailed, realistic proportions, dark tones',
  'josei': 'elegant, detailed, realistic, emotional',
  'koma-komi': '4koma style, simple lines, clean composition'
}
```

#### 8.1.4 Character Consistency Engine (LoRA)

**Training Pipeline:**

```
1. Character reference images (3-5 images)
2. Extract features with CLIP
3. Fine-tune LoRA adapter (rank 4, alpha 1)
4. Train for 1000 steps (batch 1, lr 1e-4)
5. Export to .safetensors
6. Upload to R2, store path in DB
```

**API: POST `/api/v1/characters/:id/train-lora`**

```typescript
interface TrainLoraRequest {
  steps?: number; // 500-2000, default 1000
  lr?: number; // learning rate, default 1e-4
  rank?: number; // LoRA rank, default 4
  triggerWord?: string; // custom trigger, auto-generated
}

interface TrainLoraResponse {
  loraId: string;
  status: 'training' | 'completed' | 'failed';
  triggerWord: string;
  trainedAt: Date;
  expiresAt: Date; // 30 days
}
```

### 8.2 Scene Builder System

#### 8.2.1 Scene Data Model

```typescript
// src/entities/scene.ts
export interface Scene {
  id: string; // UUID v7
  ownerId: string; // FK: users.id
  title: string; // 1-200 chars
  description: string; // max 1000 chars
  layout: SceneLayout;
  panels: ScenePanel[];
  background: SceneBackground;
  effects: SceneEffect[];
  metadata: SceneMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface SceneLayout {
  type: 'grid' | 'freeform' | 'template';
  template?: 'standard' | '3panel' | '4panel' | '6panel';
  gridSize?: { cols: number; rows: number };
  panelsOrder: string[]; // panel IDs in reading order
}

export interface ScenePanel {
  id: string; // UUID v7
  sceneId: string; // FK: scenes.id
  position: { x: number; y: number };
  size: { width: number; height: number }; // in viewBox units
  backgroundImageId?: string; // IPFS CID
  foregroundObjects: SceneObject[];
  dialogue?: PanelDialogue;
  effects?: PanelEffect[];
}

export interface SceneObject {
  id: string;
  type: 'character' | 'background' | 'prop' | 'ui';
  characterId?: string; // FK: characters.id
  position: { x: number; y: number; z?: number };
  scale: number;
  rotation: number;
  layer: number;
  opacity: number; // 0-1
  flip?: 'none' | 'horizontal' | 'vertical';
  referenceImageId?: string; // IPFS CID
}

export interface PanelDialogue {
  speaker?: string; // character name or 'Narration'
  text: string; // max 500 chars
  position: { x: number; y: number };
  style: 'speech' | 'thought' | 'narration';
  tail?: 'left' | 'right' | 'top' | 'bottom';
}

export interface SceneBackground {
  type: 'solid' | 'gradient' | 'image' | 'procedural';
  color?: string; // hex or gradient string
  imageId?: string; // IPFS CID
  pattern?: 'none' | 'dots' | 'lines';
}

export interface SceneEffect {
  type: 'particle' | 'rain' | 'snow' | 'sparkle' | 'motion';
  config: Record<string, any>;
  layer: 'background' | 'midground' | 'foreground';
}

export interface SceneMetadata {
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  language: string; // ISO 639-1
  tags: string[]; // genre/style tags
  estimatedPages: number; // calculated
}
```

#### 8.2.2 API Contracts for Scene Builder

**POST `/api/v1/scenes`**

```typescript
interface CreateSceneRequest {
  title: string;
  description: string;
  layout: SceneLayout;
  background?: SceneBackground;
}

interface CreateSceneResponse {
  sceneId: string;
  projectId?: string; // if part of manga
}
```

**PUT `/api/v1/scenes/:id/panels`**

```typescript
interface AddPanelRequest {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface AddPanelResponse {
  panelId: string;
}
```

**POST `/api/v1/scenes/:id/background`**

```typescript
interface GenerateBackgroundRequest {
  style: string; // "urban", "forest", "house interior", etc.
  timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk';
  mood?: 'peaceful' | 'action' | 'mysterious' | 'romantic';
  resolution?: [number, number]; // width, height
}

interface GenerateBackgroundResponse {
  imageId: string; // IPFS CID
  prompt: string;
}
```

### 8.3 Character Library System

#### 8.3.1 Library Organization

```typescript
export interface CharacterLibrary {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  characters: string[]; // Character IDs
  folders: LibraryFolder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryFolder {
  id: string;
  libraryId: string;
  name: string;
  characterIds: string[];
  parentFolderId?: string;
  createdAt: Date;
}
```

#### 8.3.2 API Contracts

**GET `/api/v1/library`**

```typescript
interface LibraryResponse {
  libraries: Array<{
    id: string;
    name: string;
    description: string;
    characterCount: number;
    folderCount: number;
    createdAt: string;
  }>;
}
```

**POST `/api/v1/library/:id/characters/:charId/share`**

```typescript
interface ShareCharacterRequest {
  libraryId: string;
  expiresAt?: Date;
  permissions?: 'view' | 'download' | 'edit';
}
```

### 8.4 MVX File Format Specification

#### 8.4.1 File Structure

```
.MVX File (ZIP archive)
├── manifest.json           # Metadata, version, author
├── thumbnails/              # Cover, chapter thumbnails
├── chapters/
│   ├── chapter-001/
│   │   ├── pages/
│   │   │   ├── 001.json   # Page data
│   │   │   ├── 001.png    # Page image
│   │   │   └── 001.ai     # AI generation metadata
│   │   └── assets/
│   │       ├── characters/
│   │       └── backgrounds/
├── characters/              # Character references
├── animations/              # Generated animations
├── metadata.json            # Extended metadata
└── signature.json           # Blockchain signature (optional)
```

#### 8.4.2 Manifest Schema

```json
{
  "version": "1.0",
  "format": "mvx",
  "title": "Manga Title",
  "author": {
    "id": "uuid",
    "username": "artist_name",
    "walletAddress": "0x..."
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-07-18T14:22:00Z",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter 1: Beginning",
      "pageCount": 24,
      "thumbnail": "ipfs://cid/thumbnail.jpg"
    }
  ],
  "tags": ["shonen", "adventure"],
  "readingDirection": "rtl",
  "license": "all-rights-reserved"
}
```

#### 8.4.3 Page JSON Schema

```json
{
  "id": "uuid",
  "chapterId": "uuid",
  "number": 1,
  "size": { "width": 1200, "height": 1800 },
  "panels": [
    {
      "id": "uuid",
      "position": { "x": 0, "y": 0, "width": 1200, "height": 900 },
      "objects": [
        {
          "type": "image",
          "cid": "ipfs://...",
          "layer": 1
        }
      ],
      "dialogue": {
        "text": "Hello there!",
        "speaker": "Character Name",
        "style": "speech"
      },
      "effects": []
    }
  ],
  "metadata": {
    "aiGenerated": false,
    "generationPrompt": null,
    "artistNotes": ""
  }
}
```

---

## 9. Manga Reader Implementation Specification

### 9.1 Reader Component Architecture

```
ReaderApp
├── ReaderProvider (Zustand)
│   ├── State: currentPage, zoom, readingDirection, camera
│   └── Actions: goToPage, zoomIn, zoomOut, resetCamera, fitToScreen
├── CameraPanSystem
│   ├── 3D Camera (Three.js PerspectiveCamera)
│   ├── OrbitControls (pan, zoom, rotate)
│   └── Dynamic position based on content
├── ReaderCanvas
│   ├── PageRenderer (canvas-based)
│   ├── PanelHighlighter
│   ├── HotspotLayer
│   └── CameraOverlay (for pan controls)
├── Controls
│   ├── ChapterNavigation
│   ├── ZoomControls
│   ├── CameraControls (Reset, Fit, Pan Mode)
│   └── SettingsMenu
├── AnimationOverlay
│   ├── VideoPlayer (HLS)
│   └── SoundTrack
└── ARViewer (conditional)
```

### 9.2 Page Rendering Pipeline

```typescript
// src/web/features/reader/PageRenderer.ts

interface RenderContext {
  pageData: MvxA Page;
  scale: number;
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  viewportSize: { width: number; height: number };
  cameraState?: CameraState;
}

function renderPage(ctx: RenderContext): Promise<ImageBitmap> {
  const canvas = createCanvas(ctx.viewportSize.width, ctx.viewportSize.height);
  const ctx2d = canvas.getContext('2d');

  // Apply camera transform for panning
  if (ctx.cameraState) {
    ctx2d.translate(ctx.cameraState.position.x, ctx.cameraState.position.y);
    ctx2d.scale(ctx.cameraState.zoom, ctx.cameraState.zoom);
  }

  // Render panels in reading order
  for (const panel of ctx.pageData.panels) {
    const panelImage = await loadImage(panel.backgroundImageId);
    ctx2d.drawImage(panelImage, panel.position.x, panel.position.y);

    // Render dialogue bubbles
    if (panel.dialogue) {
      renderDialogueBubble(ctx2d, panel.dialogue);
    }
  }

  return canvas.createImageBitmap();
}
```

### 9.3 Camera Pan for Static Manga Reading

#### 9.3.1 Camera State for Static Pages

```typescript
interface StaticCameraState {
  position: { x: number; y: number }; // 2D position for static pages
  zoom: number; // 0.1-5.0
  panEnabled: boolean;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Default camera position for a manga page
function getDefaultCameraPosition(page: MangaPage): StaticCameraState {
  const bounds = calculatePageBounds(page);
  const scale = 1;

  return {
    position: { x: 0, y: 0 },
    zoom: scale,
    panEnabled: true,
    minX: bounds.left * scale,
    maxX: bounds.right * scale,
    minY: bounds.top * scale,
    maxY: bounds.bottom * scale,
  };
}

// Handle mouse drag for panning static pages
const handleStaticPan = (delta: { x: number; y: number }, camera: StaticCameraState) => {
  let newX = camera.position.x + delta.x;
  let newY = camera.position.y + delta.y;

  // Constrain to page bounds
  newX = Math.max(camera.minX, Math.min(camera.maxX, newX));
  newY = Math.max(camera.minY, Math.min(camera.maxY, newY));

  return { ...camera, position: { x: newX, y: newY } };
};
```

#### 9.3.2 Camera Controls for Reader

```typescript
// src/web/features/reader/CameraControls.tsx

interface CameraControlsProps {
  cameraState: StaticCameraState;
  onCameraChange: (camera: StaticCameraState) => void;
  pageBounds: { left: number; right: number; top: number; bottom: number };
}

export const CameraControls = ({ cameraState, onCameraChange, pageBounds }: CameraControlsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cameraState.panEnabled) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const delta = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };

    const newCamera = handleStaticPan(delta, cameraState);
    onCameraChange(newCamera);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const resetCamera = () => {
    onCameraChange(getDefaultCameraPosition(currentPage));
  };

  const fitToScreen = () => {
    const scale = calculateFitScale(pageBounds);
    onCameraChange({
      ...cameraState,
      position: { x: 0, y: 0 },
      zoom: scale,
      panEnabled: true
    });
  };

  return (
    <div
      className="absolute inset-0 cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Pan overlay */}
      {isDragging && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          Panning...
        </div>
      )}

      {/* Camera controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={resetCamera}
          className="px-2 py-1 bg-black/70 text-white rounded text-sm hover:bg-black/90"
          title="Reset View"
        >
          Reset
        </button>
        <button
          onClick={fitToScreen}
          className="px-2 py-1 bg-black/70 text-white rounded text-sm hover:bg-black/90"
          title="Fit to Screen"
        >
          Fit
        </button>
      </div>
    </div>
  );
};
```

### 9.4 Animation System

#### 9.3.1 API: POST `/api/v1/animations/generate`

```typescript
interface GenerateAnimationRequest {
  mangaId: string;
  pageIds?: string[]; // if null, generates for all pages
  duration?: number; // 3-10 seconds per page
  style?: 'subtle' | 'dramatic' | 'cinematic';
  includeSound?: boolean;
  voice?: {
    characterId?: string;
    text: string;
    voiceId?: string; // ElevenLabs voice ID
  };
  cameraPath?: CameraPathConfig; // NEW: Camera movement specification
}

interface CameraPathConfig {
  mode: 'auto' | 'manual' | 'scripted';
  keyframes?: CameraKeyframe[];
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  loop?: boolean;
  panSpeed?: number; // 0.1-2.0
}

interface CameraKeyframe {
  time: number; // 0-1 within animation
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
}

interface GenerateAnimationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;
  outputCid?: string; // IPFS CID of video
  cameraPath?: CameraPath; // Return generated camera path
}
```

#### 9.3.2 Animation Quality Tiers

| Tier     | Resolution | FPS | Duration | Quality   | Camera Pan |
| -------- | ---------- | --- | -------- | --------- | ---------- |
| preview  | 480p       | 12  | 3s       | draft     | disabled   |
| standard | 720p       | 24  | 5s       | good      | enabled    |
| premium  | 1080p      | 30  | 10s      | cinematic | full 3D    |

#### 9.3.3 Video Composition Pipeline

```
1. Extract key frames from manga pages
2. Generate intermediate frames with LTX
3. Apply motion vectors for smooth transitions
4. Add parallax depth maps
5. Mix in sound effects / voice
6. Encode with H.265 (HEVC)
7. Upload to R2, generate IPFS CID
8. Return playback URL
```

#### 9.3.4 Camera-Aware Video Generation

```python
# Extended LTX input with camera path
input_data = {
    "images": ["frame_001.png", "frame_002.png"],
    "motion": {
        "frame_1_to_2": {
            "translation": [0.5, -0.2, 0.0],
            "rotation": [0.0, 0.0, 0.1],
            "scale": [1.02, 1.02, 1.0]
        }
    },
    "camera_path": {
        "keyframes": [
            {
                "time": 0.0,
                "position": [0, 0, 10],
                "target": [0, 0, 0],
                "fov": 45
            },
            {
                "time": 0.5,
                "position": [2, 1, 12],
                "target": [1, 0.5, 0],
                "fov": 40
            }
        ],
        "loop": false,
        "easing": "ease-in-out"
    },
    "cfg_scale": 7.0,
    "steps": 25,
    "fps": 24
}
```

#### 9.3.5 Interactive Animation Playback

```typescript
// src/web/features/reader/InteractiveAnimationPlayer.tsx

interface AnimationPlaybackControls {
  play: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (time: number) => void;
  setCameraPosition: (position: Vector3) => void;
  setCameraTarget: (target: Vector3) => void;
  enablePan: (enabled: boolean) => void;
}

interface InteractiveAnimationPlayerProps {
  animationCid: string;
  mangaPage: MangaPageData;
  enableCameraPan?: boolean;
}

export const InteractiveAnimationPlayer = ({
  animationCid,
  mangaPage,
  enableCameraPan = true
}: InteractiveAnimationPlayerProps) => {
  const [cameraState, setCameraState] = useState<CameraState>(initialCameraState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // User-controlled camera pan
  const handleCameraPan = (delta: { x: number; y: number }) => {
    if (!enableCameraPan) return;

    setCameraState(prev => ({
      ...prev,
      position: {
        x: prev.position.x - delta.x * 0.01,
        y: prev.position.y + delta.y * 0.01,
        z: prev.position.z
      },
      target: {
        x: prev.target.x - delta.x * 0.01,
        y: prev.target.y + delta.y * 0.01,
        z: prev.target.z
      }
    }));
  };

  // Reset camera to default view
  const resetCamera = () => {
    setCameraState(calculateDefaultCameraPosition(mangaPage));
  };

  // Fit camera to current page
  const fitToScreen = () => {
    const bounds = calculateMangaPageBounds(mangaPage);
    const center = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: 0
    };
    const distance = Math.sqrt(
      Math.pow(bounds.max.x - bounds.min.x, 2) +
      Math.pow(bounds.max.y - bounds.min.y, 2)
    ) / (2 * Math.tan(45 * Math.PI / 360)) * 1.2;

    setCameraState(prev => ({
      ...prev,
      position: { x: center.x, y: center.y, z: center.z + distance + 5 },
      target: center,
      zoom: 1
    }));
  };

  return (
    <div className="relative w-full h-full bg-black">
      <VideoPlayer
        src={`https://ipfs.io/ipfs/${animationCid}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {enableCameraPan && (
        <CameraOverlay
          cameraState={cameraState}
          onPan={handleCameraPan}
          onReset={resetCamera}
          onFit={fitToScreen}
        />
      )}

      {/* Camera pan controls */}
      {isPlaying && enableCameraPan && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={resetCamera}
            className="px-3 py-1 bg-blue-500/70 hover:bg-blue-500 text-white rounded text-sm"
          >
            Reset View
          </button>
          <button
            onClick={fitToScreen}
            className="px-3 py-1 bg-blue-500/70 hover:bg-blue-500 text-white rounded text-sm"
          >
            Fit to Screen
          </button>
        </div>
      )}
    </div>
  );
};
```

### 9.4 Interactive Elements

#### 9.4.1 Hotspot System

```typescript
interface Hotspot {
  id: string;
  pageId: string;
  position: { x: number; y: number; width: number; height: number };
  type: 'character' | 'link' | 'info' | 'action';
  target?: string; // characterId or URL
  content?: {
    title?: string;
    description?: string;
    character?: CharacterPreview;
  };
  opacity?: number; // 0-1, for hover effect
}
```

#### 9.4.2 AR Integration (Mobile)

```typescript
// Uses AR.js + Three.js for markerless AR
interface ARConfig {
  marker: string; // QR code or image target
  modelUrl?: string; // 3D character model
  animationUrl?: string; // GLB animation
  soundUrl?: string; // Audio file
}
```

---

## 10. AI Pipeline Implementation Specification

### 10.1 ComfyUI Integration Layer

#### 10.1.1 Server Architecture

```
apps/ai/
├── src/
│   ├── server.ts           # HTTP server (Express)
│   ├── routes/
│   │   ├── generate.ts     # Image generation
│   │   ├── lora.ts         # LoRA training
│   │   └── video.ts        # Video generation
│   ├── services/
│   │   ├── comfyui.ts      # ComfyUI client
│   │   ├── ltx.ts          # LTX video model
│   │   └── tts.ts          # Text-to-speech
│   └── workers/
│       ├── generation.ts   # BullMQ worker
│       └── training.ts     # LoRA training worker
```

#### 10.1.2 ComfyUI API Client

```typescript
// src/services/comfyui.ts

export class ComfyUIClient {
  private baseUrl: string;

  async prompt(prompt: string, negativePrompt: string, config: GenerationConfig): Promise<string> {
    const workflow = this.buildWorkflow(prompt, negativePrompt, config);
    const response = await fetch(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflow,
        client_id: this.clientId,
      }),
    });

    const result = await response.json();
    return this.waitForResult(result.prompt_id);
  }

  private buildWorkflow(prompt: string, negativePrompt: string, config: GenerationConfig): any {
    return {
      '1': { class_type: 'LoadCheckpoint', inputs: { ckpt_name: config.model } },
      '2': {
        class_type: 'KSampler',
        inputs: {
          seed: config.seed,
          steps: config.steps,
          cfg: config.cfg,
          sampler_name: config.sampler,
          scheduler: 'normal',
          positive: ['2', '3'], // prompt
          negative: ['4'], // negative prompt
          latent: ['1', '5'],
        },
      },
      // ... more nodes
    };
  }
}
```

### 10.2 Prompt Engineering Framework

#### 10.2.1 Prompt Templates

```yaml
# prompts/character.yaml
templates:
  base:
    positive: '1girl, {description}, {style}, masterpiece, best quality, 8k'
    negative: 'lowres, bad anatomy, bad hands, text, watermark, blurry'

  styles:
    shonen:
      positive: 'dynamic pose, spiky hair, bright colors, energetic, action scene'
    shoujo:
      positive: 'soft features, large expressive eyes, flowing hair, romantic atmosphere'
    seinen:
      positive: 'mature themes, realistic proportions, detailed background, dark tones'
    koma_komi:
      positive: '4koma style, simple clean lines, exaggerated expressions, white background'

  constraints:
    anatomy: 'proper anatomy, correct proportions, detailed hands and feet'
    background: 'clean background, simple composition, focus on character'
    colors: 'saturated colors, cel shading, manga style coloring'
```

#### 10.2.2 Prompt Builder Service

```typescript
// src/services/promptBuilder.ts

export class PromptBuilder {
  private templates: PromptTemplates;

  buildCharacterPrompt(request: GenerateCharacterRequest): string {
    const style = this.templates.styles[request.style || 'shonen'];
    const base = this.templates.base.positive;

    return base
      .replace('{description}', request.description)
      .replace('{style}', style.positive)
      .replace('{constraints}', this.templates.constraints.anatomy);
  }
}
```

### 10.3 Sound Effects Generation

#### 10.3.1 SFX Pipeline

```
1. SFX category selection (whoosh, impact, sparkle, etc.)
2. Generate with Meta Audiobox or load from library
3. Apply effects: reverb, pitch shift, EQ
4. Export as OGG + WAV
5. Upload to R2
6. Return CID
```

#### 10.3.2 API: POST `/api/v1/sfx/generate`

```typescript
interface GenerateSfxRequest {
  category: 'whoosh' | 'impact' | 'sparkle' | 'footsteps' | 'dialogue';
  intensity?: number; // 0-1
  duration?: number; // seconds
  modifiers?: string[]; // ['reverb', 'pitch_up', 'lowpass']
}

interface GenerateSfxResponse {
  cid: string;
  duration: number;
  format: 'ogg' | 'wav';
}
```

---

## 11. Animation Engine Implementation Specification

### 11.1 LTX Video Generation Pipeline

#### 11.1.1 Input Format

```python
# Input for LTX
input_data = {
    "images": ["frame_001.png", "frame_002.png"],  # 2-8 keyframes
    "motion": {
        "frame_1_to_2": {
            "translation": [0.5, -0.2, 0.0],
            "rotation": [0.0, 0.0, 0.1],
            "scale": [1.02, 1.02, 1.0]
        }
    },
    "cfg_scale": 7.0,
    "steps": 25,
    "fps": 24
}
```

#### 11.1.2 API: POST `/api/v1/video/generate`

```typescript
interface GenerateVideoRequest {
  keyframes: Array<{
    imageId: string; // IPFS CID of source image
    duration: number; // seconds
    motion?: MotionConfig;
    effects?: EffectConfig[];
  }>;
  cfgScale?: number; // 3-15, default 7
  steps?: number; // 15-50, default 25
  fps?: number; // 12-30, default 24
  width?: number; // 512-1024
  height?: number; // 512-1024
}

interface MotionConfig {
  type: 'linear' | 'ease-in' | 'ease-out' | 'bounce';
  translation?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

interface EffectConfig {
  type: 'blur' | 'brightness' | 'contrast' | 'color' | 'zoom';
  value: number; // 0-1
  duration?: number; // relative to keyframe
}
```

### 11.2 Animation Post-Processing

#### 11.2.1 FFmpeg Pipeline

```bash
# Compose video with effects
ffmpeg -y \
  -framerate 24 \
  -i frame_%03d.png \
  -vf "fps=24,format=yuv420p" \
  -c:v libx265 \
  -crf 28 \
  -pix_fmt yuv420p \
  output.mp4

# Add sound track
ffmpeg -i output.mp4 -i audio.ogg \
  -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 \
  output_with_audio.mp4
```

### 11.3 Animation Storage & Delivery

#### 11.3.1 HLS Manifest Generation

```typescript
interface AnimationManifest {
  version: string;
  targetDuration: number;
  mediaSequences: Array<{
    bitrate: number;
    codecs: string;
    url: string;
    width: number;
    height: number;
  }>;
  masterUrl: string;
}
```

#### 11.3.2 Cache Headers

```
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/vnd.apple.mpegurl
```

### 11.4 3D Camera Pan System

#### 11.4.1 Camera Controls Architecture

```
CameraPanSystem
├── CameraController (Three.js)
│   ├── PerspectiveCamera (fov: 45, near: 0.1, far: 1000)
│   ├── OrbitControls (enabled: true, enablePan: true)
│   └── AnimationLoop (60 FPS target)
├── SceneGraph
│   ├── MangaPage (PlaneGeometry)
│   ├── CameraPosition (dynamic)
│   └── ViewFrustum (culling)
├── InputHandlers
│   ├── MouseDrag (pan)
│   ├── PinchZoom (zoom)
│   └── Wheel (zoom)
└── RenderTarget
    ├── WebGLRenderer
    └── PostProcessing (bloom, FXAA)
```

#### 11.4.2 Camera State Model

```typescript
interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  fov: number; // 30-70 degrees
  aspect: number; // width/height
  near: number; // 0.1
  far: number; // 1000
  zoom: number; // 0.1-10
  enabled: boolean;
}

interface CameraControlsConfig {
  enableDamping: boolean; // smooth camera movement
  dampingFactor: number; // 0.05
  enableZoom: boolean;
  enablePan: boolean;
  minDistance: number; // 5
  maxDistance: number; // 50
  minPolarAngle: number; // 0 degrees
  maxPolarAngle: number; // 85 degrees
  minAzimuthAngle: number; // -PI
  maxAzimuthAngle: number; // PI
}
```

#### 11.4.3 Camera Pan API

**Client-side Camera Controls:**

```typescript
// src/web/features/reader/CameraPan.tsx

interface CameraPanProps {
  sceneRef: React.RefObject<THREE.Group>;
  mangaPage: MangaPageData;
  animationMode: boolean;
}

export const CameraPanSystem = ({ sceneRef, mangaPage, animationMode }: CameraPanProps) => {
  const [cameraState, setCameraState] = useState<CameraState>({
    position: { x: 0, y: 0, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, 1, 0, z: 0 },
    fov: 45,
    aspect: 1,
    near: 0.1,
    far: 1000,
    zoom: 1,
    enabled: true
  });

  const controlsRef = useRef<OrbitControls>(null);

  // Dynamic camera reset based on content
  const resetCameraToFit = useCallback(() => {
    const bounds = calculateMangaPageBounds(mangaPage);
    const center = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: 0
    };
    const size = Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
    const distance = Math.abs(size / (2 * Math.tan((cameraState.fov * Math.PI) / 360)));

    setCameraState(prev => ({
      ...prev,
      position: { x: center.x, y: center.y, z: distance + 5 },
      target: center,
      zoom: 1
    }));
  }, [mangaPage, cameraState.fov]);

  // Animation-aware camera movement
  const startPanAnimation = (targetPosition: Vector3, duration: number = 1000) => {
    if (!animationMode) return;

    const startPos = cameraState.position;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easedT = 1 - Math.pow(1 - t, 3);

      setCameraState(prev => ({
        ...prev,
        position: {
          x: startPos.x + (targetPosition.x - startPos.x) * easedT,
          y: startPos.y + (targetPosition.y - startPos.y) * easedT,
          z: startPos.z + (targetPosition.z - startPos.z) * easedT
        }
      }));

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <group>
      <PerspectiveCamera
        ref={cameraRef}
        {...cameraState}
        onUpdate={(camera) => {
          camera.lookAt(cameraState.target.x, cameraState.target.y, cameraState.target.z);
        }}
      />
      <OrbitControls
        ref={controlsRef}
        camera={cameraRef}
        scene={sceneRef}
        {...CameraControlsConfig}
        enabled={cameraState.enabled}
        onChange={() => setCameraState(getCameraState())}
      />
    </group>
  );
};
```

#### 11.4.4 Animation-Guided Camera Movement

```typescript
// Camera path generation for animations
interface CameraKeyframe {
  time: number; // 0-1 within animation
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  transitionCurve: 'linear' | 'ease-in' | 'ease-out' | 'bezier';
}

interface CameraPath {
  keyframes: CameraKeyframe[];
  loop: boolean;
  pingPong: boolean;
}

// Generate camera path from animation metadata
function generateCameraPath(animationData: AnimationData): CameraPath {
  const keyframes: CameraKeyframe[] = [];

  // Create dynamic camera movements based on scene content
  const panels = animationData.panels || [];

  panels.forEach((panel, index) => {
    const time = (index / panels.length) * 0.8 + 0.1; // Leave 10% for transitions

    keyframes.push({
      time,
      position: calculateOptimalCameraPosition(panel),
      target: panel.center,
      fov: 45,
      transitionCurve: index === 0 ? 'ease-out' : 'ease-in-out',
    });
  });

  // Add return to start keyframe
  keyframes.push({
    time: 1,
    position: keyframes[0].position,
    target: keyframes[0].target,
    fov: keyframes[0].fov,
    transitionCurve: 'ease-out',
  });

  return {
    keyframes,
    loop: animationData.loop || false,
    pingPong: animationData.pingPong || false,
  };
}

// Calculate optimal camera position for a panel
function calculateOptimalCameraPosition(panel: PanelData): { x: number; y: number; z: number } {
  const panelWidth = panel.bounds.width;
  const panelHeight = panel.bounds.height;
  const aspectRatio = panelWidth / panelHeight;

  // Position camera to fit panel with slight margin
  const margin = 1.1;
  const distance =
    (Math.sqrt(panelWidth ** 2 + panelHeight ** 2) / (2 * Math.tan((45 * Math.PI) / 360))) * margin;

  // Default position: camera looking at center from front
  return {
    x: panel.center.x,
    y: panel.center.y,
    z: panel.center.z + distance + 5,
  };
}
```

#### 11.4.5 User Camera Controls

```typescript
// Mouse and touch controls for camera pan
interface CameraControlsEvents {
  onPanStart: (e: MouseEvent | TouchEvent) => void;
  onPan: (delta: { x: number; y: number }) => void;
  onPanEnd: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
}

// Camera control hooks
export const useCameraPan = (onEvents: CameraControlsEvents) => {
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const handlePanStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      setStartPos({ x: clientX, y: clientY });
      setCurrentPos({ x: clientX, y: clientY });
      setIsPanning(true);

      onEvents.onPanStart(e);
    },
    [onEvents]
  );

  const handlePan = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isPanning || !startPos) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startPos.x;
      const deltaY = clientY - startPos.y;

      setCurrentPos({ x: clientX, y: clientY });
      onEvents.onPan({ x: deltaX, y: deltaY });
    },
    [isPanning, startPos, onEvents]
  );

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    setStartPos(null);
    setCurrentPos(null);
    onEvents.onPanEnd();
  }, [onEvents]);

  // Keyboard shortcuts for camera control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'r':
        case 'R':
          e.preventDefault();
          onEvents.onReset();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onEvents.onFitToScreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEvents]);

  return {
    isPanning,
    startPan: handlePanStart,
    pan: handlePan,
    endPan: handlePanEnd,
  };
};
```

#### 11.4.6 Animation Integration with Camera Pan

```typescript
// Integration with animation playback
interface AnimationPlayerProps {
  animationUrl: string;
  enableCameraPan: boolean;
  cameraControls: CameraPanSystem;
}

export const AnimationPlayer = ({ animationUrl, enableCameraPan, cameraControls }: AnimationPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Sync camera movement with animation
  useEffect(() => {
    if (!videoRef.current || !enableCameraPan) return;

    const syncCamera = () => {
      const progress = videoRef.current!.currentTime / videoRef.current!.duration;

      // Update camera based on animation progress
      cameraControls.updateFromAnimationProgress(progress);
    };

    videoRef.current.addEventListener('timeupdate', syncCamera);
    return () => videoRef.current?.removeEventListener('timeupdate', syncCamera);
  }, [enableCameraPan, cameraControls]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={animationUrl}
        controls
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain"
      />

      {enableCameraPan && (
        <CameraPanOverlay
          videoRef={videoRef}
          cameraControls={cameraControls}
        />
      )}

      {/* Pan controls overlay */}
      {isPlaying && enableCameraPan && (
        <div className="absolute bottom-4 right-4 bg-black/50 rounded p-2">
          <button
            onClick={() => cameraControls.reset()}
            className="text-white px-2 py-1 text-sm hover:bg-white/20 rounded"
          >
            Reset View
          </button>
          <button
            onClick={() => cameraControls.fitToScreen()}
            className="text-white px-2 py-1 text-sm hover:bg-white/20 rounded ml-2"
          >
            Fit to Screen
          </button>
        </div>
      )}
    </div>
  );
};
```

#### 11.4.7 Camera Pan API Extension

**Extended Animation Generation API:**

```typescript
interface GenerateAnimationWithCameraRequest {
  mangaId: string;
  pageIds?: string[];
  duration?: number;
  style?: 'subtle' | 'dramatic' | 'cinematic';
  includeSound?: boolean;
  cameraPath?: CameraPathConfig; // NEW: Camera movement specification
}

interface CameraPathConfig {
  mode: 'auto' | 'manual' | 'scripted';
  keyframes?: CameraKeyframe[];
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  loop?: boolean;
  panSpeed?: number; // 0.1-2.0
}

interface GenerateAnimationWithCameraResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;
  outputCid?: string;
  cameraPath?: CameraPath; // Return generated camera path
}
```

#### 11.4.8 Performance Considerations

```typescript
// Camera performance optimization
interface CameraPerformanceConfig {
  maxFps: number; // 30-60, dynamic based on device
  renderQuality: 'high' | 'medium' | 'low';
  enableFrustumCulling: boolean;
  enableInstancing: boolean;
  textureResolution: 'original' | 'half' | 'quarter';
}

// Dynamic quality adjustment
function getCameraPerformanceConfig(): CameraPerformanceConfig {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  if (isMobile || deviceMemory < 4 || hardwareConcurrency < 4) {
    return {
      maxFps: 30,
      renderQuality: 'low',
      enableFrustumCulling: true,
      enableInstancing: true,
      textureResolution: 'half',
    };
  }

  return {
    maxFps: 60,
    renderQuality: 'high',
    enableFrustumCulling: true,
    enableInstancing: true,
    textureResolution: 'original',
  };
}
```

---

## 12. Blockchain Implementation Specification

### 12.1 Smart Contract Architecture

```
contracts/
├── MangaNFT.sol              # ERC-721 for manga NFTs
├── MangaToken.sol            # ERC-20 $MANGA token
├── RoyaltyRegistry.sol       # ERC-2981 royalty standard
├── Marketplace.sol           # Buy/sell marketplace
└── Governance.sol            # DAO voting contracts
```

### 12.2 MangaNFT Contract

#### 12.2.1 Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MangaNFT is ERC721URIStorage, ERC2981 {
    struct MangaData {
        string title;
        string author;
        uint256 chapterCount;
        string metadataCID;      // IPFS CID
        uint256 createdAt;
        bool isAnimated;
    }

    mapping(uint256 => MangaData) public mangas;
    mapping(address => uint256) public royalties;

    event MangaMinted(address indexed to, uint256 indexed tokenId, string metadataURI);
    event RoyaltySet(address indexed creator, uint96 royaltyBps);

    function mint(
        address to,
        string memory metadataURI,
        string memory title,
        string memory author
    ) external returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(to, msg.sender, block.timestamp)));
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _setDefaultRoyalty(to, 500); // 5% royalty

        mangas[tokenId] = MangaData({
            title: title,
            author: author,
            chapterCount: 0,
            metadataCID: metadataURI,
            createdAt: block.timestamp,
            isAnimated: false
        });

        emit MangaMinted(to, tokenId, metadataURI);
        return tokenId;
    }
}
```

#### 12.2.2 Metadata Schema (ERC-721)

```json
{
  "name": "Manga Title - Chapter 1",
  "description": "Manga description by author",
  "image": "ipfs://Qm.../cover.png",
  "external_url": "https://mangaverse.xyz/manga/123",
  "attributes": [
    { "trait_type": "Style", "value": "Shonen" },
    { "trait_type": "Genre", "value": "Adventure" },
    { "trait_type": "Chapters", "value": 12 },
    { "trait_type": "Created", "value": "2026-01-15" }
  ],
  "properties": {
    "files": [
      {
        "uri": "ipfs://Qm.../manga.mvx",
        "type": "application/x-mvx"
      }
    ],
    "category": "manga",
    "creators": [
      {
        "address": "0x...",
        "share": 10000
      }
    ]
  }
}
```

### 12.3 $MANGA Token Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MangaToken is ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public totalStaked = 0;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public lastClaimed;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    function stake(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        stakes[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function claimRewards() external {
        uint256 elapsed = block.timestamp - lastClaimed[msg.sender];
        uint256 reward = (stakes[msg.sender] * elapsed * 10) / 1e18; // 10 wei per second per token
        _mint(msg.sender, reward);
        lastClaimed[msg.sender] = block.timestamp;
        emit RewardsClaimed(msg.sender, reward);
    }
}
```

### 12.4 API Integration: POST `/api/v1/nft/mint`

```typescript
interface MintRequest {
  mangaId: string;
  title: string;
  author: string;
  metadataCID: string; // IPFS CID of metadata JSON
  price?: string; // in $MANGA tokens, default 100
}

interface MintResponse {
  transactionHash: string;
  tokenId: string;
  explorerUrl: string; // Polygon scan URL
}
```

---

## 13. File Upload & Storage Pipeline

### 13.1 Upload Endpoint: POST `/api/v1/assets/upload`

```typescript
interface UploadRequest {
  file: File; // multipart/form-data
  category: 'cover' | 'character' | 'background' | 'animation' | 'page';
  metadata?: {
    title?: string;
    tags?: string[];
    contentType?: 'image/png' | 'image/jpeg' | 'video/mp4';
  };
  encrypt?: boolean; // encrypt before upload
}

interface UploadResponse {
  cid: string; // IPFS Content Identifier
  url: string; // gateway URL
  size: number; // bytes
  checksum: string; // SHA-256
}
```

### 13.2 Resumable Upload Protocol

```typescript
// Client-side chunking
const CHUNK_SIZE = 1024 * 1024; // 1MB

async function uploadLargeFile(file: File): Promise<string> {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  let cid = '';

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const response = await fetch('/api/v1/assets/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: createFormData({ file: chunk, chunk: i, total: chunks }),
    });

    const result = await response.json();
    if (i === 0) cid = result.cid;
  }

  return cid;
}
```

---

## 14. Error Handling & Monitoring

### 14.1 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ],
    "timestamp": "2026-07-18T14:30:00Z",
    "traceId": "abc123"
  }
}
```

### 14.2 Sentry Configuration

```typescript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: expressApp }),
  ],
});
```

---

## 15. Dynamics & Dynamism Systems

### 15.1 Dynamic State Management Architecture

#### 15.1.1 Zustand Store Architecture

```typescript
// src/web/stores/readerStore.ts
interface ReaderState extends ReaderActions {
  // Dynamic state
  currentPage: number;
  zoom: number;
  rotation: number;
  pan: { x: number; y: number };
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  animationMode: 'off' | 'auto' | 'manual';
  currentPageData: MangaPage | null;
  panelsInView: string[];

  // Dynamic preferences (live-adjustable)
  brightness: number;
  contrast: number;
  saturation: number;
  showUI: boolean;
  soundEnabled: boolean;

  // Performance dynamics
  isLowPower: boolean;
  prefersReducedMotion: boolean;
  connectionStatus: 'online' | 'offline' | 'slow';
}

// Dynamic selectors with memoization
export const usePanels = createSelector(
  (state: ReaderState) => state.currentPageData?.panels || [],
  (panels) => panels.filter((p) => p.visible)
);

// Dynamic subscriptions for real-time updates
export const useRealTimeStats = (mangaId: string) => {
  const [stats, setStats] = useState<MangaStats | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.mangaverse.xyz/stats/${mangaId}`);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStats((prev) => ({ ...prev, ...update }));
    };
    return () => ws.close();
  }, [mangaId]);

  return stats;
};
```

#### 15.1.2 Dynamic UI Transitions

```typescript
// src/web/components/AnimatedPanel.tsx
import { motion, useAnimation } from 'framer-motion';

const AnimatedPanel = ({ panel, isActive }: {
  panel: MangaPanel;
  isActive: boolean;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 rgba(0,0,0,0)',
          '0 0 20px rgba(108, 92, 231, 0.5)',
          '0 0 0 rgba(0,0,0,0)'
        ],
        transition: { duration: 0.5, ease: 'easeInOut' }
      });
    }
  }, [isActive, controls]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: panel.position.x,
        top: panel.position.y,
        width: panel.position.width,
        height: panel.position.height
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
    />
  );
};
```

### 15.2 Dynamic Data Flow Patterns

#### 15.2.1 Real-Time Collaboration

```typescript
// src/services/collaboration.ts
export class CollaborationService {
  private socket: Socket;
  private subscribers: Map<string, Set<Function>> = new Map();

  // Dynamic presence system
  subscribeToPresence(documentId: string, callback: (presence: Presence) => void) {
    if (!this.subscribers.has(documentId)) {
      this.subscribers.set(documentId, new Set());
    }
    this.subscribers.get(documentId)!.add(callback);

    this.socket.emit('join', { documentId, userId: this.currentUserId });
  }

  // Dynamic cursor positions
  onCursorMove(documentId: string, callback: (cursors: Cursor[]) => void) {
    this.socket.on(`cursor:${documentId}`, callback);
  }

  // Dynamic conflict resolution
  resolveConflict(localChange: Change, remoteChange: Change): Change {
    // Last-write-wins with vector clocks
    if (localChange.timestamp > remoteChange.timestamp) return localChange;
    if (remoteChange.timestamp > localChange.timestamp) return remoteChange;

    // Concurrent changes - merge
    return this.mergeChanges(localChange, remoteChange);
  }
}
```

#### 15.2.2 Dynamic Pagination & Infinite Scroll

```typescript
// src/web/hooks/useMangaList.ts
export const useMangaList = () => {
  const [items, setItems] = useState<MangaSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Dynamic load more based on scroll position
  const loadMore = useCallback(() => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);
    fetchMangaPage(page)
      .then((newItems) => {
        setItems((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
        setHasMore(newItems.length > 0);
      })
      .finally(() => setIsFetching(false));
  }, [page, isFetching, hasMore]);

  // Dynamic intersection observer
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return { items, loadMore, isFetching, hasMore, sentinelRef };
};
```

### 15.3 Dynamic Performance Adaptation

#### 15.3.1 Adaptive Quality Scaling

```typescript
// src/services/performance.ts
export class PerformanceManager {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memory: 0,
    cpu: 0,
    network: 'online',
  };

  private qualityLevel: QualityLevel = 'high';

  // Dynamic quality adjustment based on metrics
  updateQualityLevel(): QualityLevel {
    const { fps, memory, cpu } = this.metrics;

    if (fps < 30 || memory > 80 || cpu > 80) {
      this.qualityLevel = 'low';
    } else if (fps < 50 || memory > 60 || cpu > 60) {
      this.qualityLevel = 'medium';
    } else {
      this.qualityLevel = 'high';
    }

    this.broadcastQualityChange();
    return this.qualityLevel;
  }

  // Dynamic rendering based on device capabilities
  getRenderConfig(): RenderConfig {
    const isMobile = this.isMobileDevice();
    const prefersReducedMotion = this.prefersReducedMotion();

    return {
      maxParticles: isMobile ? 100 : 500,
      animationDuration: prefersReducedMotion ? 0 : 0.5,
      textureResolution: this.qualityLevel === 'high' ? 1024 : 512,
      enableShadows: this.qualityLevel !== 'low',
      enablePostProcessing: this.qualityLevel === 'high',
    };
  }
}
```

#### 15.3.2 Dynamic Resource Loading

```typescript
// src/services/resourceLoader.ts
export class DynamicResourceLoader {
  private cache: Map<string, any> = new Map();
  private loadingQueue: string[] = [];
  private maxConcurrent = 4;
  private currentLoading = 0;

  // Dynamic priority loading
  async load<T>(
    key: string,
    loader: () => Promise<T>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return new Promise((resolve, reject) => {
      const item = { key, loader, priority, resolve, reject };

      if (priority === 'high') {
        this.loadImmediately(item);
      } else {
        this.addToQueue(item);
      }
    });
  }

  private loadImmediately(item: any) {
    item
      .loader()
      .then((result) => {
        this.cache.set(item.key, result);
        item.resolve(result);
      })
      .catch(item.reject);
  }
}
```

### 15.4 Dynamic User Interaction Patterns

#### 15.4.1 Gesture-Based Navigation

```typescript
// src/web/hooks/useGestures.ts
export const useGestures = (onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;

    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        onSwipe(deltaY > 0 ? 'up' : 'down');
      }
    }
  };

  return { handleTouchStart, handleTouchEnd };
};
```

#### 15.4.2 Dynamic Theme & Appearance

```typescript
// src/web/services/themeManager.ts
export class ThemeManager {
  private observers: Set<(theme: ThemeConfig) => void> = new Set();

  private theme: ThemeConfig = {
    colors: lightColors,
    fonts: defaultFonts,
    animations: defaultAnimations,
    effects: defaultEffects,
  };

  // Dynamic theme switching with smooth transitions
  updateTheme(partial: Partial<ThemeConfig>) {
    this.theme = { ...this.theme, ...partial };
    this.notifyObservers();

    // Apply CSS variables for smooth transition
    this.applyCSSVariables(this.theme.colors);
  }

  // Dynamic preference detection
  detectPreferences() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: high)').matches;

    this.updateTheme({
      colors: prefersDark ? darkColors : lightColors,
      animations: prefersReducedMotion ? disabledAnimations : defaultAnimations,
      effects: prefersContrast ? highContrastEffects : defaultEffects,
    });
  }

  subscribe(callback: (theme: ThemeConfig) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach((observer) => observer(this.theme));
  }
}
```

### 15.5 Dynamic API Interactions

#### 15.5.1 Optimistic UI Updates

```typescript
// src/services/apiClient.ts
export class OptimisticApiClient {
  private pendingChanges: Map<string, PendingChange> = new Map();

  async updateManga(mangaId: string, updates: Partial<Manga>): Promise<Manga> {
    const previousManga = await this.getManga(mangaId);

    // Optimistically update local state
    this.updateLocalCache(mangaId, updates);

    try {
      // Send to server
      const updatedManga = await this.patch(`/api/v1/manga/${mangaId}`, updates);

      // Clear pending change
      this.pendingChanges.delete(mangaId);

      return updatedManga;
    } catch (error) {
      // Rollback on failure
      this.updateLocalCache(mangaId, previousManga);
      this.pendingChanges.delete(mangaId);

      throw error;
    }
  }

  // Dynamic retry with exponential backoff
  async requestWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (i < maxRetries) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}
```

### 15.6 Dynamic Configuration Management

#### 15.6.1 Feature Flags System

```typescript
// src/services/featureFlags.ts
export class FeatureFlagService {
  private flags: Map<string, boolean> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  // Dynamic flag evaluation based on user context
  evaluateFlag(flag: string, context: UserContext): boolean {
    const defaultValue = this.flags.get(flag) ?? false;

    // Dynamic rule evaluation
    const rules = this.getFlagRules(flag);
    for (const rule of rules) {
      if (rule.matches(context)) {
        return rule.outcome;
      }
    }

    return defaultValue;
  }

  // Dynamic flag updates from server
  async refreshFlags() {
    const response = await fetch('/api/v1/feature-flags');
    const flags = await response.json();

    const oldFlags = new Map(this.flags);
    this.flags.clear();

    for (const [key, value] of Object.entries(flags)) {
      this.flags.set(key, value as boolean);

      // Notify listeners of changes
      if (oldFlags.get(key) !== value) {
        this.notifyListeners(key, value);
      }
    }
  }

  subscribe(flag: string, callback: (value: boolean) => void) {
    if (!this.listeners.has(flag)) {
      this.listeners.set(flag, new Set());
    }
    this.listeners.get(flag)!.add(callback);

    return () => this.listeners.get(flag)!.delete(callback);
  }
}
```

### 15.7 Dynamic Analytics & Telemetry

#### 15.7.1 Adaptive Event Tracking

```typescript
// src/services/analytics.ts
export class AnalyticsService {
  private sessionStart: number;
  private events: AnalyticsEvent[] = [];

  // Dynamic event sampling based on user behavior
  track(event: string, data: Record<string, any>) {
    const shouldTrack = this.shouldSampleEvent(event, data);

    if (!shouldTrack) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStart,
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };

    this.events.push(analyticsEvent);

    // Dynamic batching for network efficiency
    if (this.events.length >= 20) {
      this.flush();
    }
  }

  // Dynamic conversion funnel tracking
  trackFunnel(step: FunnelStep, data: Record<string, any>) {
    this.track('funnel', {
      ...data,
      step,
      timestamp: Date.now(),
    });
  }

  private shouldSampleEvent(event: string, data: any): boolean {
    // Dynamic sampling rules
    const rules: SamplingRule[] = [
      { event: 'page_view', sampleRate: 1.0 },
      { event: 'click', sampleRate: 0.1 },
      { event: 'animation_generate', sampleRate: 1.0 },
      { event: 'error', sampleRate: 1.0 },
    ];

    const rule = rules.find((r) => r.event === event);
    return rule ? Math.random() < rule.sampleRate : true;
  }
}
```

---

## 16. Subscriptions, Billing & RevenueCat Integration

> Full low-level detail (dashboard config, SDK install, paywall presentation, web billing, webhooks, AI toolkit) is in [`MangaVerse_Mobile_RevenueCat_Spec.md`](./MangaVerse_Mobile_RevenueCat_Spec.md). This section summarizes the in-app contract and data model.

### 16.1 Subscription Data Model (client cache)

```typescript
// src/entities/subscription.ts
export interface EntitlementState {
  pro: boolean;
  studio: boolean;
  willRenew: boolean;
  periodType: 'trial' | 'promo' | 'intro' | 'normal' | null;
  expiresAt: Date | null;
  isSandbox: boolean;
  store: 'app_store' | 'play_store' | 'amazon' | 'stripe' | 'promotional' | null;
  managementUrl: string | null;
}

export interface SubscriptionSync {
  tier: 'free' | 'pro' | 'studio';
  expiresAt: Date | null;
  credits: { aiGenerations: number; animations: number };
  source: 'revenuecat_sdk' | 'revenuecat_webhook' | 'backend';
  lastSyncedAt: Date;
}
```

### 16.2 Entitlement Gating Middleware (API)

```typescript
// src/api/middleware/requireEntitlement.ts
export function requireEntitlement(entitlement: 'pro' | 'studio') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    // Server-side re-validation via RevenueCat REST (do not trust client)
    const rc = await revenueCatRest.getSubscriber(userId);
    const active = rc.subscriber.entitlements[entitlement]?.expires_date_ms;
    if (!active || active < Date.now()) {
      return res.status(403).json({ error: { code: 'ENTITLEMENT_REQUIRED', entitlement } });
    }
    next();
  };
}
```

### 16.3 Mobile/Desktop Client Architecture

```
apps/mobile/  (Expo / React Native)
├── App.tsx                # Purchases.configure() at launch
├── src/
│   ├── purchases/
│   │   ├── init.ts        # configure per Platform.OS
│   │   ├── identify.ts    # logIn/logOut with MangaVerse user.id
│   │   ├── paywall.ts     # presentPaywall / presentPaywallIfNeeded
│   │   └── entitlements.ts# getCustomerInfo + update listener
│   ├── screens/
│   │   ├── Reader/        # reuses web reader + camera pan
│   │   ├── Studio/
│   │   └── Paywall/       # <RevenueCatUI.Paywall>
│   └── stores/            # Zustand mirrors web
├── eas.json               # build profiles (dev, preview, prod, ios-simulator)
└── metro.config.js
```

Shared code: reader, camera-pan, studio logic live in a `packages/shared` imported by both `apps/web` and `apps/mobile`.

### 16.4 RevenueCat ↔ Backend Credit Flow

```
Purchase (App Store/Google/Stripe)
   → RevenueCat validates
   → RevenueCat webhook → apps/api /webhooks/revenuecat
        → verify signature
        → if subscription: update users.subscription.tier
        → if consumable (ai_credits_100 / animation_pack_10): increment credits
        → emit analytics event
```

---

## 17. Testing Strategy

### 17.1 Unit Test Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       ├── flow/
│       └── performance/
```

### 17.2 Test Coverage Requirements

| Module                 | Coverage Target   |
| ---------------------- | ----------------- |
| Services               | 85%               |
| Utils                  | 90%               |
| Validators             | 100%              |
| API Routes             | 80%               |
| Database               | 70% (integration) |
| Purchases/Entitlements | 80%               |

---

_Document Version: 1.0_  
_Last Updated: July 18, 2026_
