import { test, expect } from '@playwright/experimental-ct-react'
import { PieceButton } from './wrappers'

test.describe('Piece.Button Component', () => {
  test('renders button', async ({ mount }) => {
    const component = await mount(<PieceButton t='Thumb' />)
    await expect(component).toBeVisible()
  })
})
