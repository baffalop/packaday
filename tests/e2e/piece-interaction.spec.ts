import { test, expect } from './setup'
import type { Locator, Page } from '@playwright/test'

test.describe('Piece Interaction', () => {
  const highlightClass = /bg-amber-800/
  const highlightNoneClass = /bg-amber-900/
  const highlightClassSelector = `.${highlightClass}`.replaceAll('/', '')

  function getTileByLabel (page: Page, label: string) {
    return page.getByText(label, { exact: true }).locator('..')
  }

  async function expectHighlighted (tile: Locator) {
    await expect(tile).toHaveClass(highlightClass)
  }

  async function expectNotHighlighted (tile: Locator) {
    await expect(tile).toHaveClass(highlightNoneClass)
  }

  async function expectTilesHighlighted (page: Page, tiles: (number | string)[]) {
    for (const tile of tiles) {
      await expectHighlighted(getTileByLabel(page, `${tile}`))
    }
  }

  async function expectTilesNotHighlighted (page: Page, tiles: (number | string)[]) {
    for (const tile of tiles) {
      await expectNotHighlighted(getTileByLabel(page, `${tile}`))
    }
  }

  async function expectNoHighlights (page: Page) {
    await expect(page.locator(highlightClassSelector)).toHaveCount(0)
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

  test('hovering after select highlights all projected piece cells', async ({ page }) => {
    await page.goto('/')

    await page.locator('.piece-btn').nth(6).click() // Z button (index 6)
    await getTileByLabel(page, '10').hover()

    await expectTilesHighlighted(page, [2, 3, 10, 17, 18])
    await expectTilesNotHighlighted(page, [1, 9, 16, 4, 11])
  })

  test('moving the cursor updates the highlighted shape', async ({ page }) => {
    await page.goto('/')

    await page.locator('.piece-btn').nth(6).click() // Z button (index 6)

    const day10 = getTileByLabel(page, '10')
    const day11 = getTileByLabel(page, '11')

    await day10.hover()
    await expectHighlighted(day10)

    const expectedHighlights = [2, 3, 10, 17, 18]
    const expectedNonHighlights = [1, 9, 16, 4, 11]

    await expectTilesHighlighted(page, expectedHighlights)
    await expectTilesNotHighlighted(page, expectedNonHighlights)

    await day11.hover()

    await expectTilesHighlighted(page, expectedHighlights.map(t => t + 1))
    await expectTilesNotHighlighted(page, expectedNonHighlights.map(t => t + 1))
  })

  test('moving the cursor off the board clears the highlight', async ({ page }) => {
    await page.goto('/')

    await page.locator('.piece-btn').nth(6).click()

    const jan = getTileByLabel(page, 'Jan')
    await jan.hover()
    await expectHighlighted(jan)

    // Move outside the board entirely. `steps` is required: React's synthetic
    // mouseleave needs intermediate mousemove events to detect the exit.
    await page.mouse.move(5, 5, { steps: 10 })
    await expectNoHighlights(page)
  })

  test('hovering with no piece selected does not highlight any tile', async ({ page }) => {
    await page.goto('/')

    await getTileByLabel(page, 'Jan').hover()
    await expectNoHighlights(page)

    await getTileByLabel(page, '1').hover()
    await expectNoHighlights(page)
  })
})
