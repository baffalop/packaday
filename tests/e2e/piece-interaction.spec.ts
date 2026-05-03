import { test, expect } from './setup'
import type { Page } from '@playwright/test'

test.describe('Piece Interaction', () => {
  function getTileByLabel (page: Page, label: string) {
    return page.getByText(label, { exact: true }).locator('..')
  }

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

  test('hovering after select highlights the cell under the cursor', async ({ page }) => {
    await page.goto('/')

    // Select Rect (button 0). Anchored on day "10", the 2×3 Rect covers
    // days 3, 4, 10, 11, 17, 18 — all valid board tiles.
    await page.locator('.piece-btn').nth(0).click()

    const day10 = getTileByLabel(page, '10')
    await day10.hover()
    await expect(day10).toHaveClass(/bg-amber-600/)
  })

  test('moving the cursor updates the highlighted tile', async ({ page }) => {
    await page.goto('/')

    await page.locator('.piece-btn').nth(0).click()

    const day10 = getTileByLabel(page, '10')
    const day11 = getTileByLabel(page, '11')

    await day10.hover()
    await expect(day10).toHaveClass(/bg-amber-600/)

    await day11.hover()
    await expect(day11).toHaveClass(/bg-amber-600/)
    await expect(day10).toHaveClass(/bg-amber-900/)
  })

  test('moving the cursor off the board clears the highlight', async ({ page }) => {
    await page.goto('/')

    await page.locator('.piece-btn').nth(6).click()

    const jan = getTileByLabel(page, 'Jan')
    await jan.hover()
    await expect(jan).toHaveClass(/bg-amber-600/)

    // Move outside the board entirely. `steps` is required: React's synthetic
    // mouseleave needs intermediate mousemove events to detect the exit.
    await page.mouse.move(5, 5, { steps: 10 })
    await expect(jan).toHaveClass(/bg-amber-900/)
  })

  test('hovering with no piece selected does not highlight any tile', async ({ page }) => {
    await page.goto('/')

    const jan = getTileByLabel(page, 'Jan')
    await jan.hover()
    await expect(jan).toHaveClass(/bg-amber-900/)

    const day1 = getTileByLabel(page, '1')
    await day1.hover()
    await expect(day1).toHaveClass(/bg-amber-900/)
  })
})
