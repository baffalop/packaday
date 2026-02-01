import { test, expect } from '@playwright/test'

test.describe('Piece Interaction', () => {
  test('clicking button shows floating piece that follows mouse', async ({ page }) => {
    await page.goto('/')

    // Initially no floating piece
    await expect(page.locator('.floating-piece')).not.toBeVisible()

    // Click a piece button
    await page.locator('.piece-btn').first().click()

    // Floating piece should appear
    const floating = page.locator('.floating-piece')
    await expect(floating).toBeVisible()

    // Move mouse and verify floating piece follows
    await page.mouse.move(300, 200)
    await expect(floating).toHaveCSS('left', '300px')
    await expect(floating).toHaveCSS('top', '200px')

    await page.mouse.move(400, 350)
    await expect(floating).toHaveCSS('left', '400px')
    await expect(floating).toHaveCSS('top', '350px')
  })

  test('clicking anywhere unselects the piece', async ({ page }) => {
    await page.goto('/')

    // Click a piece button to select
    await page.locator('.piece-btn').first().click()
    await expect(page.locator('.floating-piece')).toBeVisible()

    // Click on the background to unselect
    await page.mouse.click(50, 50)
    await expect(page.locator('.floating-piece')).not.toBeVisible()
  })
})
