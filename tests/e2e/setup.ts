import { test as base } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await use(page)

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors detected:\n${consoleErrors.join('\n')}`
      )
    }
  },
})

export { expect } from '@playwright/test'
