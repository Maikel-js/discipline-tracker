# Discipline Tracker - Clean Architecture

## Estructura del Proyecto

```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Página principal
│   ├── layout.tsx          # Layout global
│   └── globals.css         # Estilos globales
│
├── components/             # UI Components (presentación)
│   ├── HabitCard.tsx      # Tarjetas de hábitos
│   ├── TaskCard.tsx        # Tarjetas de tareas
│   ├── Dashboard.tsx       # Panel de estadísticas
│   ├── LoginScreen.tsx    # Pantalla de login
│   └── ...
│
├── domain/               # Entidades y tipos
│   └── Entities del negocio
│
├── hooks/               # Custom React hooks
│
├── lib/                # Utilidades y helpers
│   ├── helpers.ts       # Funciones utilitarias
│   └── constants.ts   # Constantes globales
│
├── services/            # Lógica de negocio
│
├── store/              # Estado global (Zustand)
│   └── useStore.ts    # Store principal
│
└── types/              # TypeScript types
    └── index.ts      # Interfaces y tipos
```

## Principios Aplicados

### Single Responsibility
- Cada componente tiene una responsabilidad clara
- Hooks especializados para lógica reusable
- Helpers para utilitarias

### DRY (Don't Repeat Yourself)
- Utilidades centralizadas en `/lib`
- Constantes en un solo lugar
- Tipos compartidos en `/types`

### Separation of Concerns
- **UI**: Componentes visuales
- **Negocios**: Store y servicios
- **Datos**: Tipos y entidades

### KISS
- Componentes pequeños
- Nombres claros
- Lógica simple

## Convenciones

###命名
- Componentes: PascalCase (`HabitCard`)
- Hooks: camelCase con `use` (`useAuth`)
- Utilidades: camelCase (`generateId`)
- Constantes: UPPER_SNAKE_CASE

### Organización
1. Imports externos
2. Imports internos
3. Tipos/interfaces
4. Componente
5. Funciones exportadas

## Estado

El estado se maneja con Zustand con persistencia local.
No requiere backend gracias al almacenamiento local.