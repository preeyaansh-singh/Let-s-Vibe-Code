// tests/e2e/task-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Login with demo account
    await page.fill('input[type="email"]', 'demo@tasklane.app')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('http://localhost:3000')
  })

  test('should create a new task', async ({ page }) => {
    // Click new task button
    await page.click('button:has-text("New Task")')

    // Fill in task details
    await page.fill('input[placeholder*="Add a task"]', 'Write documentation ~2h #deep-work !high')
    await page.click('button:has-text("Add")')

    // Verify task appears
    await expect(page.locator('text=Write documentation')).toBeVisible()
  })

  test('should mark task as complete', async ({ page }) => {
    // Find first task
    const taskCheckbox = page.locator('button').first()
    await taskCheckbox.click()

    // Verify completion
    await expect(taskCheckbox).toHaveClass(/done/)
  })

  test('should switch between views', async ({ page }) => {
    // Switch to Kanban view
    await page.click('button:has-text("Kanban")')
    await expect(page.locator('text=To Do')).toBeVisible()

    // Switch to Calendar view
    await page.click('button:has-text("Calendar")')
    await expect(page.locator('text=September')).toBeVisible()

    // Switch back to List
    await page.click('button:has-text("List")')
    await expect(page.locator('text=All Tasks')).toBeVisible()
  })

  test('should filter tasks by work type', async ({ page }) => {
    // Click filter
    await page.click('select').first()
    await page.selectOption('select', 'meetings')

    // Verify only meetings tasks show
    const tasks = await page.locator('[data-testid="task-card"]').count()
    expect(tasks).toBeGreaterThan(0)
  })

  test('should start a focus session', async ({ page }) => {
    // Open task
    await page.click('[data-testid="task-card"]')

    // Start focus
    await page.click('button:has-text("Start Focus")')

    // Verify timer is running
    await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible()
  })

  test('should export tasks', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('tasklane-export')
  })

  test('should open command palette with Cmd+K', async ({ page }) => {
    await page.keyboard.press('Control+K')
    await expect(page.locator('input[placeholder*="Type a command"]')).toBeVisible()
  })
})
