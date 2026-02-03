import { test, expect } from '@playwright/experimental-ct-react'
import { Shape } from './wrappers'
// @ts-expect-error Melange output has no type declarations
import { of_piece } from '../../src/Shape.js'

const pieces = ['Rect', 'Thumb', 'Corner', 'Snake', 'U', 'L', 'T', 'Z'] as const

test.describe('Shape component', () => {
  for (const piece of pieces) {
    test(`${piece} shape snapshot`, async ({ mount }) => {
      const component = await mount(<Shape t={of_piece(piece)} />)
      await expect(component).toBeVisible()
      await expect(component).toHaveScreenshot(`shape-${piece.toLowerCase()}.png`)
    })
  }

  test('default cellSize (8) produces 16x24 SVG for Rect', async ({ mount }) => {
    const svg = await mount(<Shape t={of_piece('Rect')} />)
    await expect(svg).toHaveAttribute('width', '16')
    await expect(svg).toHaveAttribute('height', '24')
  })

  test('larger cellSize (18) produces 36x54 SVG for Rect', async ({ mount }) => {
    const svg = await mount(<Shape t={of_piece('Rect')} cellSize={18} />)
    await expect(svg).toHaveAttribute('width', '36')
    await expect(svg).toHaveAttribute('height', '54')
  })

  test('custom className applies to rects', async ({ mount }) => {
    const svg = await mount(<Shape t={of_piece('Rect')} className='fill-blue-500' />)
    const rect = svg.locator('rect').first()
    await expect(rect).toHaveClass('fill-blue-500')
  })
})
