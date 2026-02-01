import { test, expect } from '@playwright/experimental-ct-react'
import { Board } from './wrappers'

test.describe('Board Component', () => {
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
})
