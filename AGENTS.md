# AGENTS.md - Discipline Tracker

## Commands

```
npm run dev            # Next.js dev server (localhost:3000)
npm run build          # Static export to out/
npm run lint           # ESLint (flat config, no --fix)
npm run test           # Jest unit tests (tests/unit/)
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest with coverage
npm run test:e2e       # Playwright E2E (tests/e2e/)
npm run electron       # Run Electron app
npm run electron:build # Windows NSIS installer + portable in release/
```

**Verification order**: `lint` -> `build` -> `test` -> `test:e2e`

Single test: `npm test -- -t "test name"` or `npm test -- tests/unit/specific.test.ts`

## Architecture

- **Next.js 16**, `output: 'export'` (static only, no SSR/serverless)
- **React 19** + **TypeScript** + **Tailwind CSS v4** + **Zustand**
- **Path alias**: `@/*` -> `./src/*` (tsconfig.json)
- **No backend/database**: fully offline client-side app. Zustand + localStorage persistence.

### Source (`src/`)
| Dir | Purpose |
|-----|---------|
| `app/` | Next.js App Router entry |
| `components/` | UI (PascalCase) |
| `domain/` | Business entities |
| `hooks/` | Custom hooks (`use` prefix) |
| `lib/` | Utilities and constants |
| `services/` | Business logic |
| `store/` | Zustand global state (`useStore.ts`) |
| `types/` | TypeScript interfaces |

## Testing

### Jest (unit)
- `ts-jest` + `jsdom`, 30s timeout (`jest.config.ts`)
- Setup: `tests/setupTests.ts`
- E2E excluded: `testPathIgnorePatterns: ['/tests/e2e/']`

### Playwright (E2E)
- Auto-starts dev server via `webServer` config
- CI: 2 retries, 1 worker. Local: parallel, no retries.

## Key Quirks

- **Tailwind v4**: `@tailwindcss/postcss` plugin (not classic postcss)
- **ESLint**: flat config (`eslint.config.mjs`) with `eslint-config-next`
- **Electron**: `electron/main.js` is plain JS (not TypeScript)
- **Capacitor**: wraps static export; always `npm run build` before `npx cap sync`
- **No CI/CD**: manual builds only. No `.github/workflows/`.
- **No external services**: no `fetch()` calls, no env vars.

## Deploy

- **Web (Vercel)**: `npm run build` -> push (`https://discipline-tracker-rho.vercel.app`)
- **Android**: `npm run build` first, then `cd android && ./gradlew assembleRelease`. See `BUILD.md`.
- **Desktop (Electron)**: `npm run electron:build` -> `release/`
