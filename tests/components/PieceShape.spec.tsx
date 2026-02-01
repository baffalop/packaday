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
})
