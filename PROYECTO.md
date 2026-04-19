# Discipline Tracker - Sistema de Seguimiento de Hábitos y Tareas

## Resumen del Proyecto

Sistema completo de seguimiento de hábitos y tareas con notificaciones insistentes, desarrollado según las especificaciones del archivo "Ejecuta esto.txt".

---

## Funcionalidades Implementadas

### 1. Sistema de Hábitos
- Crear hábitos diarios, semanales, mensuales
- Definir: nombre, hora programada, frecuencia, prioridad, meta de rachas, categorías
- Estados: completado, pendiente, incumplido
- Rachas consecutivas y porcentaje de cumplimiento
- Estadísticas y gráficas de progreso

### 2. Sistema de Tareas (To-Do Avanzado)
- CRUD completo de tareas
- Subtareas
- Prioridades y fechas límite
- Dependencias entre tareas
- Modo Kanban (To Do / Doing / Done)

### 3. Notificaciones Insistentes (5 niveles)
- Nivel 1: Notificación normal
- Nivel 2: Urgente (5-10 min después)
- Nivel 3: Repetición automática
- Nivel 4: Alarma sonora + vibración
- Nivel 5: Bloqueo modal

### 4. Alarmas por Incumplimiento
- Sonido, vibración, repetición
- Modo "No puedes posponer sin completar"

### 5. PWA para Móvil
- Manifest.json configurado
- Se puede instalar como app
- Notificaciones push

### 6. Dashboard
- Gráficos de progreso semanal
- Calendario tipo GitHub contributions
- Score gamificado
- Nivel de disciplina

### 7. Motor de Seguimiento Inteligente
- Detecta hábitos abandonados
- Recomendaciones automáticas

### 8. Modo Disciplina Extrema
- Alarmas más fuertes
- Bloqueo total

---

## Estructura del Proyecto

```
discipline-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal
│   │   ├── layout.tsx       # Layout con metadata PWA
│   │   ├── globals.css      # Estilos globales
│   │   └── api/store/route.ts # API endpoints
│   ├── components/
│   │   ├── HabitCard.tsx       # Tarjeta de hábito
│   │   ├── HabitFormModal.tsx # Modal de crear hábito
│   │   ├── TaskCard.tsx         # Tarjeta de tarea (Kanban)
│   │   ├── TaskFormModal.tsx    # Modal de crear tarea
│   │   ├── NotificationSystem.tsx # Sistema de notificaciones
│   │   ├── Dashboard.tsx         # Panel de estadísticas
│   │   ├── TabBar.tsx           # Navegación
│   │   └── SmartTracker.tsx      # Análisis inteligente
│   ├── store/
│   │   └── useStore.ts       # Zustand store
│   └── types/
│       └── index.ts         # Tipos TypeScript
├── tests/
│   ├── unit/
│   │   ├── habits.test.ts      # Tests de hábitos
│   │   ├── tasks.test.ts        # Tests de tareas
│   │   └── notifications.test.ts # Tests de notificaciones
│   ├── e2e/
│   │   └── app.spec.ts        # Tests E2E Playwright
│   └── setupTests.ts         # Configuración de tests
├── public/
│   └── manifest.json         # Manifiesto PWA
├── package.json
├── jest.config.ts          # Configuración Jest
├── playwright.config.ts   # Configuración Playwright
└── next.config.ts
```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Tests unitarios
npm test

# Tests E2E
npm run test:e2e
```

---

## Resultados de Tests

```
Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
Time:        10.565 s
```

### Tests Implementados

1. **Habits CRUD Tests** (8 tests)
   - Crear hábito con todos los campos
   - IDs únicos
   - Actualizar nombre, prioridad
   - Eliminar hábito
   - Completar hábito
   - Incrementar racha
   - Marcar como incumplido
   - Reset de racha

2. **Tasks CRUD Tests** (7 tests)
   - Crear tarea
   - Descripción
   - Subtareas
   - Actualizar título
   - Actualizar prioridad
   - Eliminar tarea
   - Mover tarea (Kanban)

3. **Notifications Tests** (8 tests)
   - Nivel 1: Primera notificación
   - Nivel 2: (5-10 min)
   - Nivel 3: (10-15 min)
   - Nivel 4: Alarma
   - Nivel 5: (20+ min)

---

## Decisiones Técnicas

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **State Management**: Zustand con persistencia localStorage
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library + Playwright
- **Fechas**: date-fns

---

## Ubicación

```
C:\Users\Edwin\OneDrive\Escritorio\Code\discipline-tracker
```

---

## Ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar desarrollo:
```bash
npm run dev
```

3. Abrir en navegador:
```
http://localhost:3000
```

---

*Proyecto creado el 18 de Abril de 2026*