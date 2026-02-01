import { test, expect } from '@playwright/test'

test('renders the calendar', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.board')).toBeVisible()
  await expect(page).toHaveScreenshot('calendar.png')
})
