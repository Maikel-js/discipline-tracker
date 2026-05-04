# Architecture: Discipline Tracker - Clean Multiplatform

## 1. Core Principles
The architecture is based on **Clean Architecture** principles, adapted for a multi-platform environment using a single codebase (Next.js) distributed via Capacitor (Android) and Tauri (Desktop).

## 2. Directory Structure (`src/`)

| Directory | Layer | Responsibility |
|:---|:---|:---|
| `app/` | Framework | Next.js App Router (Routing, Layouts, Pages) |
| `components/` | Presentation | UI Components (Atomic Design, pure UI, no logic) |
| `domain/` | Enterprise | Business entities and logic (Constants, Core Rules) |
| `services/` | Application | Business logic and Bridge (API, Data processing) |
| `platform/` | Infrastructure | Platform-specific implementations (Android, Desktop, Web) |
| `store/` | Infrastructure | State management (Zustand + Persistence) |
| `types/` | Cross-cutting | TypeScript interfaces and shared schemas |
| `lib/` | Cross-cutting | Pure utilities and configuration |

## 3. The `platform/` Layer
This layer is critical for multi-platform consistency. It abstracts system-level capabilities:

- **Web (PWA)**: Uses standard Browser APIs.
- **Android (Capacitor)**: Uses `@capacitor/core` and plugins for native features (Notifications, Sensors).
- **Desktop (Tauri)**: Uses Rust-based bridges for deep OS access (Filesystem, System Tray).

## 4. Data Flow
1. **User Action** -> Component in `components/`.
2. **Component** calls a method in `store/` or a service in `services/`.
3. **Store/Service** performs logic and, if needed, calls the `platform/` layer for native actions.
4. **Platform** executes the native command (e.g., triggering a system alarm).
5. **State** updates and UI re-renders.

## 5. Multi-platform Strategy
- **Single Source of Truth**: All business logic lives in `store/` and `services/`.
- **Static Export**: The app is built as a static site (`output: 'export'`), allowing it to be bundled into any container (WebView).
- **Environment Aware**: Global constants determine the current environment (Web vs App) to toggle UI elements like the "Download Portal".

## 6. Best Practices
- **No Hardcoded Paths**: Always use relative paths or Path Aliases (`@/*`).
- **Form Safety**: Use `type="button"` for all action buttons to prevent accidental form resets in different Webview implementations.
- **Offline First**: All data is stored in `localStorage` via Zustand middleware, ensuring 100% functionality without internet.