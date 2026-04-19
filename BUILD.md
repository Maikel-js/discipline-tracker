# Play Store Release Guide

## Prerequisites
- Java JDK 17+
- Android SDK
- Node.js

## Build Release APK/AAB

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Generate Signed AAB (for Play Store)

The signing is already configured in `android/app/build.gradle`

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## App Info
- **App Name**: Discipline Tracker
- **Package**: com.discipline.tracker
- **Version**: 1.0
- **Min SDK**: 23 (Android 6.0)
- **Target SDK**: 34 (Android 14)

## Permissions Configured
- INTERNET
- VIBRATE
- RECEIVE_BOOT_COMPLETED
- SCHEDULE_EXACT_ALARM
- POST_NOTIFICATIONS
- ACTIVITY_RECOGNITION
- BODY_SENSORS
- HEALTH_READ_STEPS

## Keystore
- Alias: discipline-tracker
- File: release.keystore
- Password: discipline123
- **IMPORTANT**: Keep this file safe! You'll need it for updates.

## Steps to Publish
1. Build AAB: `./gradlew bundleRelease`
2. Go to Google Play Console
3. Create Internal Testing track
4. Upload .aab file
5. Complete app listing info
6. Test internal release
7. Promote to production