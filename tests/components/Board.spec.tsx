import { test, expect, MountResult } from '@playwright/experimental-ct-react'
import { Board } from './wrappers'

test.describe('Board Component', () => {
  function getTileByLabel (component: MountResult, label: string) {
    return component.getByText(label, { exact: true }).locator('..')
  }

  test('renders board', async ({ mount }) => {
    const component = await mount(<Board />)
    await expect(component).toBeVisible()
  })

  test('month tiles display correctly', async ({ mount }) => {
    const component = await mount(<Board />)

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    for (const month of months) {
      await expect(component.getByText(month, { exact: true })).toBeVisible()
    }
  })

  test('day tiles display correctly', async ({ mount }) => {
    const component = await mount(<Board />)

    for (let day = 1; day <= 31; day++) {
      await expect(
        component.getByText(String(day), { exact: true }),
      ).toBeVisible()
    }
  })

  test('correct total tile count', async ({ mount }) => {
    const component = await mount(<Board />)

    // 12 months + 31 days = 43 tiles
    const tiles = component.locator('.tile')
    await expect(tiles).toHaveCount(43)
  })

  test('visual snapshot', async ({ mount }) => {
    const component = await mount(<Board />)

    // Wait for content to be rendered
    await expect(component.getByText('Jan')).toBeVisible()
    await expect(component.getByText('31', { exact: true })).toBeVisible()

    await expect(component).toHaveScreenshot('board.png')
  })

  test('onCellHover fires with tile index on tile mouseEnter', async ({ mount }) => {
    const calls: Array<number | null> = []
    const component = await mount(
      <Board onCellHover={(tile: number | undefined) => calls.push(tile ?? null)} />,
    )

    // Hover Jan: tile 0
    await component.getByText('Jan', { exact: true }).hover()
    expect(calls.at(-1)).toBe(0)

    // Hover day "15": tile 26 (months 0-11, days 12+, so day d → 11 + d → 15 → 26)
    await component.getByText('15', { exact: true }).hover()
    expect(calls.at(-1)).toBe(26)
  })

  test('onCellHover fires None on board mouseLeave', async ({ mount, page }) => {
    const calls: Array<number | null> = []
    const component = await mount(
      <Board onCellHover={(tile: number | undefined) => calls.push(tile ?? null)} />,
    )

    await component.getByText('Jan', { exact: true }).hover()
    expect(calls.at(-1)).toBe(0)

    // Move mouse outside the board (board starts at ~48,48; move to 0,0 is outside).
    await page.mouse.move(0, 0, { steps: 10 })
    expect(calls.at(-1)).toBeNull()
  })

  test('highlight prop highlights only the matching tile', async ({ mount }) => {
    // @ts-expect-error Melange output has no type declarations
    const { of_piece } = await import('../../src/Shape.js')
    // Sep is tile 8 (Jan=0..Jun=5, Jul=6, Aug=7, Sep=8).
    const component = await mount(
      <Board highlight={[of_piece('Rect'), 8]} />,
    )

    await expect(getTileByLabel(component, 'Sep')).toHaveClass(/bg-amber-600/)

    for (const tile of ['Jan', 'Mar', 'Aug', 'Oct']) {
      await expect(getTileByLabel(component, tile)).toHaveClass(/bg-amber-900/)
    }
  })
})
