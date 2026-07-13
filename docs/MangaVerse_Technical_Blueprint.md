# MANGAVERSE — Technical Blueprint & Architecture

## Version 1.0 | April 17, 2026

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │   Web App        │  │   Desktop App    │  │   Mobile App             │ │
│  │   (React/Vue)    │  │   (Tauri/Electron)│  │   (React Native)         │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
│            ┌─────────────────┐  ┌─────────────────┐                        │
│            │   REST API      │  │   WebSocket     │                        │
│            │   (Express)     │  │   (Socket.io)   │                        │
│            └─────────────────┘  └─────────────────┘                        │
│            ┌─────────────────┐  ┌─────────────────┐                        │
│            │   GraphQL       │  │   gRPC          │                        │
│            │   (Apollo)      │  │   (Internal)   │                        │
│            └─────────────────┘  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE SERVICES LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │   Auth Service   │  │  User Service    │  │   Manga Service         │    │
│  │   (JWT/OAuth)    │  │  (Profiles/     │  │   (CRUD, Versioning)    │    │
│  │                  │  │   Preferences)  │  │                          │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Character       │  │  Animation       │  │   Notification           │    │
│  │  Service         │  │  Service         │  │   Service               │    │
│  │  (Library)       │  │  (Video Gen)     │  │   (WebPush/Email)       │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI SERVICES LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  ComfyUI         │  │  LTX Video        │  │   TTS/SS Service         │    │
│  │  Manager         │  │  Generator       │  │   (Voice/Sound FX)       │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Character       │  │  Scene           │  │   Image                  │    │
│  │  Consistency     │  │  Generation      │  │   Enhancement            │    │
│  │  Engine (LoRA)  │  │                  │  │                          │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  NFT Minting      │  │  Token           │  │   Smart Contract         │    │
│  │  Service          │  │  ($MANGA)        │  │   Engine                 │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  IPFS Storage    │  │  Wallet          │  │   Oracle                 │    │
│  │  Integration     │  │  Connect         │  │   (Chainlink)            │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  PostgreSQL      │  │  Redis          │  │   S3/CloudFlare R2       │    │
│  │  (Primary DB)    │  │  (Cache/Queue)  │  │   (Assets/Media)         │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  MongoDB         │  │  Neo4j           │  │   Meilisearch            │    │
│  │  (Metadata)      │  │  (Relationships) │  │   (Full-text Search)     │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. TECHNOLOGY STACK

### 2.1 Frontend Stack

#### Web Application
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.x | UI Library |
| Build Tool | Vite | 5.x | Fast builds, HMR |
| State Management | Zustand | 4.x | Lightweight state |
| Styling | TailwindCSS | 3.x | Utility-first CSS |
| Animation | Framer Motion | 11.x | UI animations |
| 3D Elements | Three.js | 0.165+ | WebGL rendering |
| Canvas | Fabric.js | 6.x | Manga editing canvas |
| PDF/Page Render | PDF.js | 4.x | Manga page rendering |
| Icons | Heroicons/Lucide | Latest | SVG icon set |

#### Desktop Application
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Tauri | 2.x | Native web app wrapper |
| Fallback | Electron | 28.x | Cross-platform desktop |
| Native Features | Rust | 1.75+ | High-performance modules |

#### Mobile Application
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React Native | 0.75+ | Cross-platform mobile |
| Native Modules | Kotlin/Swift | Latest | Platform-specific features |

### 2.2 Backend Stack

#### API Layer
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 20.x LTS | JavaScript runtime |
| Framework | Express.js | 4.x | REST API framework |
| GraphQL | Apollo Server | 4.x | GraphQL API |
| WebSocket | Socket.io | 4.x | Real-time updates |
| Validation | Zod | 3.x | Runtime type checking |
| Rate Limiting | Upstash Redis | Latest | API rate limiting |

#### AI Integration
| Component | Technology | Purpose |
|-----------|------------|---------|
| Image Generation | ComfyUI + SDXL | Character/scene generation |
| Video Generation | LTX Video Model | Page animations |
| Text-to-Speech | ElevenLabs / Coqui | Sound effects, dialogue |
| Image Processing | Sharp + Pillow | Image manipulation |
| LoRA Training | Dreambooth / LoRA | Character consistency |

### 2.3 Blockchain Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Layer 1 | Polygon zkEVM | Low-gas, EVM-compatible |
| Layer 2 | Arbitrum Orbit | Alternative L2 option |
| Wallet | RainbowKit / wagmi | Web3 wallet connection |
| NFT Standard | ERC-721 + ERC-1155 | Digital ownership |
| Token | ERC-20 ($MANGA) | Utility token |
| Marketplace | Seaport Protocol | NFT trading |
| Oracles | Chainlink | Off-chain data |
| Storage | IPFS + Filecoin | Decentralized storage |
| DID | ENS + Lens Protocol | Decentralized identity |

### 2.4 Database & Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | PostgreSQL 16 | User data, manga metadata |
| Document DB | MongoDB 7 | Flexible schema, logs |
| Cache | Redis 7 | Session, queue, cache |
| Graph DB | Neo4j | Character relationships |
| Search | Meilisearch | Full-text search |
| Object Storage | CloudFlare R2 | Media, manga files |
| CDN | CloudFlare | Global asset delivery |
| Backup | pgBackRest | Database backups |

### 2.5 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Container | Docker | Application containers |
| Orchestration | Kubernetes | Container management |
| Cloud Provider | AWS + CloudFlare | Compute + Edge |
| GPU Compute | RunPod / Vast.ai | AI model inference |
| CI/CD | GitHub Actions | Automated pipelines |
| Monitoring | Prometheus + Grafana | System metrics |
| Logging | Loki + Grafana | Log aggregation |
| Error Tracking | Sentry | Error monitoring |
| APM | New Relic | Application performance |

---

## 3. CUSTOM .MVX FILE FORMAT

### 3.1 Format Structure

```yaml
# .MVX File Format Specification v1.0
# Magic Header: MVX1.0
# Container: ZIP-based with custom extension

MVX_Container:
  manifest.json:        # Metadata and structure
  pages/:              # Page data (PNG/JPEG/WebP)
    page_001.mvxp:     # Custom page format
    page_002.mvxp:
  layers/:             # Editable layer data
    characters/
    backgrounds/
    effects/
  animations/:         # Animation keyframes
  audio/:              # Sound effects, music
  ai_metadata/:        # AI generation data
    character_loras/   # Trained LoRA weights
    prompts.json      # Original generation prompts
  manifest.json:       # Final manifest
  signature.json:      # Blockchain signature
```

### 3.2 Page Format (.MVXP)

```json
{
  "page_id": "uuid-v4",
  "canvas": {
    "width": 1920,
    "height": 2700,
    "dpi": 300
  },
  "panels": [
    {
      "id": "panel-1",
      "bounds": {"x": 0, "y": 0, "width": 900, "height": 800},
      "layers": ["layer-id-1", "layer-id-2"],
      "effects": ["speed-lines"],
      "animation_data": {
        "type": "fight_sequence",
        "duration_ms": 5000,
        "sound_effect": "punch.mp3"
      }
    }
  ],
  "text_boxes": [
    {
      "id": "text-bubble-1",
      "content": "オリジナル",
      "font": "manga_font.ttf",
      "position": {"x": 100, "y": 200},
      "style": "shout"
    }
  ]
}
```

### 3.3 DRM & Watermarking

```javascript
// Watermark Strategy
{
  "watermark": {
    "visible": {
      "type": "semi-transparent",
      "position": "diagonal-tile",
      "opacity": 0.15,
      "content": "${reader_username} | ${timestamp}"
    },
    "invisible": {
      "type": "steganography",
      "pattern": "perceptual-hash",
      "data": {
        "owner_id": "wallet-address",
        "content_id": "nft-token-id",
        "copy_number": "unique-instance-id"
      }
    },
    "forensic": {
      "type": "fingerprint",
      "fragments": ["reader-hash", "time-hash", "device-hash"]
    }
  }
}
```

---

## 4. AI INTEGRATION ARCHITECTURE

### 4.1 ComfyUI Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMFYUI WORKFLOW ENGINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Text Prompt] ──┐                                               │
│                  ▼                                               │
│  ┌───────────────────────┐                                       │
│  │   CLIP Text Encoder   │                                       │
│  │   (t5_base)          │                                       │
│  └───────────────────────┘                                       │
│                  │                                               │
│                  ▼                                               │
│  ┌───────────────────────┐                                       │
│  │   Character LoRA     │◄──── [Pre-trained LoRA]              │
│  │   Loader             │                                       │
│  └───────────────────────┘                                       │
│                  │                                               │
│                  ▼                                               │
│  ┌───────────────────────┐    ┌───────────────────────┐│
│  │   SDXL Base Model    │────►│   VAE Decode         │         │
│  │   (realisticVision)  │     │                      │         │
│  └───────────────────────┘     └───────────────────────┘         │
│                  │                       │                        │
│                  │                       ▼                        │
│                  │              ┌───────────────────────┐         │
│                  │              │   Output Image       │         │
│                  │              │   (PNG, 1024x1024)   │         │
│                  └──────────────┴───────────────────────┘         │
│                                                                  │
│  CHARACTER PROMPT TEMPLATE:                                       │
│  """                                                              │
│  masterpiece, best quality, highres, 8k,                         │
│  [CHARACTER_NAME], manga style,                                  │
│  [EXPRESSION], [POSE], [CLOTHING],                              │
│  white background, studio lighting                               │
│  negative: low quality, watermark, text, blurry                   │
│  """                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 LTX Video Model Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     LTX VIDEO GENERATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Source Image] ──┐                                              │
│                   │                                              │
│  [Prompt] ────────┼──┐                                           │
│                   │  │                                           │
│                   ▼  ▼                                           │
│  ┌─────────────────────────────────────┐                         │
│  │         LTX-Video Model             │                         │
│  │         (latent diffusion)          │                         │
│  │                                     │                         │
│  │  Input:                              │                         │
│  │  - Image: 512x768                   │                         │
│  │  - Duration: 3-10 seconds          │                         │
│  │  - FPS: 24                          │                         │
│  │  - Prompt: "fight scene, motion"   │                         │
│  │                                     │                         │
│  │  Output:                            │                         │
│  │  - Video: MP4/WebM                  │                         │
│  │  - Resolution: 512x768              │                         │
│  │  - Codec: H.264/H.265               │                         │
│  └─────────────────────────────────────┘                         │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────┐                         │
│  │         POST-PROCESSING              │                         │
│  │                                     │                         │
│  │  - Color grading                    │                         │
│  │  - Sound effect injection           │                         │
│  │  - Manga-style frame interpolation  │                         │
│  │  - Subtitle/Text overlay           │                         │
│  └─────────────────────────────────────┘                         │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────┐                         │
│  │         FINAL OUTPUT                │                         │
│  │                                     │                         │
│  │  - HD Video (720P/1080P)            │                         │
│  │  - WebM for web                     │                         │
│  │  - MP4 for mobile                   │                         │
│  │  - Integrated audio track          │                         │
│  └─────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Character Consistency Engine

```
┌─────────────────────────────────────────────────────────────────┐
│              CHARACTER CONSISTENCY PIPELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1: Training                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│  │  Reference  │───►│  Face/Body   │───►│   LoRA      │        │
│  │  Images     │    │  Extraction  │    │   Training  │        │
│  │  (10-30)    │    │              │    │   (3-6 hrs) │        │
│  └──────────────┘    └──────────────┘    └──────────────┘        │
│         │                                      │                 │
│         │                                      ▼                 │
│         │                              ┌──────────────┐          │
│         │                              │  LoRA Model  │          │
│         │                              │  (.safetensors)        │
│         │                              └──────────────┘          │
│         │                                      │                 │
│  Phase 2: Generation                                              │
│         ││                 │
│         ▼                                      ▼                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │                                                  │          │
│  │   SDXL + LoRA + ControlNet (pose) + Refiner     │          │
│  │                                                  │          │
│  │   Prompt:                                        │          │
│  │   "1girl, [CHAR_NAME], fighting pose,          │          │
│  │    manga style, dramatic lighting"              │          │
│  │                                                  │          │
│  │   Negative: other faces, different character    │          │
│  │                                                  │          │
│  └──────────────────────────────────────────────────┘          │
│                          │                                      │
│                          ▼                                      │
│                  ┌──────────────┐                               │
│                  │   Output     │                               │
│                  │   Character  │                               │
│                  │   Consistent  │                               │
│                  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. BLOCKCHAIN SMART CONTRACTS

### 5.1 Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MANGA TOKEN ($MANGA)                   │   │
│  │                     (ERC-20)                             │   │
│  │                                                          │   │
│  │  - Total Supply: 1,000,000,000                          │   │
│  │  - Governance: GovernorBravo                             │   │
│  │  - Staking rewards mechanism                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MANGA NFT (ERC-721)                     │   │
│  │                                                          │   │
│  │  - Manga chapters/episodes as NFTs                       │   │
│  │  - Embedded royalty splitter                             │   │
│  │  - Access gated content flags                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               CHARACTER NFT (ERC-1155)                    │   │
│  │                                                          │   │
│  │  - Semi-fungible character licenses                      │   │
│  │  - Usage rights encoded in URI                           │   │
│  │  - Royalty percentage per use                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ROYALTY ENGINE                         │   │
│  │                                                          │   │
│  │  - Perpetual royalties (up to 10%)                      │   │
│  │  - Split recipients (creator, platform, collaborators)   │   │
│  │  - Auto-distribution on secondary sales                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DAO GOVERNANCE                         │   │
│  │                                                          │   │
│  │  - Proposal creation (>$MANGA threshold)                 │   │
│  │  - Time-lock execution                                   │   │
│  │  - Multi-sig admin operations                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Contract Interfaces

```solidity
// IMangaNFT.sol
interface IMangaNFT {
    struct MangaMetadata {
        string title;
        string author;
        string[] genres;
        uint256 chapterCount;
        uint256[] chapterTokenIds;
    }
    
    function mintManga(
        address to,
        string calldata uri,
        address[] calldata royaltyRecipients,
        uint256[] calldata royaltyPercentages
    ) external returns (uint256 tokenId);
    
    function registerChapter(
        uint256 mangaId,
        string calldata chapterUri,
        uint256 chapterNumber
    ) external returns (uint256 chapterTokenId);
}

// ICharacterLicense.sol
interface ICharacterLicense {
    function mintCharacterLicense(
        address to,
        uint256 characterId,
        uint256 usageRightsMask,
        uint256 mintPrice
    ) external returns (uint256 licenseId);
    
    function validateUsage(
        uint256 licenseId,
        address user,
        uint8 usageType
    ) external view returns (bool);
}

// IRoyaltySplitter.sol
interface IRoyaltySplitter {
    struct Recipient {
        address wallet;
        uint256 bps; // basis points (100 = 1%)
    }
    
    function distributeRoyalties(
        uint256 saleId,
        uint256 amount
    ) external;
}
```

---

## 6. API SPECIFICATIONS

### 6.1 REST API Endpoints

#### Authentication
```
POST   /api/v1/auth/register         - User registration
POST   /api/v1/auth/login           - User login
POST   /api/v1/auth/refresh         - Refresh JWT token
POST   /api/v1/auth/logout          - Logout (invalidate tokens)
GET    /api/v1/auth/wallet/connect  - Wallet auth challenge
POST   /api/v1/auth/wallet/verify  - Verify wallet signature
```

#### Manga Operations
```
GET    /api/v1/manga                - List manga (paginated)
GET    /api/v1/manga/:id            - Get manga details
POST   /api/v1/manga                - Create manga project
PUT    /api/v1/manga/:id            - Update manga metadata
DELETE /api/v1/manga/:id            - Delete manga
GET    /api/v1/manga/:id/pages      - Get manga pages
POST   /api/v1/manga/:id/pages      - Upload page
GET    /api/v1/manga/:id/export    - Export as .MVX
```

#### Character Library
```
GET    /api/v1/characters           - List character library
GET    /api/v1/characters/:id       - Get character details
POST   /api/v1/characters           - Create character (AI generation)
PUT    /api/v1/characters/:id       - Update character
DELETE /api/v1/characters/:id       - Delete character
POST   /api/v1/characters/:id/train - Train LoRA for character
GET    /api/v1/characters/:id/lora - Download trained LoRA
```

#### Animation Generation
```
POST   /api/v1/animate/page         - Animate single page
POST   /api/v1/animate/scene        - Animate entire scene
GET    /api/v1/animate/:jobId       - Get animation status
GET    /api/v1/animate/:jobId/result - Download animation
POST   /api/v1/animate/sound        - Generate sound effects
```

#### NFT Operations
```
POST   /api/v1/nft/mint             - Mint manga as NFT
GET    /api/v1/nft/:tokenId         - Get NFT metadata
POST   /api/v1/nft/:tokenId/sale    - List NFT for sale
POST   /api/v1/nft/:tokenId/buy     - Buy NFT
GET    /api/v1/nft/collection       - Get user's collection
```

### 6.2 WebSocket Events

```javascript
// Real-time Events
const WS_EVENTS = {
    // Animation Progress
    'animation:progress': (jobId, progress, eta) => {},
    'animation:complete': (jobId, videoUrl) => {},
    'animation:error': (jobId, error) => {},
    
    // Collaboration
    'collab:user:joined': (userId, projectId) => {},
    'collab:user:left': (userId, projectId) => {},
    'collab:change': (projectId, change) => {},
    
    // Notifications
    'notification:new': (notification) => {},
    
    // Blockchain Events
    'nft:minted': (tokenId, txHash) => {},
    'nft:sold': (tokenId, newOwner) => {}
};
```

---

## 7. SECURITY ARCHITECTURE

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network Security                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • DDoS protection (CloudFlare)                         │    │
│  │ • WAF rules for API endpoints                          │    │
│  │ • Rate limiting per endpoint                          │    │
│  │ • IP allowlisting for admin endpoints                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 2: Authentication                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • JWT with short expiry (15min) + refresh tokens       │    │
│  │ • OAuth 2.0 / OIDC for social login                   │    │
│  │ • Web3 wallet signature verification                    │    │
│  │ • 2FA support for sensitive operations                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 3: Data Security                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Encryption at rest (AES-256)                        │    │
│  │ • TLS 1.3 for data in transit                         │    │
│  │ • Field-level encryption for PII                      │    │
│  │ • Secure key management (HashiCorp Vault)            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 4: Application Security                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Input validation (Zod schemas)                      │    │
│  │ • SQL injection prevention (Parameterized queries)    │    │
│  │ • XSS protection (Content Security Policy)            │    │
│  │ • CSRF tokens for state-changing operations           │    │
│  │ • File upload validation (type, size, malware scan)   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 5: Smart Contract Security                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Multiple audits (Trail of Bits, OpenZeppelin)       │    │
│  │ • Formal verification for critical functions          │    │
│  │ • Timelock for admin functions (48hr delay)           │    │
│  │ • Circuit breakers for emergency pause               │    │
│  │ • Upgrade proxy pattern with guardian multisig        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Kubernetes Setup

```yaml
# deployment.yaml structure
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mangaverse-api
spec:
  replicas:3
  template:
    spec:
      containers:
        - name: api
          image: mangaverse/api:${IMAGE_TAG}
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: mangaverse-secrets
                  key: database-url
```

### 8.2 Scalability Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALABILITY ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Auto-Scaling Triggers:                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Metric                    │ Scale Up    │ Scale Down   │    │
│  ├───────────────────────────┼─────────────┼──────────────│    │
│  │ CPU Usage                 │ > 70%       │ < 30%        │    │
│  │ Memory Usage              │ > 80%       │ < 40%        │    │
│  │ Request Latency (p99)     │ > 500ms    │ < 200ms     │    │
│  │ Queue Depth               │ > 100      │ < 10        │    │
│  └───────────────────────────┴─────────────┴──────────────┘    │
│                                                                  │
│  GPU Scaling (AI Services):                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                           │   │
│  │  [Request] → [Load Balancer] → [GPU Node 1]            │   │
│  │                          │           [GPU Node 2]       │   │
│  │                          │           [GPU Node N]       │   │
│  │                          │                               │   │
│  │                          └── [Queue] (Redis)            │   │
│  │                               ↓                          │   │
│  │                          [Worker Pool]                  │   │
│  │                               ↓                          │   │
│  │                          [Results Cache]                │   │
│  │                                                           │   │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CDN Strategy:                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Static Assets → CloudFlare R2 → Edge Caching          │    │
│  │  Manga Pages   → CloudFlare R2 → Smart Routing         │    │
│  │  Animations   → Adaptive Streaming → Multi-Quality    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. DATA MODELS

### 9.1 Core Entities

```typescript
// User Entity
interface User {
  id: string;                    // UUID
  email: string;
  username: string;
  passwordHash: string;
  walletAddress?: string;        // Web3 wallet
  profile: {
    displayName: string;
    avatar: string;
    bio: string;
  };
  settings: {
    theme: 'light' | 'dark';
    language: string;
    readingDirection: 'rtl' | 'ltr' | 'vertical';
  };
  subscriptions: {
    tier: 'free' | 'pro' | 'studio';
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Manga Project Entity
interface Manga {
  id: string;
  authorId: string;
  title: string;
  description: string;
  cover: string;
  genres: string[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'unlisted' | 'public';
  chapters: Chapter[];
  settings: {
    readingDirection: 'rtl' | 'ltr' | 'vertical';
    allowAnimations: boolean;
    allowNft: boolean;
  };
  nft?: {
    contractAddress: string;
    tokenId: string;
    mintPrice: string;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Character Entity
interface Character {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  images: string[];              // Reference images
  loraPath?: string;             // Trained LoRA
  attributes: {
    gender?: string;
    age?: string;
    hairColor?: string;
    eyeColor?: string;
    personality?: string[];
  };
  poses: CharacterPose[];
  relationships: CharacterRelationship[];
  licensing: {
    isLicensable: boolean;
    price?: string;
    usageTerms?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Animation Job Entity
interface AnimationJob {
  id: string;
  userId: string;
  mangaId: string;
  pageId?: string;
  sceneId?: string;
  sourceImage: string;
  prompt: string;
  duration: number;              // seconds
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;             // 0-100
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  error?: string;
  creditsUsed: number;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## 10. DEVELOPMENT WORKFLOW

### 10.1 Git Strategy

```
Main Branch: main (production-ready)
           ↓
Development: develop (integration branch)
           ↓
Feature Branches: feature/{feature-name}
                 → PR → Code Review → Merge to develop
           ↓
Release: release/v{version} (stabilization)
           ↓
Hotfix: hotfix/{issue-name} (emergency fixes)
              → PR → Quick Review → Merge to main + develop
```

### 10.2 CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # 1. Lint & Type Check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # 2. Unit Tests
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e

  # 3. Build
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # 4. Deploy to Staging
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh staging

  # 5. Deploy to Production
  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: [build]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh production
```

---

## 11. MONITORING & OBSERVABILITY

### 11.1 Metrics to Track

```typescript
// Business Metrics
const BUSINESS_METRICS = {
  DAU: 'daily_active_users',
  WAU: 'weekly_active_users',
  MAU: 'monthly_active_users',
  newRegistrations: 'daily_new_users',
  conversionRate: 'free_to_paid',
  retention: ['day_1', 'day_7', 'day_30'],
  engagement: {
    avgSessionDuration: 'seconds',
    pagesPerSession: 'count',
    animationsGenerated: 'count',
  },
  revenue: {
    MRR: 'monthly_recurring_revenue',
    ARR: 'annual_recurring_revenue',
    LTV: 'lifetime_value',
    CAC: 'customer_acquisition_cost',
  }
};

// Technical Metrics
const TECHNICAL_METRICS = {
  availability: 'uptime_percentage',
  latency: {
    p50: '50th_percentile',
    p95: '95th_percentile',
    p99: '99th_percentile',
  },
  errorRate: '5xx_errors / total_requests',
  aiGeneration: {
    successRate: 'successful / total',
    avgProcessingTime: 'seconds',
    queueWaitTime: 'seconds',
  },
  blockchain: {
    txSuccessRate: 'successful / total',
    avgGasCost: 'gwei',
    contractInteractions: 'count',
  }
};
```

---

## 12. FILE STRUCTURE

```
mangaverse/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── studio/    # Manga studio features
│   │   │   │   ├── reader/    # Manga reader features
│   │   │   │   ├── animate/   # Animation features
│   │   │   │   └── nft/       # NFT features
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API service layer
│   │   │   ├── stores/        # Zustand stores
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utility functions
│   │   └── package.json
│   │
│   ├── desktop/               # Tauri desktop app
│   │   ├── src/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── mobile/                # React Native mobile app
│       └── src/
│
├── packages/
│   ├── api/                   # Express/Apollo server
│   │   ├── src/
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── services/      # Business logic
│   │   │   ├── models/        # Database models
│   │   │   ├── middleware/    # Express middleware
│   │   │   └── graphql/       # GraphQL schemas/resolvers
│   │   └── package.json
│   │
│   ├── contracts/            # Solidity smart contracts
│   │   ├── contracts/
│   │   ├── scripts/
│   │   ├── test/
│   │   └── hardhat.config.ts
│   │
│   ├── ai/                   # AI services (ComfyUI, LTX)
│   │   ├── src/
│   │   │   ├── comfyui/      # ComfyUI integration
│   │   │   ├── ltx/          # LTX video generation
│   │   │   └── common/       # Shared AI utilities
│   │   └── package.json
│   │
│   └── shared/               # Shared types and utilities
│       ├── types/
│       ├── constants/
│       └── utils/
│
├── infrastructure/
│   ├── k8s/                  # Kubernetes configs
│   ├── terraform/             # IaC for cloud resources
│   └── docker/               # Docker configurations
│
├── docs/                     # Documentation
├── SPEC.md                   # This file
├── package.json              # Root package.json
├── turbo.json               # Turborepo config
└── README.md
```

---

*Document Version: 1.0*  
*Last Updated: April 17, 2026*  
*Authors: MangaVerse Development Team*
