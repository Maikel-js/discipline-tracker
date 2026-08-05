# Discipline Tracker Mobile (React Native + Expo SDK 54)

Migración de la aplicación web Next.js a React Native con Expo. Mantiene la misma
arquitectura, lógica de negocio, modelos de datos y flujos de UX.

## Stack

- **Expo SDK 54** con React Native 0.81, React 19.1
- **TypeScript** strict
- **Expo Router v6** (file-based routing)
- **NativeWind 4** (Tailwind para React Native)
- **Zustand 5** + persistencia con AsyncStorage
- **React Native Reanimated 4** + Gesture Handler
- **date-fns** para fechas (es-ES)

## Estructura

```
mobile/
├── app/                              # Expo Router (file-based routes)
│   ├── _layout.tsx                   # Root layout: AuthProvider + AuthGate + Stack
│   ├── _not-found.tsx
│   ├── login.tsx                     # Pantalla de login/registro
│   └── (tabs)/                       # Tabs principales
│       ├── _layout.tsx               # Tabs layout
│       ├── index.tsx                 # → DashboardHome
│       ├── habits.tsx                # → HabitsScreen
│       ├── tasks.tsx                 # → TasksScreen
│       ├── analytics.tsx             # → AnalyticsScreen
│       └── more.tsx                  # → MoreScreen
│
├── components/                       # Pantallas y widgets RN
│   ├── DashboardHome.tsx
│   ├── HabitsScreen.tsx, HabitCard.tsx, HabitFormModal.tsx
│   ├── TasksScreen.tsx, TaskCard.tsx, TaskFormModal.tsx
│   ├── AnalyticsScreen.tsx
│   ├── MoreScreen.tsx                # Hub: Metas/Notas/Stats/AI/LifeOS/...
│   ├── LoginScreen.tsx
│   ├── GoalsSection.tsx, NotesSection.tsx, NotesProtocols.tsx
│   ├── ProtocolsSection.tsx
│   ├── AnalyticsHub.tsx, StatsDashboard.tsx
│   ├── AdvancedAIHub.tsx, LifeOSHub.tsx, LifeGraph.tsx
│   ├── AutoScheduler.tsx, PhysicalCalendar.tsx
│   ├── ContributionCalendar.tsx
│   ├── PomodoroTimer.tsx
│   ├── RewardsSystem.tsx
│   ├── NotificationSystem.tsx
│   ├── VoiceCommands.tsx
│   ├── EvidenceSystem.tsx
│   ├── SensorIntegration.tsx
│   ├── SmartTracker.tsx
│   ├── AuditPanel.tsx
│   ├── AccountabilityPartner.tsx
│   ├── UserProfile.tsx
│   ├── SettingsSection.tsx
│   ├── DownloadPortal.tsx
│   └── AICoach.tsx
│
├── shared/                           # Lógica reutilizable (idéntica al web)
│   ├── store.ts                      # Zustand store con persistencia
│   ├── types.ts                      # Tipos e interfaces
│   ├── auth.tsx                      # AuthProvider + useAuth (SHA-256)
│   ├── helpers.ts                    # Utilidades (generateId, formatDate, ...)
│   ├── constants.ts                  # Constantes
│   ├── pushNotifications.ts          # expo-notifications
│   ├── email.ts                      # Servicio de email simulado
│   └── antiCheat.ts                  # Anti-cheat
│
├── assets/                           # icon/splash/adaptive-icon
├── app.json                          # Config Expo
├── eas.json                          # Build profiles (EAS Build)
├── babel.config.js                   # babel-preset-expo + nativewind
├── metro.config.js                   # withNativeWind
├── tailwind.config.js                # NativeWind preset
├── global.css                        # @tailwind directives
└── package.json
```

## Mapeo Web → Mobile

| Web (Next.js / Tailwind)        | Mobile (React Native / NativeWind) |
|---------------------------------|------------------------------------|
| `div`                           | `View`                             |
| `span`, `p`, `h1..h6`           | `Text`                             |
| `img`                           | `Image` (expo-image)               |
| `button`                        | `Pressable` / `TouchableOpacity`   |
| `input` / `textarea`            | `TextInput`                        |
| `select`                        | `@react-native-picker/picker`      |
| `form`                          | `View` + state local               |
| `Lucide icons`                  | Emojis / `expo-vector-icons`       |
| `next/link`                     | `Link` from `expo-router`          |
| `next/navigation`               | `useRouter` from `expo-router`     |
| `next/font`                     | `expo-font`                        |
| `localStorage`                  | `AsyncStorage`                     |
| `crypto.subtle` (SHA-256)       | `expo-crypto` (SHA-256)            |
| `crypto.randomUUID()`           | `Math.random().toString(36)`       |
| `next/image`                    | `expo-image`                       |
| `recharts`                      | SVG inline + barras nativas        |
| `local-notifications` (Capacitor) | `expo-notifications`             |
| `TabBar.tsx` (web sidebar)      | `Tabs` from `expo-router`          |
| `next/router`                   | `expo-router` file-based           |

## Instalación

```bash
cd mobile
npm install
```

## Ejecución

```bash
# Inicia el Metro server
npm start

# Android (emulador o dispositivo)
npm run android

# iOS (solo macOS)
npm run ios

# Web (PWA / Metro)
npm run web
```

## Lint y type-check

```bash
npx tsc --noEmit
```

## Build con EAS (APK / AAB)

```bash
# Login en EAS (solo la primera vez)
npx eas login

# Vincular el proyecto (solo la primera vez)
npx eas init

# Preview APK (instalable directo)
npx eas build --platform android --profile preview

# Preview AAB
npx eas build --platform android --profile production-aab

# Production AAB (Play Store)
npx eas build --platform android --profile production

# iOS
npx eas build --platform ios --profile production

# Build local (sin EAS) — Android
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

Los artefactos quedan en `dist/` para web, o se descargan desde
`https://expo.dev/builds/<projectId>` para builds nativos.

## Permisos nativos

Declarados en `app.json` y `eas.json`:

- `android.permission.CAMERA` — evidencia fotográfica de hábitos
- `android.permission.ACCESS_FINE_LOCATION` / `COARSE_LOCATION` — GPS check
- `android.permission.RECORD_AUDIO` — comandos de voz
- `android.permission.VIBRATE` — feedback háptico
- `android.permission.POST_NOTIFICATIONS` — push reminders
- `android.permission.MODIFY_AUDIO_SETTINGS` — alarma de hábitos

iOS: agregar `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`,
`NSMicrophoneUsageDescription` y `NSUserNotificationsUsageDescription` en
`app.json → ios.infoPlist` antes de buildear.

## Diferencias con la versión web

1. **Sin SSR**: App 100% client-side, los datos viven en AsyncStorage.
2. **Sin Tailwind CSS**: se usa NativeWind 4 (mismas clases, distintos targets).
3. **Sin recharts**: los gráficos son barras nativas (sin librería externa).
4. **Sensores**: Pedometer/Sleep se simulan (no usamos HealthKit/Google Fit
   en esta versión — `EvidenceSystem` usa cámara/GPS reales).
5. **Voice commands**: sólo Español, usa `expo-speech-recognition` (WebView
   fallback en iOS Simulator).
6. **Notificaciones**: canal "alarm" con `bypassDnd` y vibración agresiva.

## Próximos pasos

- [ ] HealthKit / Google Fit integration
- [ ] iCloud / Google Drive backup
- [ ] Background tasks (`expo-task-manager` + `expo-background-fetch`)
- [ ] iPad split view (Expo Router 6 soporta `native-tabs`)
- [ ] Widgets de pantalla de inicio
