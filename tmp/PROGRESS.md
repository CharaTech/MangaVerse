# MangaVerse — Progress Update

**Date:** 2026-07-13
**Status:** Scaffold in progress (single TypeScript project, not a monorepo)

---

## 1. Documentation restructure (done)

- Renamed the old `tmp/` directory to `docs/` (git history preserved via `git mv`).
- `docs/` now holds the five project documents:
  - `MangaVerse_Project_Briefing.md`
  - `MangaVerse_Technical_Blueprint.md`
  - `MangaVerse_TechStack_Roadmap.md`
  - `MangaVerse_Sponsor_Request.md`
  - `MangaVerse_3D_Logo_ComfyUI_Guide.md`
- Added a **Documentation** section + TOC entry to `README.md` linking each doc.
- Removed the `tmp/` ignore rule from `.gitignore` (docs must be tracked) and
  expanded `.gitignore` for the documented stack: `.turbo/`, `.next/`,
  Hardhat/Foundry artifacts (`artifacts/`, `cache/`, `out/`, `broadcast/`,
  `forge-cache/`, `.gas-snapshot`), AI/ML weights (`*.safetensors`, `*.ckpt`,
  `loras/`, `outputs/`, `*.mvx`), local DBs, coverage/test-report dirs, and
  `.env.*` while allowing `.env.example`.

## 2. Tooling / standards scaffold (done — emulating AO Holdings templates)

Mirrors `ao-frontend-base-template` and `synergy-erp-api-base-template`,
re-implemented locally (the private `@synergyerp/*-standards` packages are not
available here).

- **Package manager:** pnpm (single package, `type: module`).
- **Husky git hooks** (`.husky/`):
  - `pre-commit` — checks pnpm, detects `--no-verify`, auto-formats staged files
    with Prettier, runs `lint-staged`, early commitlint validation.
  - `pre-push` — runs the full quality gate + commitlint range check.
  - `commit-msg` — commitlint validation.
  - `post-commit` — detects bypassed pre-commit hooks (`--no-verify`).
- **Commitlint** — Conventional Commits (`feat, fix, security, perf, docs,
style, refactor, test, chore, ci, build, revert`).
- **ESLint** (flat config) enforces:
  - No single-letter / meaningless variable names (`id-length` + banned names
    `data`, `temp`, `arr`, `obj`, `str`, `result`, `myVar`, `_`-prefixed
    single letters).
  - Import ordering (`import/order`: grouped, alphabetized, blank lines).
  - JSDoc on every exported symbol + inline comments before non-trivial calls
    (custom `require-call-comment` rule in `scripts/eslint-rules/`).
  - `no-explicit-any`, `no-console` (warn/error only), `eqeqeq`, etc.
  - Prettier integration.
- **Prettier** — 100 print width, single quotes, LF, trailing commas.
- **lint-staged** — Prettier + ESLint `--fix` on staged `src/**` files.

## 3. Check scripts (done — `scripts/`)

- `check-pnpm.mjs` — ensure pnpm is installed.
- `detect-no-verify.mjs` — refuse `--no-verify` bypass patterns.
- `pre-commit-format.mjs` — Prettier-format staged files before commit.
- `check-test-stubs.mjs` — every domain folder under `lib/`, `services/`,
  `utils/`, `types/`, `hooks/`, `store/` must have a test stub, and every
  exported symbol must be referenced in a `describe`/`it`/`test` string.
- `check-single-letter-vars.mjs`, `check-import-order.mjs`, `check-comments.mjs`
  — focused ESLint-driven checks.
- `run-quality-gate.mjs` — orchestrates detect-no-verify → lint → test-stubs →
  types → tests.
- `show-commands.mjs` — lists available commands.
- `eslint-rules/require-call-comment.mjs` — custom inline-comment rule.

## 4. Source seed (done)

```
src/
  lib/utils.ts        add(), formatTitle()        + lib/utils.test.ts
  services/manga.ts   MangaSummary, fetchMangaSummary()  + services/manga.test.ts
  api/server.ts       createApp() (Express)        + api/server.test.ts
  web/App.tsx, web/main.tsx   React entry
  blockchain/index.ts getTargetChain()             + blockchain/index.test.ts
```

Root: `vite.config.ts`, `vitest.config.ts`, `index.html`, `tsconfig.json`,
`tsconfig.base.json`.

## 5. CI (done)

- `.github/workflows/ci.yml` — install, build, lint, type-check, test-stub
  coverage, tests with coverage, security audit.

## 6. Scaffold status — COMPLETE & VERIFIED

All tooling, seed source, and checks are in place and the following pass
cleanly on the seed files:

- `pnpm lint` (ESLint, max-warnings 0) — passes
- `pnpm exec tsc --noEmit` (type-check) — passes
- `pnpm build` (Vite production build) — passes; logo bundled, favicon emitted
- `pnpm check-test-stubs` — 0 missing tests
- `pnpm test:ci` — 6 tests across 4 files pass

Fixes applied during verification:

- Native build scripts (esbuild, unrs-resolver) approved via
  `pnpm.onlyBuiltDependencies` in `package.json`.
- `src/api/server.ts`: `process.env.NODE_ENV` → `process.env['NODE_ENV']`
  (strict `noPropertyAccessFromIndexSignature` rule).
- `eslint.config.js`: removed `vite.config.ts` / `vitest.config.ts` from
  `allowDefaultProject`; forced `espree` as the parser for `.js/.mjs` script
  files (added `espree` devDependency) to fix a TS-parser parse error.
- `scripts/check-test-stubs.mjs`: fixed a comment containing `*/` (inside
  `apps/*/src`) that prematurely closed the block comment, plus a
  `no-useless-escape` in a regex.
- `src/services/manga.ts`: renamed the banned `data` variable to
  `mangaSummary`.

## 7. Logo & favicon (done)

- Renamed dropped asset `src/MangaVerse.png` → `src/web/assets/logo.png`
  (optimized to 512×512 / ~236 KB).
- Generated `public/favicon.ico` (multi-size 64/48/32/16) from the logo via
  ImageMagick.
- `index.html` references `/favicon.ico` (plus `apple-touch-icon` and a
  `#6C5CE7` theme-color).
- `src/web/App.tsx` renders the logo in the brand header via
  `import logoUrl from './assets/logo.png'`.

## 8. Next steps (feature work)

1. Implement the API foundation (Express + Prisma + JWT/OAuth) in `src/api`.
2. Build out the web client shell (Vite + React) in `src/web`.
3. Add shared domain types/utilities in `src/lib`.
4. Stand up the blockchain workspace (Hardhat/Foundry) under `src/blockchain`.
5. Keep `docs/` in sync with architecture decisions.
