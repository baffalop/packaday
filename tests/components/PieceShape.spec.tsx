import { test, expect } from '@playwright/experimental-ct-react'
import { PieceShape } from './wrappers'

const shapes = ['Rect', 'Thumb', 'Corner', 'Snake', 'U', 'L', 'T', 'Z'] as const

test.describe('Piece.Shape Component', () => {
  for (const shape of shapes) {
    test(`${shape} shape snapshot`, async ({ mount }) => {
      const component = await mount(<PieceShape t={shape} />)
      await expect(component).toBeVisible()
      await expect(component).toHaveScreenshot(`shape-${shape.toLowerCase()}.png`)
    })
  }

  test('default cellSize (8) produces 16x24 SVG for Rect', async ({ mount }) => {
    const svg = await mount(<PieceShape t="Rect" />)
    await expect(svg).toHaveAttribute('width', '16')
    await expect(svg).toHaveAttribute('height', '24')
  })

  test('larger cellSize (18) produces 36x54 SVG for Rect', async ({ mount }) => {
    const svg = await mount(<PieceShape t="Rect" cellSize={18} />)
    await expect(svg).toHaveAttribute('width', '36')
    await expect(svg).toHaveAttribute('height', '54')
  })

  test('custom className applies to rects', async ({ mount }) => {
    const svg = await mount(<PieceShape t="Rect" className="fill-blue-500" />)
    const rect = svg.locator('rect').first()
    await expect(rect).toHaveClass('fill-blue-500')
  })
})
