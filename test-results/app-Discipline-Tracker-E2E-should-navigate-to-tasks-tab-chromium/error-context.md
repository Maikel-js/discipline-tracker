# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Discipline Tracker E2E >> should navigate to tasks tab
- Location: tests\e2e\app.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Tareas')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - heading "Discipline Tracker" [level=1] [ref=e12]
      - paragraph [ref=e13]: Inicia sesión
    - generic [ref=e14]:
      - generic [ref=e15]:
        - img [ref=e16]
        - textbox "Email" [ref=e19]
      - generic [ref=e20]:
        - img [ref=e21]
        - textbox "Contraseña" [ref=e24]
        - button [ref=e25]:
          - img [ref=e26]
      - button "Iniciar sesión" [ref=e29]
    - button "¿No tienes cuenta? Regístrate" [ref=e31]
    - paragraph [ref=e33]: "Demo: Usa cualquier email y contraseña para probar"
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e43]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Discipline Tracker E2E', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('http://localhost:3000');
  6   |   });
  7   | 
  8   |   test('should load the main dashboard', async ({ page }) => {
  9   |     await expect(page.locator('text=Discipline Tracker')).toBeVisible();
  10  |     await expect(page.locator('text=Inicio')).toBeVisible();
  11  |   });
  12  | 
  13  |   test('should navigate to habits tab', async ({ page }) => {
  14  |     await page.click('text=Hábitos');
  15  |     await expect(page.locator('text=Mis Hábitos')).toBeVisible();
  16  |   });
  17  | 
  18  |   test('should navigate to tasks tab', async ({ page }) => {
> 19  |     await page.click('text=Tareas');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  20  |     await expect(page.locator('text=Por Hacer')).toBeVisible();
  21  |     await expect(page.locator('text=En Progreso')).toBeVisible();
  22  |     await expect(page.locator('text=Completado')).toBeVisible();
  23  |   });
  24  | 
  25  |   test('should open new habit modal', async ({ page }) => {
  26  |     await page.click('text=Hábitos');
  27  |     await page.click('text=Nuevo');
  28  |     await expect(page.locator('text=Nuevo Hábito')).toBeVisible();
  29  |   });
  30  | 
  31  |   test('should create a new habit', async ({ page }) => {
  32  |     await page.click('text=Hábitos');
  33  |     await page.click('text=Nuevo');
  34  |     await page.fill('input[placeholder*="Meditar"]', 'Meditar 10 minutos');
  35  |     await page.fill('input[type="time"]', '08:00');
  36  |     await page.selectOption('select:has-text("Frecuencia")', 'daily');
  37  |     await page.click('text=Crear Hábito');
  38  | 
  39  |     await expect(page.locator('text=Meditar 10 minutos')).toBeVisible();
  40  |   });
  41  | 
  42  |   test('should open new task modal', async ({ page }) => {
  43  |     await page.click('text=Tareas');
  44  |     await page.click('text=Nueva');
  45  |     await expect(page.locator('text=Nueva Tarea')).toBeVisible();
  46  |   });
  47  | 
  48  |   test('should create a new task', async ({ page }) => {
  49  |     await page.click('text=Tareas');
  50  |     await page.click('text=Nueva');
  51  |     await page.fill('input[placeholder*="Terminar"]', 'Terminar informe');
  52  |     await page.click('text=Crear Tarea');
  53  | 
  54  |     await expect(page.locator('text=Terminar informe')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('should complete a habit', async ({ page }) => {
  58  |     await page.click('text=Hábitos');
  59  |     await page.click('text=Nuevo');
  60  |     await page.fill('input[placeholder*="Meditar"]', 'Test hábito');
  61  |     await page.click('text=Crear Hábito');
  62  | 
  63  |     await page.click('button:has(svg.lucide-check)');
  64  |     await page.click('button:has(text=Completar)');
  65  | 
  66  |     await expect(page.locator('text=Completado')).toBeVisible();
  67  |   });
  68  | 
  69  |   test('should move task in kanban', async ({ page }) => {
  70  |     await page.click('text=Tareas');
  71  |     await page.click('text=Nueva');
  72  |     await page.fill('input[placeholder*="Terminar"]', 'Tarea test');
  73  |     await page.click('text=Crear Tarea');
  74  | 
  75  |     const taskCard = page.locator('text=Tarea test').first();
  76  |     await taskCard.dragTo(page.locator('text=En Progreso'));
  77  |   });
  78  | 
  79  |   test('should toggle extreme mode', async ({ page }) => {
  80  |     await page.click('button:has(svg.lucide-settings)');
  81  |     await page.click('text=Modo Disciplina Extrema');
  82  |     await expect(page.locator('text=MODO EXTREMO')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('should display stats on dashboard', async ({ page }) => {
  86  |     await expect(page.locator('text=Score')).toBeVisible();
  87  |     await expect(page.locator('text=Racha')).toBeVisible();
  88  |   });
  89  | 
  90  |   test('should display weekly progress chart', async ({ page }) => {
  91  |     await expect(page.locator('text=Progreso Semanal')).toBeVisible();
  92  |   });
  93  | 
  94  |   test('should display contribution calendar', async ({ page }) => {
  95  |     await expect(page.locator('text=Calendario de Contribución')).toBeVisible();
  96  |   });
  97  | 
  98  |   test('should show notifications badge', async ({ page }) => {
  99  |     await page.click('text=Inicio');
  100 |     await expect(page.locator('.lucide-bell')).toBeVisible();
  101 |   });
  102 | });
```