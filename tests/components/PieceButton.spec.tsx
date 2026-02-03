import { test, expect } from '@playwright/experimental-ct-react'
import { PieceButton } from './wrappers'
import type { Piece } from '../../src/Piece'

const noop = () => {}

test.describe('Piece.Button Component', () => {
  test('renders button', async ({ mount }) => {
    const component = await mount(<PieceButton t='Thumb' onSelect={noop} />)
    await expect(component).toBeVisible()
  })

  test('Snake button snapshot', async ({ mount }) => {
    const component = await mount(<PieceButton t='Snake' onSelect={noop} />)
    await expect(component).toBeVisible()
    await expect(component).toHaveScreenshot('button-snake.png')
  })

  test('Snake button hover snapshot', async ({ mount }) => {
    const component = await mount(<PieceButton t='Snake' onSelect={noop} />)
    await expect(component).toBeVisible()
    await component.hover()
    await expect(component).toHaveScreenshot('button-snake-hover.png')
  })

  test('calls onSelect with piece and coordinates when clicked', async ({ mount }) => {
    let selected: [Piece, { x: number, y: number }] | null = null
    const component = await mount(
      <PieceButton t='Z' onSelect={(args) => { selected = args }} />,
    )
    await component.click()
    expect(selected).not.toBeNull()
    expect(selected![0]).toBe('Z')
    expect(selected![1].x).toBeGreaterThan(0)
    expect(selected![1].y).toBeGreaterThan(0)
  })
})
