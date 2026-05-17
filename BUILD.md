# Production Build Guide - Discipline Tracker

This guide details the steps to generate production-ready binaries for all supported platforms.

## 0. Global Prerequisites
- **Node.js 20+**
- **npm / npx**
- **Mobile**: Run `npm run build` (web) before any native build if you modified shared code.

---

## 1. ANDROID (.apk / .aab)

Using **Expo EAS Build** (cloud) or **expo run:android** (local).

### Option A: EAS Build (Recommended - No Android SDK required)

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build preview APK: `cd mobile && npx eas build --platform android --profile preview`
4. Build production AAB: `cd mobile && npx eas build --platform android --profile production`
5. Download from Expo dashboard: https://expo.dev/accounts/[account]/projects/discipline-tracker/builds

### Option B: Local Build (Requires Android Studio)

1. Generate native project: `cd mobile && npx expo prebuild`
2. Build debug APK: `cd mobile && npx expo run:android`
3. Build release AAB (signed): Open `mobile/android/` in Android Studio, then `Build > Generate Signed Bundle / APK`

### Configuration

- Package: `com.discipline.tracker` (set in `mobile/app.json`)
- Version: Set in `mobile/app.json` (`expo.version`)
- Permissions: Camera, Location, Microphone, Notifications (configured in `mobile/app.json`)

### EAS Build Profiles

| Profile | Output | Use Case |
|---------|--------|----------|
| `preview` | APK | Testing, direct install |
| `preview2` | AAB (unsigned) | Internal testing |
| `production` | AAB (signed, auto-increment) | Play Store |

---

## 2. WINDOWS (.exe)

Using **Electron**.

1. Run build: `npm run electron:build`
2. Output: `release/Discipline-Tracker-Setup.exe`

---

## 3. LINUX (.AppImage / .deb)

1. Run: `npm run electron:build --linux`
2. Output: `release/Discipline-Tracker.AppImage`

---

## 4. WEB (Vercel)

1. Build: `npm run build`
2. Deploy: Push to Git; Vercel auto-deploys from `main` branch.

---

## 5. COMMON ISSUES & SOLUTIONS

### EAS Build fails on plugin
- **Problem**: expo-image-picker or other plugin fails to configure.
- **Solution**: Run `npx expo install --fix` to sync plugin versions.

### Local Android build fails
- **Problem**: Gradle errors, missing SDK.
- **Solution**: Set `ANDROID_HOME` env var. Install Android SDK 34+ via Android Studio.

### Voice Commands not working
- **Problem**: `react-native-voice` requires native module.
- **Solution**: Use EAS Build or `npx expo run:android` (doesn't work in Expo Go).
