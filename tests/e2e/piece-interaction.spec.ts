import { test, expect } from '@playwright/test'

test.describe('Piece Interaction', () => {
  test('clicking button shows floating piece that follows mouse', async ({ page }) => {
    await page.goto('/')

    // Initially no floating piece
    await expect(page.locator('.floating-piece')).not.toBeVisible()

    // Click the Z piece button and get its position
    const zButton = page.locator('.piece-btn').nth(6) // Z is 7th in order
    const buttonBox = await zButton.boundingBox()
    await zButton.click()

    // Floating piece should appear at the button's location (not at 0,0)
    const floating = page.locator('.floating-piece')
    await expect(floating).toBeVisible()
    const buttonCenterX = Math.round(buttonBox!.x + buttonBox!.width / 2)
    const buttonCenterY = Math.round(buttonBox!.y + buttonBox!.height / 2)
    await expect(floating).toHaveCSS('left', `${buttonCenterX}px`)
    await expect(floating).toHaveCSS('top', `${buttonCenterY}px`)

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

    // Click the Z piece button to select
    await page.locator('.piece-btn').nth(6).click()
    await expect(page.locator('.floating-piece')).toBeVisible()

    // Click on the background to unselect
    await page.mouse.click(50, 50)
    await expect(page.locator('.floating-piece')).not.toBeVisible()
  })
})
