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

  // Anchor-on-cursor: a fixed-positioned canvas with a lime marker at the
  // cursor position; the piece's position relative to the marker reveals
  // whether the anchor cell is centered. Multiple pieces cover the per-piece
  // transform formula.
  for (const piece of ['Snake', 'Corner', 'L'] as const) {
    test(`anchor-on-cursor (${piece})`, async ({ mount }) => {
      const initial = { x: 200, y: 200 }
      const harness = await mount(
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: 400, height: 400,
          background: '#1a1a1a',
        }}>
          <div style={{
            position: 'absolute',
            left: initial.x - 3, top: initial.y - 3,
            width: 6, height: 6,
            background: 'lime', zIndex: 1,
          }} />
          <PieceFloating piece={piece} initial={initial} />
        </div>,
      )
      await expect(harness).toHaveScreenshot(`floating-anchor-${piece.toLowerCase()}.png`)
    })
  }
})
