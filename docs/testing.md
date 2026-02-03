# Component Testing

Component tests use [Playwright Component Testing](https://playwright.dev/docs/test-components) to mount and test React components in a real browser.

## Scripts

```bash
# Build
pnpm build:app      # Build app (dune @app)
pnpm build:tests    # Build OCaml component tests (dune @ct)
pnpm build:all      # Build both app and tests

# Run tests
pnpm test:ct        # Build tests + run component tests
pnpm test:ct-ui     # Build tests + run with Playwright UI
pnpm test:ct --grep "Board"  # Run specific tests

# Other
pnpm test:snap      # Update snapshots
pnpm test           # Run all tests (dune + component + e2e)
```

The `test:ct` scripts automatically build OCaml tests before running.

## Writing Tests in TypeScript

Create a file `tests/components/MyComponent.spec.tsx`:

```tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { MyComponent } from "./wrappers";

test.describe("MyComponent", () => {
  test("renders correctly", async ({ mount }) => {
    const component = await mount(<MyComponent prop="value" />);
    await expect(component).toBeVisible();
  });
});
```

Components must be imported via `wrappers.tsx` which re-exports Melange-compiled components.

## Writing Tests in OCaml

OCaml tests require a thin TypeScript wrapper to handle Playwright's JSX requirements.

### 1. Add your test logic to `Board_spec.ml` (or create a new `*_spec.ml`)

```ocaml
open Playwright

let run_tests (helpers : test_helpers) =
  helpers##test "my test name" (fun fixtures ->
      fixtures##mount helpers##board
      |> Js.Promise.then_ (fun component ->
             helpers##expect component |> to_be_visible))
```

### 2. Create a TypeScript wrapper `MyComponent_ocaml.spec.tsx`

```tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { MyComponent } from "./wrappers";
import { run_tests } from "./MyComponent_spec.js";

const wrappedTest = (name: string, fn: (fixtures: any) => Promise<void>) => {
  test(name, async ({ mount, page }) => {
    const wrappedMount = (componentName: string) => {
      if (componentName === "MyComponent") {
        return mount(<MyComponent />);
      }
      throw new Error(`Unknown component: ${componentName}`);
    };
    return fn({ mount: wrappedMount, page });
  });
};

const testHelpers = {
  myComponent: "MyComponent",
  test: wrappedTest,
  expect,
};

run_tests(testHelpers);
```

### 3. Build and run

```bash
dune build @ct    # Compile OCaml tests
pnpm test:ct      # Run all tests
```

## Available Playwright Bindings (OCaml)

See `tests/components/Playwright.mli` for the full API. Key functions:

```ocaml
(* Assertions *)
val to_be_visible : locator_assertions -> unit Js.Promise.t
val to_have_count : locator_assertions -> int -> unit Js.Promise.t
val to_have_screenshot : locator_assertions -> string -> unit Js.Promise.t

(* Locator methods *)
val click : locator -> unit Js.Promise.t
val hover : locator -> unit Js.Promise.t
val get_by_text : locator -> string -> locator
val locator_ : locator -> string -> locator
```

Add more bindings as needed.

## File Structure

```
tests/components/
├── wrappers.tsx          # Re-exports Melange components for TypeScript tests
├── dune                  # Melange build config
├── Playwright.ml[i]      # OCaml Playwright bindings
├── Board_spec.ml[i]      # OCaml test logic
├── Board_ocaml.spec.tsx  # TypeScript wrapper for OCaml tests
├── Board.spec.tsx        # Pure TypeScript tests
└── ...
```
