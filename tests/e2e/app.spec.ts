import { test, expect } from '@playwright/test';

test.describe('Discipline Tracker E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load the main dashboard', async ({ page }) => {
    await expect(page.locator('text=Discipline Tracker')).toBeVisible();
    await expect(page.locator('text=Inicio')).toBeVisible();
  });

  test('should navigate to habits tab', async ({ page }) => {
    await page.click('text=Hábitos');
    await expect(page.locator('text=Mis Hábitos')).toBeVisible();
  });

  test('should navigate to tasks tab', async ({ page }) => {
    await page.click('text=Tareas');
    await expect(page.locator('text=Por Hacer')).toBeVisible();
    await expect(page.locator('text=En Progreso')).toBeVisible();
    await expect(page.locator('text=Completado')).toBeVisible();
  });

  test('should open new habit modal', async ({ page }) => {
    await page.click('text=Hábitos');
    await page.click('text=Nuevo');
    await expect(page.locator('text=Nuevo Hábito')).toBeVisible();
  });

  test('should create a new habit', async ({ page }) => {
    await page.click('text=Hábitos');
    await page.click('text=Nuevo');
    await page.fill('input[placeholder*="Meditar"]', 'Meditar 10 minutos');
    await page.fill('input[type="time"]', '08:00');
    await page.selectOption('select:has-text("Frecuencia")', 'daily');
    await page.click('text=Crear Hábito');

    await expect(page.locator('text=Meditar 10 minutos')).toBeVisible();
  });

  test('should open new task modal', async ({ page }) => {
    await page.click('text=Tareas');
    await page.click('text=Nueva');
    await expect(page.locator('text=Nueva Tarea')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    await page.click('text=Tareas');
    await page.click('text=Nueva');
    await page.fill('input[placeholder*="Terminar"]', 'Terminar informe');
    await page.click('text=Crear Tarea');

    await expect(page.locator('text=Terminar informe')).toBeVisible();
  });

  test('should complete a habit', async ({ page }) => {
    await page.click('text=Hábitos');
    await page.click('text=Nuevo');
    await page.fill('input[placeholder*="Meditar"]', 'Test hábito');
    await page.click('text=Crear Hábito');

    await page.click('button:has(svg.lucide-check)');
    await page.click('button:has(text=Completar)');

    await expect(page.locator('text=Completado')).toBeVisible();
  });

  test('should move task in kanban', async ({ page }) => {
    await page.click('text=Tareas');
    await page.click('text=Nueva');
    await page.fill('input[placeholder*="Terminar"]', 'Tarea test');
    await page.click('text=Crear Tarea');

    const taskCard = page.locator('text=Tarea test').first();
    await taskCard.dragTo(page.locator('text=En Progreso'));
  });

  test('should toggle extreme mode', async ({ page }) => {
    await page.click('button:has(svg.lucide-settings)');
    await page.click('text=Modo Disciplina Extrema');
    await expect(page.locator('text=MODO EXTREMO')).toBeVisible();
  });

  test('should display stats on dashboard', async ({ page }) => {
    await expect(page.locator('text=Score')).toBeVisible();
    await expect(page.locator('text=Racha')).toBeVisible();
  });

  test('should display weekly progress chart', async ({ page }) => {
    await expect(page.locator('text=Progreso Semanal')).toBeVisible();
  });

  test('should display contribution calendar', async ({ page }) => {
    await expect(page.locator('text=Calendario de Contribución')).toBeVisible();
  });

  test('should show notifications badge', async ({ page }) => {
    await page.click('text=Inicio');
    await expect(page.locator('.lucide-bell')).toBeVisible();
  });
});