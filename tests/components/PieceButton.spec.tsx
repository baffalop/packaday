import { test, expect } from '@playwright/experimental-ct-react'
import { PieceButton } from './wrappers'

test.describe('Piece.Button Component', () => {
  test('renders button', async ({ mount }) => {
    const component = await mount(<PieceButton t='Thumb' />)
    await expect(component).toBeVisible()
  })

  test('Snake button snapshot', async ({ mount }) => {
    const component = await mount(<PieceButton t='Snake' />)
    await expect(component).toBeVisible()
    await expect(component).toHaveScreenshot('button-snake.png')
  })

  test('Snake button hover snapshot', async ({ mount }) => {
    const component = await mount(<PieceButton t='Snake' />)
    await expect(component).toBeVisible()
    await component.hover()
    await expect(component).toHaveScreenshot('button-snake-hover.png')
  })

  test('calls onSelect when clicked', async ({ mount }) => {
    let selected: string | null = null
    const component = await mount(
      <PieceButton t='Rect' onSelect={(t: string) => { selected = t }} />
    )
    await component.click()
    expect(selected).toBe('Rect')
  })
})
