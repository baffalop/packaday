import { test, expect } from '@playwright/experimental-ct-react'
import { PieceFloating } from './wrappers'

test.describe('Piece.Floating Component', () => {
  test('starts at initial position then follows mouse', async ({ mount, page }) => {
    const component = await mount(<PieceFloating piece='Snake' initial={{ x: 120, y: 80 }} />)

    // Should be visible immediately at initial position
    await expect(component).toBeVisible()
    await expect(component).toHaveCSS('left', '120px')
    await expect(component).toHaveCSS('top', '80px')

    // After mouse moves, should follow mouse
    await page.mouse.move(200, 150)
    await expect(component).toHaveCSS('left', '200px')
    await expect(component).toHaveCSS('top', '150px')
  })

  test('floating piece snapshot', async ({ mount, page }) => {
    const component = await mount(<PieceFloating piece='Snake' initial={{ x: 100, y: 100 }} />)
    await expect(component).toHaveScreenshot('floating-snake.png')
  })
})
