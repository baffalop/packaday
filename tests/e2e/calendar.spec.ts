import { test, expect } from '@playwright/test'

test.describe('Packaday Calendar', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#root')).toBeVisible()
  })

  test('all 12 months are displayed', async ({ page }) => {
    await page.goto('/')

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (const month of months) {
      await expect(page.getByText(month, { exact: true })).toBeVisible()
    }
  })

  test('all 31 days are displayed', async ({ page }) => {
    await page.goto('/')

    for (let day = 1; day <= 31; day++) {
      await expect(page.getByText(String(day), { exact: true })).toBeVisible()
    }
  })

  test('proper grid layout structure', async ({ page }) => {
    await page.goto('/')

    // Check that we have the expected number of tile elements (12 months + 31 days = 43)
    const tiles = page.locator('.tile')
    await expect(tiles).toHaveCount(43)
  })

  test('visual regression screenshot', async ({ page }) => {
    await page.goto('/')

    // Wait for the calendar to be fully rendered
    await expect(page.getByText('Jan')).toBeVisible()
    await expect(page.getByText('31', { exact: true })).toBeVisible()

    await expect(page).toHaveScreenshot('calendar.png')
  })
})
