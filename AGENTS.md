# AGENTS.md - Discipline Tracker

## Reglas de Operación

1. **Enfocarse en el proceso**: Completar la tarea sin interrumpirla hasta finalizarla
2. **Explicaciones simples**: Usar lenguaje claro sin tecnicismos
3. **Claridad**: Explicar de forma limpia y directa
4. **Ejecución automática**: Proceder con los comandos sin pedir confirmación
5. **Análisis previo**: Analizar cada archivo antes de ejecutar código
6. **Planificación**: Comparar y analizar soluciones antes de implementar
7. **Información precisa**: No inventar ni devolver datos erróneos

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
npm run electron:build # Windows + Linux installers in release/ (no macOS)
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
- **Backend**: Express server in `backend/` deployed on Render
- **Build order**: web (Vercel) + desktop (electron:build) + backend (Render)

## Backend (`backend/`)
- **Render URL**: `https://discipline-tracker-api-hq4m.onrender.com` (health: `/api/health`)
- **Service ID**: `srv-d864t6gjo89c7386c6gg`
- **Important**: `npm install` must use `--include=dev` because `typescript` is a devDependency and `NODE_ENV=production` causes npm to skip devDeps otherwise.
- **Build command**: `cd backend && npm install --no-audit --no-fund --include=dev && npm run build`
- **Start command**: `cd backend && npm start`
- **No `rootDir` in Render config** (Blueprint limitation; `cd backend` in commands instead).

## Deploy

- **Web (Vercel)**: push to `main` — auto-deploys via Vercel git integration
- **Android**: `npm run build` first, then `cd android && ./gradlew assembleRelease`. See `BUILD.md`. No iOS support.
- **Desktop (Electron)**: `npm run electron:build` -> `release/` (Windows + Linux only, no macOS)
- **Backend (Render)**: push to `main` — auto-deploys via git integration. Manual deploy: `scripts/deploy-all.mjs backend`
- **All at once**: `node scripts/deploy-all.mjs all`
