// Thin wrapper that lets Playwright see the JSX imports,
// but delegates test logic to compiled OCaml
import { test, expect } from '@playwright/experimental-ct-react'
import { Board } from './wrappers'

// Import the compiled OCaml test runner
import { run_tests } from './Board_spec.js'

// Wrap test to handle Playwright's destructuring requirement
const wrappedTest = (name: string, fn: (fixtures: any) => Promise<void>) => {
  test(name, async ({ mount, page }) => {
    // Wrap mount to render JSX for the component by name
    const wrappedMount = (componentName: string) => {
      if (componentName === 'Board') {
        return mount(<Board />)
      }
      throw new Error(`Unknown component: ${componentName}`)
    }
    // Direct mount for React elements - this is the key test!
    // Playwright requires JSX syntax, so we pass the element through
    const mountElement = (element: React.ReactElement) => {
      return mount(element)
    }
    return fn({ mount: wrappedMount, mount_element: mountElement, page })
  })
}

// Register components and test helpers that OCaml code can use
const testHelpers = {
  board: 'Board', // Pass component name, not the component itself
  test: wrappedTest,
  expect,
  describe: test.describe,
}

run_tests(testHelpers)
