# Production Build Guide - Discipline Tracker

This guide details the steps to generate production-ready binaries for all supported platforms.

## 0. Global Prerequisites
- **Node.js 20+**
- **npm / npx**
- **Static Export**: Run `npm run build` before any platform-specific build.

---

## 1. ANDROID (.apk / .aab)
Using **Capacitor** for native bridge.

### Setup
1. Sync web assets: `npx cap sync`
2. Open in Android Studio: `npx cap open android`

### Generating Release APK
1. In Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Find the output in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Generating Release AAB (Play Store)
1. In Android Studio: `Build > Generate Signed Bundle / APK`
2. Follow the wizard to sign with your `.keystore` file.
3. Output: `android/app/release/app-release.aab`

**Configuration**: Set your unique `appId` (e.g., `com.discipline.tracker`) in `capacitor.config.ts`.

---

## 2. WINDOWS (.exe)
Using **Tauri** (Recommended) or **Electron**.

### Tauri (High Performance)
1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Run build: `npm run tauri build`
3. Output: `src-tauri/target/release/bundle/msi/*.msi` or `.exe`

### Electron (Standard)
1. Run build: `npm run electron:build`
2. Configuration in `package.json` under the `build` key.
3. Output: `release/Discipline-Tracker-Setup.exe`

---

## 3. LINUX (.AppImage / .deb)
### Via Electron
1. Run: `npm run electron:build --linux`
2. Output: `release/Discipline-Tracker.AppImage`

### Via Tauri
1. Run: `npm run tauri build`
2. Output: `src-tauri/target/release/bundle/appimage/*.AppImage`

---

## 4. COMMON ISSUES & SOLUTIONS

### Form Resets / Unexpected Redirects
- **Problem**: Action buttons triggering `onSubmit` or page reloads.
- **Solution**: Explicitly set `type="button"` on all buttons that are not intended to submit a form. Use `event.preventDefault()` in click handlers.

### CORS & Absolute Paths
- **Rule**: Never use absolute URLs (e.g., `http://localhost:3000/api`).
- **Solution**: Use relative paths or a unified environment config in `src/lib/config.ts` that detects the platform and sets the base URL accordingly.

### OS Detection
- Use `navigator.userAgent` to detect the OS and display only the relevant download link in the portal.