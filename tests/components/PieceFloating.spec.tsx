import { test, expect } from '@playwright/experimental-ct-react'
import { PieceFloating } from './wrappers'

test.describe('Piece.Floating Component', () => {
  test('renders at mouse position', async ({ mount, page }) => {
    const component = await mount(<PieceFloating piece="Rect" />)
    await expect(component).toBeVisible()

    // Move mouse to a specific position
    await page.mouse.move(200, 150)

    // Check that the component moved (left/top styles updated)
    await expect(component).toHaveCSS('left', '200px')
    await expect(component).toHaveCSS('top', '150px')
  })

  test('floating piece snapshot', async ({ mount, page }) => {
    const component = await mount(<PieceFloating piece="Snake" />)
    await page.mouse.move(100, 100)
    await expect(component).toHaveScreenshot('floating-snake.png')
  })
})
