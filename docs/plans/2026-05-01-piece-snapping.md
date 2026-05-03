# Piece Snapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Stop for user review after each task.** Do NOT start the next task until the user has signed off on the current one. Each task ends with a review-gate step.
>
> **The user makes the commits.** Do not run `git commit`. Each task ends with a suggested commit message you can offer; the user decides when and how to commit.

**Goal:** When a piece is selected, hovering the board highlights the cell where the piece's anchor would land. The floating piece keeps following the cursor with its anchor (not bbox centre) on the cursor.

**Architecture:** Anchor encoded in `Shape` data via a new `X` segment variant (exactly one per piece). `Shape.anchor` returns the anchor's `(row, col)` in the matrix; `Shape.cells` exposes offsets from anchor (for future multi-cell projection). `Board` gains `?onCellHover` and `?highlight` props; tiles are addressed by a single `int` index into the flat months-then-days sequence (Jan=0..Dec=11, day 1=12..day 31=42). `Game` consolidates state into a `placement` record so the impossible "hover without selection" combo is unrepresentable.

**Mid-flight deviations from the original plan** (Tasks 1–5 already merged):

- Task 1 added an anchor-agnostic dedup (`unique_by`/`unanchored`) inside `Shape.variations` so X-position differences don't inflate the variation count.
- Task 3 was reverted: `Shape.make` keeps its bbox-origin matrix walk. The anchor concern lives entirely in `Piece.Floating`, which queries `Shape.anchor` and computes a per-piece transform (`translate(-(anchor_col*cellSize + halfCell), -(anchor_row*cellSize + halfCell))`).
- Task 4's CT test became a snapshot harness (lime marker + canvas) covering Snake/Corner/L. Per-piece transform string assertions were dropped as too implementation-coupled.
- Task 5's tile addressing changed from `(int * int)` to a single `int` index. Multi-cell projection (deferred) will need `coords_of_index` / `index_of_coords` helpers inside `Board`.

**Tech Stack:** OCaml + mlx + Melange + ReasonReact (frontend); Fest (OCaml unit); Playwright CT and e2e (TypeScript). Build with `pnpm build`. Run all tests with `pnpm test`. Snapshot regen: `pnpm test:snap`.

**Spec:** `docs/specs/2026-05-01-piece-snapping-design.md`.

**Conventions for the executing engineer:**

- mlx files: `[@react.component]` annotates make functions. Tag-style JSX. `<Foo prop=value>children</Foo>`.
- mli files keep module APIs constrained — keep them in sync but only expose what's needed.
- Tests: an inline `module Test = struct ... end` block in the relevant `.mlx` (run via `pnpm test:dune`), plus `.spec.tsx` / `.spec.ts` files under `tests/` (run via `pnpm test:ct` and `pnpm test:e2e`).
- Melange JS output (e.g. `src/Shape.js`) is generated; **never edit it by hand** — it regenerates on `pnpm build` or `dune build --watch`.
- TDD: write the failing test (or update an existing one to encode the new expectation) first, run it red, then make it green. Compile-time failures count as "red" for OCaml refactors.

---

## File Inventory

**Modified across all tasks:**

- `src/Shape.mli`, `src/Shape.mlx`
- `src/Piece.mlx`
- `src/Board.mli`, `src/Board.mlx`
- `src/Game.mlx`
- `tests/components/PieceFloating.spec.tsx`
- `tests/components/Board.spec.tsx`
- `tests/e2e/piece-interaction.spec.ts`

**Snapshots that will regenerate:** `tests/components/PieceFloating.spec.tsx-snapshots/floating-snake.png` (Task 4).

**Snapshots that should NOT regenerate** (verify they don't, investigate if they do):

- `tests/components/Shape.spec.tsx-snapshots/shape-*.png` — anchor-aware viewBox shifts internal origin, but bbox dimensions and rect positions inside the SVG element are unchanged.
- `tests/components/Board.spec.tsx-snapshots/board.png` — default render (no `highlight` prop) renders identically to today.

---

## Task 1: Add `X` segment variant and pick anchors per piece

Introduces the third segment value, picks an anchor per piece, and updates every existing inline test that asserts on a matrix literal so the X position is reflected. Variations tests get their counts updated since X breaks some symmetries.

The TDD framing here is "update the existing tests to encode the new expectation, watch them go red, then change the data model until they're green."

**Files:**

- Modify: `src/Shape.mlx`

- [ ] **Step 1: Update existing inline tests to expect X in matrix literals**

In `src/Shape.mlx`, in `module Test`, replace the existing `of_piece`/`rotate_*`/`flip_*` tests for `Thumb` and `Snake` with these versions (X inserted at the post-transform position):

```ocaml
test "of_piece Thumb" @@ fun () ->
  expect |> deep_equal (of_piece `Thumb)
    [|
      [| O; H |];
      [| H; X |];
      [| H; H |];
    |];
test "rotate_cw Thumb" @@ fun () ->
  expect |> deep_equal (rotate_cw @@ of_piece `Thumb)
    [|
      [| H; H; O |];
      [| H; X; H |];
    |];
test "rotate_ccw Thumb" @@ fun () ->
  expect |> deep_equal (rotate_ccw @@ of_piece `Thumb)
    [|
      [| H; X; H |];
      [| O; H; H |];
    |];
test "flip_horiz Thumb" @@ fun () ->
  expect |> deep_equal (flip_horiz @@ of_piece `Thumb)
    [|
      [| H; O |];
      [| X; H |];
      [| H; H |];
    |];
test "flip_vert Thumb" @@ fun () ->
  expect |> deep_equal (flip_vert @@ of_piece `Thumb)
    [|
      [| H; H |];
      [| H; X |];
      [| O; H |];
    |];

test "of_piece Snake" @@ fun () ->
  expect |> deep_equal (of_piece `Snake)
    [|
      [| H; O |];
      [| H; X |];
      [| O; H |];
      [| O; H |];
    |];
test "rotate_cw Snake" @@ fun () ->
  expect |> deep_equal (rotate_cw @@ of_piece `Snake)
    [|
      [| O; O; H; H |];
      [| H; X; H; O |];
    |];
test "rotate_ccw Snake" @@ fun () ->
  expect |> deep_equal (rotate_ccw @@ of_piece `Snake)
    [|
      [| O; X; H; H |];
      [| H; H; O; O |];
    |];
test "flip_horiz Snake" @@ fun () ->
  expect |> deep_equal (flip_horiz @@ of_piece `Snake)
    [|
      [| O; H |];
      [| X; H |];
      [| H; O |];
      [| H; O |];
    |];
test "flip_vert Snake" @@ fun () ->
  expect |> deep_equal (flip_vert @@ of_piece `Snake)
    [|
      [| O; H |];
      [| O; H |];
      [| H; X |];
      [| H; O |];
    |];
```

- [ ] **Step 2: Run dune tests — expect compile failure**

```
pnpm test:dune
```

Expected: compile error — `X` is not a known segment constructor.

- [ ] **Step 3: Add `X` to the `segment` type**

In `src/Shape.mlx`, replace the `segment` type:

```ocaml
(** A single cell: O empty, H filled, X filled-and-anchor (exactly one per shape) *)
type segment =
  | O
  | H
  | X
```

- [ ] **Step 4: Update `of_piece` to put X at the chosen anchor in each piece**

Replace the entire `of_piece` definition with:

```ocaml
let of_piece : piece -> t = function
  | `Rect -> [|
    [| H; H |];
    [| X; H |];
    [| H; H |];
  |]
  | `Thumb -> [|
    [| O; H |];
    [| H; X |];
    [| H; H |];
  |]
  | `Corner -> [|
    [| H; H; H |];
    [| O; O; X |];
    [| O; O; H |];
  |]
  | `L -> [|
    [| H; H |];
    [| X; O |];
    [| H; O |];
    [| H; O |];
  |]
  | `Snake -> [|
    [| H; O |];
    [| H; X |];
    [| O; H |];
    [| O; H |];
  |]
  | `T -> [|
    [| H; O |];
    [| X; H |];
    [| H; O |];
    [| H; O |];
  |]
  | `U -> [|
    [| H; H |];
    [| O; X |];
    [| H; H |];
  |]
  | `Z -> [|
    [| H; H; O |];
    [| O; X; O |];
    [| O; H; H |];
  |]
```

These anchor placements are sensible defaults (centrally located / natural hand-grip). Adjust if any feels wrong while implementing.

- [ ] **Step 5: Patch the SVG renderer's pattern match**

Adding `X` makes the existing `match seg with | O -> ... | H -> ...` non-exhaustive. Treat `X` as a filled cell for now (the renderer is rewritten properly in Task 3). In `Shape.make`, inside the inner `Array.mapi`:

```ocaml
match seg with
| O -> React.null
| H | X ->
  let x = col_i * cellSize in
  let y = row_i * cellSize in
  <rect
    key=(Printf.sprintf "%d-%d" row_i col_i)
    x=(string_of_int x)
    y=(string_of_int y)
    width=(string_of_int cellSize)
    height=(string_of_int cellSize)
    className
  />
```

- [ ] **Step 6: Run dune tests — expect green**

```
pnpm test:dune
```

Expected: the inline-test edits from Step 1 now pass; build is clean. The variations tests will likely report failures because some symmetry-driven counts changed — note the actual counts from the output and continue to Step 7.

- [ ] **Step 7: Update `variations` test counts**

Replace the `variations` tests in `module Test` with:

```ocaml
test "variations for Rect" @@ fun () ->
  expect |> equal (Array.length (variations `Rect)) 4;
test "variations for U" @@ fun () ->
  expect |> equal (Array.length (variations `U)) 8;
test "8 variations for Thumb" @@ fun () ->
  expect |> equal (Array.length (variations `Thumb)) 8;
test "8 variations for L" @@ fun () ->
  expect |> equal (Array.length (variations `L)) 8;
test "8 variations for Snake" @@ fun () ->
  expect |> equal (Array.length (variations `Snake)) 8;
test "variations for Z" @@ fun () ->
  expect |> equal (Array.length (variations `Z)) 4;
test "8 variations for T" @@ fun () ->
  expect |> equal (Array.length (variations `T)) 8;
test "variations for Corner" @@ fun () ->
  expect |> equal (Array.length (variations `Corner)) 8
```

Reasoning:

- `Rect` 2 → 4 (X breaks 180° symmetry).
- `U` 4 → 8 (X breaks 180° symmetry).
- `Z` stays at 4 (X at the rotational centre (1, 1) preserves symmetry).
- `Corner` 4 → 8 (the rotation-equals-flip coincidence is broken).
- Asymmetric pieces (`Thumb`, `L`, `Snake`, `T`) remain 8.

If a count differs from the listed value when you run, update that assertion to the observed count and double-check the X placement in the corresponding `of_piece` arm.

- [ ] **Step 8: Run dune, build, and full suite**

```
pnpm test:dune
pnpm build
pnpm test:ct
pnpm test:e2e
```

Expected: all green. CT/e2e tests render `Shape` of pieces, but `X` and `H` both produce a `<rect>`, so visuals are unchanged.

- [ ] **Step 9: Stop for user review and commit.** Do NOT start Task 2 until the user signs off.

Suggested commit message: `Shape: add X anchor segment variant`

---

## Task 2: `Shape.anchor` + `Shape.cells` + invariant tests

Two helpers expose the anchor's matrix position and the offsets-from-anchor for all filled cells. Three invariant tests assert "exactly one X per piece" and that rotation/flip preserve the X.

**Files:**

- Modify: `src/Shape.mlx` (helpers + tests)
- Modify: `src/Shape.mli` (expose helpers)

- [ ] **Step 1: Write failing tests for `anchor`**

In `src/Shape.mlx`, in `module Test`, append after the `flip_vert Snake` test (before the variations tests):

```ocaml
test "anchor Thumb" @@ fun () ->
  expect |> deep_equal (anchor (of_piece `Thumb)) (1, 1);
test "anchor L" @@ fun () ->
  expect |> deep_equal (anchor (of_piece `L)) (1, 0);
test "anchor Z" @@ fun () ->
  expect |> deep_equal (anchor (of_piece `Z)) (1, 1);
```

- [ ] **Step 2: Run — expect compile failure**

```
pnpm test:dune
```

Expected: compile error — `anchor` is not defined.

- [ ] **Step 3: Implement `anchor`**

In `src/Shape.mlx`, add (above `module Test`):

```ocaml
let anchor (t : t) : int * int =
  let result = ref None in
  Array.iteri (fun row_i row ->
    Array.iteri (fun col_i seg ->
      match seg, !result with
      | X, None -> result := Some (row_i, col_i)
      | _ -> ()
    ) row
  ) t;
  match !result with
  | Some pos -> pos
  | None -> failwith "Shape.anchor: no X cell"
```

- [ ] **Step 4: Expose in mli**

Edit `src/Shape.mli`, add after `val of_piece`:

```ocaml
val anchor : t -> int * int
(** [(row, col)] of the X cell. Raises if absent. *)
```

- [ ] **Step 5: Run — expect green**

```
pnpm test:dune
```

Expected: the three new tests pass.

- [ ] **Step 6: Write failing tests for `cells`**

In `src/Shape.mlx`'s `module Test`, append after the `anchor` tests:

```ocaml
test "cells Thumb" @@ fun () ->
  let actual = cells (of_piece `Thumb) |> List.sort compare in
  let expected = List.sort compare [
    (* Thumb with X at (row=1, col=1). Offsets are (col - anchor_col, row - anchor_row): *)
    ( 0, -1);  (* row 0, col 1 *)
    (-1,  0);  (* row 1, col 0 *)
    ( 0,  0);  (* row 1, col 1 — the X itself *)
    (-1,  1);  (* row 2, col 0 *)
    ( 0,  1);  (* row 2, col 1 *)
  ] in
  expect |> deep_equal actual expected;

test "cells contains anchor at origin" @@ fun () ->
  let pieces = [`Rect; `Thumb; `Corner; `L; `Snake; `T; `U; `Z] in
  pieces |> List.iter (fun p ->
    expect |> equal (List.mem (0, 0) (cells (of_piece p))) true
  )
```

- [ ] **Step 7: Run — expect compile failure**

```
pnpm test:dune
```

Expected: compile error — `cells` is not defined.

- [ ] **Step 8: Implement `cells`**

In `src/Shape.mlx`, add after `anchor`:

```ocaml
let cells (t : t) : (int * int) list =
  let (anchor_row, anchor_col) = anchor t in
  let acc = ref [] in
  Array.iteri (fun row_i row ->
    Array.iteri (fun col_i seg ->
      match seg with
      | O -> ()
      | H | X ->
        acc := (col_i - anchor_col, row_i - anchor_row) :: !acc
    ) row
  ) t;
  !acc
```

Note: order of returned offsets isn't specified — the test sorts before comparing.

- [ ] **Step 9: Expose in mli**

Edit `src/Shape.mli`, add after `val anchor`:

```ocaml
val cells : t -> (int * int) list
(** Offsets [(dx, dy)] from the anchor for every filled cell, including
    the anchor itself at [(0, 0)]. *)
```

- [ ] **Step 10: Run — expect green**

```
pnpm test:dune
```

Expected: all tests pass.

- [ ] **Step 11: Add invariant tests**

In `src/Shape.mlx`'s `module Test`, append after the `cells` tests:

```ocaml
test "exactly one X per piece" @@ fun () ->
  let pieces = [`Rect; `Thumb; `Corner; `L; `Snake; `T; `U; `Z] in
  pieces |> List.iter (fun p ->
    let count = of_piece p
      |> Array.to_list
      |> List.concat_map Array.to_list
      |> List.filter (fun s -> s = X)
      |> List.length
    in
    expect |> equal count 1
  );

test "rotate_cw preserves X" @@ fun () ->
  let pieces = [`Rect; `Thumb; `Corner; `L; `Snake; `T; `U; `Z] in
  pieces |> List.iter (fun p ->
    let rotated = rotate_cw (of_piece p) in
    let has_x = rotated
      |> Array.to_list
      |> List.concat_map Array.to_list
      |> List.exists (fun s -> s = X)
    in
    expect |> equal has_x true
  );

test "flip_horiz preserves X" @@ fun () ->
  let pieces = [`Rect; `Thumb; `Corner; `L; `Snake; `T; `U; `Z] in
  pieces |> List.iter (fun p ->
    let flipped = flip_horiz (of_piece p) in
    let has_x = flipped
      |> Array.to_list
      |> List.concat_map Array.to_list
      |> List.exists (fun s -> s = X)
    in
    expect |> equal has_x true
  )
```

- [ ] **Step 12: Run — expect green**

```
pnpm test:dune
```

Expected: invariants hold (each `of_piece` arm has exactly one X; rotation/flip operate via index transformation, so X rides along).

- [ ] **Step 13: Run full suite**

```
pnpm build
pnpm test
```

Expected: clean build, all tests pass.

- [ ] **Step 14: Stop for user review and commit.** Do NOT start Task 3 until the user signs off.

Suggested commit message: `Shape: add anchor + cells helpers and invariants`

---

## Task 3: Anchor-aware `Shape.make` rendering

Rewrite the SVG renderer to be driven by `cells`. The viewBox shifts so the anchor cell's top-left is at SVG (0, 0); rect positions are computed relative to anchor offsets. Asserts a viewBox attribute that includes negative coords for an asymmetric piece (TDD).

**Files:**

- Modify: `src/Shape.mlx` (the `make` function)
- Modify: `tests/components/Shape.spec.tsx` (add a viewBox assertion)

- [ ] **Step 1: Write failing test**

In `tests/components/Shape.spec.tsx`, append a test inside the `test.describe('Shape component', ...)` block:

```tsx
test("viewBox places anchor at SVG origin (negative coords for cells above/left)", async ({
  mount,
}) => {
  // L has anchor at (row=1, col=0). The cell at (row=0, col=1) is to the
  // right of and above the anchor, and the rest extend below. So the
  // viewBox y should be negative (one cellSize up from origin) and x = 0.
  const svg = await mount(<Shape t={of_piece("L")} cellSize={10} />);
  await expect(svg).toHaveAttribute("viewBox", "0 -10 20 40");
});
```

Reasoning for the expected `viewBox`:

- L cells (col, row): `(0, 0)`, `(1, 0)`, `(0, 1)`, `(0, 2)`, `(0, 3)`. Anchor at `(0, 1)` in (col, row).
- Offsets `(dx, dy)`: `(0, -1)`, `(1, -1)`, `(0, 0)`, `(0, 1)`, `(0, 2)`.
- min_dx = 0, min_dy = -1, max_dx = 1, max_dy = 2.
- width = (1 - 0 + 1) _ 10 = 20, height = (2 - (-1) + 1) _ 10 = 40.
- viewBox = `min_dx*cellSize  min_dy*cellSize  width  height` = `0 -10 20 40`.

- [ ] **Step 2: Run CT — expect failure**

```
pnpm test:ct
```

Expected: the new test fails because the current `Shape.make` produces `viewBox="0 0 20 40"` (no negative origin).

- [ ] **Step 3: Rewrite `Shape.make`**

In `src/Shape.mlx`, replace the existing `make` function with:

```ocaml
let[@react.component] make ~(t : t) ?(cellSize = 8) ?(className = "fill-rose-500") () =
  let cs = cells t in
  let dxs = List.map fst cs in
  let dys = List.map snd cs in
  let min_dx = List.fold_left min 0 dxs in
  let min_dy = List.fold_left min 0 dys in
  let max_dx = List.fold_left max 0 dxs in
  let max_dy = List.fold_left max 0 dys in
  let width = (max_dx - min_dx + 1) * cellSize in
  let height = (max_dy - min_dy + 1) * cellSize in
  let vb_x = min_dx * cellSize in
  let vb_y = min_dy * cellSize in
  <svg
    width=(string_of_int width)
    height=(string_of_int height)
    viewBox=(Printf.sprintf "%d %d %d %d" vb_x vb_y width height)
    className="piece-shape"
  >
    (cs |> List.map (fun (dx, dy) ->
      let x = dx * cellSize in
      let y = dy * cellSize in
      <rect
        key=(Printf.sprintf "%d-%d" dx dy)
        x=(string_of_int x)
        y=(string_of_int y)
        width=(string_of_int cellSize)
        height=(string_of_int cellSize)
        className
      />
    ) |> Array.of_list |> React.array)
  </svg>
```

The temporary `H | X ->` branch from Task 1 is replaced — rendering is now driven by `cells`, which already filters for filled cells.

- [ ] **Step 4: Run build**

```
pnpm build
```

Expected: clean build.

- [ ] **Step 5: Run dune tests**

```
pnpm test:dune
```

Expected: all tests pass (no inline test changes; renderer change doesn't affect data-level tests).

- [ ] **Step 6: Run CT tests — expect viewBox test green and existing snapshots stable**

```
pnpm test:ct
```

Expected:

- The new viewBox test passes.
- Existing `shape-*.png` snapshot tests pass — bbox dimensions and rect positions inside the SVG element are unchanged; only the viewBox origin shifts (invisible to the rendered pixels).
- Existing dimension tests (`width=16`, `height=24` for `Rect` at `cellSize=8`) still pass.

If a `shape-*.png` snapshot fails, investigate before regenerating — likely an off-by-one in `min_dx`/`max_dx` (note the `+ 1`).

- [ ] **Step 7: Run e2e tests**

```
pnpm test:e2e
```

Expected: existing e2e tests pass at the data level, but `floating-snake.png` (and any e2e snapshots showing the floating piece) may not match because the SVG content origin moved while the floating-piece transform hasn't been updated yet (Task 4). **If the only failing snapshots are floating-piece related, defer to Task 4** — do NOT regenerate them now.

- [ ] **Step 8: Stop for user review and commit.** Do NOT start Task 4 until the user signs off.

Suggested commit message: `Shape: anchor-aware SVG rendering`

---

## Task 4: `Piece.Floating` anchor-on-cursor

Replace the bbox-centring `-translate-x-1/2 -translate-y-1/2` with a half-cell translate so the anchor cell's centre is on the cursor.

**Files:**

- Modify: `src/Piece.mlx`
- Modify: `tests/components/PieceFloating.spec.tsx`

- [ ] **Step 1: Update CT test to assert the new transform**

In `tests/components/PieceFloating.spec.tsx`, replace the file's contents with:

```tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { PieceFloating } from "./wrappers";

test.describe("Piece.Floating Component", () => {
  test("starts at initial position then follows mouse, with anchor-centring transform", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <PieceFloating piece="Snake" initial={{ x: 120, y: 80 }} />,
    );

    // Should be visible immediately at initial position
    await expect(component).toBeVisible();
    await expect(component).toHaveCSS("left", "120px");
    await expect(component).toHaveCSS("top", "80px");

    // Anchor-centring: half-cell translate (cellSize=66 → 33px each).
    // CSS transforms are computed to a matrix; assert the resolved form.
    await expect(component).toHaveCSS(
      "transform",
      "matrix(1, 0, 0, 1, -33, -33)",
    );

    // After mouse moves, should follow mouse
    await page.mouse.move(200, 150);
    await expect(component).toHaveCSS("left", "200px");
    await expect(component).toHaveCSS("top", "150px");
  });

  test("floating piece snapshot", async ({ mount }) => {
    const component = await mount(
      <PieceFloating piece="Snake" initial={{ x: 100, y: 100 }} />,
    );
    await expect(component).toHaveScreenshot("floating-snake.png");
  });
});
```

- [ ] **Step 2: Run CT — expect failure**

```
pnpm test:ct
```

Expected: the new transform assertion fails (current transform is `matrix(1, 0, 0, 1, -<bboxHalfX>, -<bboxHalfY>)`, not `-33, -33`). The snapshot test may also fail.

- [ ] **Step 3: Update `Piece.Floating`**

In `src/Piece.mlx`, replace the `Floating` module with:

```ocaml
module Floating = struct
  let cellSize = 66
  let halfCell = cellSize / 2

  let[@react.component] make ~(piece:t) ~(initial:Geometry.coord) () =
    let pos = Option.value (Hooks.useMouse ()) ~default:initial in
    let style = ReactDOM.Style.make
      ~left:(Printf.sprintf "%dpx" pos.x)
      ~top:(Printf.sprintf "%dpx" pos.y)
      ~transform:(Printf.sprintf "translate(-%dpx, -%dpx)" halfCell halfCell)
      ()
    in
    <div style className="floating-piece fixed pointer-events-none">
      <Shape t=(Shape.of_piece piece) cellSize className="fill-rose-400/40" />
    </div>
end
```

Notes:

- The Tailwind `-translate-x-1/2 -translate-y-1/2` classes are removed.
- The translate is now expressed inline via the `transform` style, half a cell in each axis (33px for `cellSize=66`).

- [ ] **Step 4: Run build**

```
pnpm build
```

Expected: clean build.

- [ ] **Step 5: Run CT tests — transform passes, regen snapshot**

```
pnpm test:ct
```

Expected:

- The transform assertion passes.
- The `floating-snake.png` snapshot test fails (visuals changed because the SVG anchor moved combined with the new translate).

Regenerate:

```
pnpm test:snap
```

Open the new `floating-snake.png` and confirm it looks right (the anchor cell of the Snake should be centred at the assertion point). Re-run `pnpm test:ct`; expect green.

- [ ] **Step 6: Run e2e — expect green, regen any deferred snapshots**

```
pnpm test:e2e
```

Expected: `piece-interaction.spec.ts` passes (CSS `left`/`top` still match the cursor).

If any e2e snapshots were deferred from Task 3 because of the floating piece, regen them now via `pnpm test:snap` and visually confirm they look right.

- [ ] **Step 7: Stop for user review and commit.** Do NOT start Task 5 until the user signs off.

Suggested commit message: `Piece.Floating: anchor-on-cursor positioning`

---

## Task 5: `Board` hover + highlight wiring (Tile + Board + CT tests)

`Tile` gains `?highlighted` and `~onEnter`. `Board` gains `?onCellHover` and `?highlight`, threads `(row, col)` through each render block, and clears hover via a board-container `onMouseLeave`. Three CT tests cover the new behaviour.

**Files:**

- Modify: `src/Board.mlx`
- Modify: `src/Board.mli`
- Modify: `tests/components/Board.spec.tsx`

- [ ] **Step 1: Write the three failing CT tests**

In `tests/components/Board.spec.tsx`, append the following inside the `test.describe('Board Component', ...)` block (just before the closing `})`):

```tsx
test("onCellHover fires with tile index on tile mouseEnter", async ({
  mount,
}) => {
  const calls: Array<number | null> = [];
  const component = await mount(
    <Board
      onCellHover={(tile: number | undefined) => calls.push(tile ?? null)}
    />,
  );

  // Hover Jan: tile 0
  await component.getByText("Jan", { exact: true }).hover();
  expect(calls.at(-1)).toBe(0);

  // Hover day "15": tile 26 (months 0-11, days start at 12, day d → 11 + d)
  await component.getByText("15", { exact: true }).hover();
  expect(calls.at(-1)).toBe(26);
});

test("onCellHover fires None on board mouseLeave", async ({ mount, page }) => {
  const calls: Array<number | null> = [];
  const component = await mount(
    <Board
      onCellHover={(tile: number | undefined) => calls.push(tile ?? null)}
    />,
  );

  await component.getByText("Jan", { exact: true }).hover();
  expect(calls.at(-1)).toBe(0);

  // Move the cursor outside the board. `steps` is required: React's synthetic
  // mouseleave needs intermediate mousemove events to detect the exit.
  await page.mouse.move(0, 0, { steps: 10 });
  expect(calls.at(-1)).toBeNull();
});

test("highlight prop highlights only the matching tile", async ({ mount }) => {
  // @ts-expect-error Melange output has no type declarations
  const { of_piece } = await import("../../src/Shape.js");
  // Sep is tile 8 (Jan=0..Jun=5, Jul=6, Aug=7, Sep=8).
  const component = await mount(<Board highlight={[of_piece("Rect"), 8]} />);

  const sep = component.getByText("Sep", { exact: true }).locator("..");
  const jan = component.getByText("Jan", { exact: true }).locator("..");

  await expect(sep).toHaveClass(/bg-amber-600/);
  await expect(jan).toHaveClass(/bg-amber-900/);
});
```

Note on the `highlight` prop shape: Melange surfaces an OCaml `(Shape.t * int) option` from TS as a 2-element array `[shape, tile]`. Verified working without adjustment.

- [ ] **Step 2: Run CT — expect all three new tests fail**

```
pnpm test:ct
```

Expected: new tests fail because Board doesn't accept `onCellHover` or `highlight`. (TypeScript will likely flag them as unknown props; either way the tests don't pass.)

- [ ] **Step 3: Update `src/Board.mli`**

Replace the contents with:

```ocaml
(** Tiles are addressed by their position in a flat sequence:
    months 0–11 (Jan=0 .. Dec=11) followed by days 12–42 (1=12 .. 31=42). *)

val makeProps :
  ?onCellHover:(int option -> unit) ->
  ?highlight:(Shape.t * int) option ->
  ?key:string ->
  unit ->
  < onCellHover : (int option -> unit) option;
    highlight   : (Shape.t * int) option option > Js.t

val make :
  < onCellHover : (int option -> unit) option;
    highlight   : (Shape.t * int) option option > Js.t ->
  React.element
```

- [ ] **Step 4: Update `Tile` and `make` in `src/Board.mlx`**

Replace `module Tile` with:

```ocaml
module Tile = struct
  let[@react.component] make
      ~(children: string)
      ?(highlighted = false)
      ~(onEnter: unit -> unit)
      () =
    let bg = if highlighted then "bg-amber-600" else "bg-amber-900" in
    <div
      className=("tile " ^ tileSq ^ " " ^ bg ^ " p-0.5")
      onMouseEnter=(fun _ -> onEnter ())
    >
      <div className="h-full border border-dashed border-amber-700 rounded-sm flex items-center justify-center text-2xl text-amber-950 font-bold cursor-default select-none">
        (React.string children)
      </div>
    </div>
end
```

Replace the `make` function with:

```ocaml
let[@react.component] make
    ?(onCellHover = fun _ -> ())
    ?(highlight = None)
    () =
  let highlighted_tile = match highlight with
    | Some (_, tile) -> Some tile
    | None -> None
  in
  let is_highlighted tile = highlighted_tile = Some tile in
  let onTileEnter tile () = onCellHover (Some tile) in

  <div
    className="board flex flex-col"
    onMouseLeave=(fun _ -> onCellHover None)
  >
    (* Row 1: Jan-Jun (tiles 0-5) *)
    <Row>
      (Array.sub months 0 6
       |> Array.mapi (fun i m ->
         let tile = i in
         <Tile
           key=("month-" ^ m)
           highlighted=(is_highlighted tile)
           onEnter=(onTileEnter tile)
         >m</Tile>)
       |> React.array)
    </Row>

    (* Row 2: Jul-Dec (tiles 6-11) *)
    <Row>
      (Array.sub months 6 6
       |> Array.mapi (fun i m ->
         let tile = 6 + i in
         <Tile
           key=("month-" ^ m)
           highlighted=(is_highlighted tile)
           onEnter=(onTileEnter tile)
         >m</Tile>)
       |> React.array)
    </Row>

    (* Rows 3-6: Days 1-28, 7 per row (tiles 12-39) *)
    (Array.init 4 (fun row ->
      let start_day = row * 7 + 1 in
      <Row key=(Printf.sprintf "days-row-%d" row)>
        (Array.init 7 (fun i ->
          let day = start_day + i in
          let tile = 12 + row * 7 + i in
          <Tile
            key=(Printf.sprintf "day-%d" day)
            highlighted=(is_highlighted tile)
            onEnter=(onTileEnter tile)
          >(string_of_int day)</Tile>
        ) |> React.array)
      </Row>
    ) |> React.array)

    (* Row 7: Days 29-31 (tiles 40-42) *)
    <Row>
      (Array.init 3 (fun i ->
        let day = 29 + i in
        let tile = 40 + i in
        <Tile
          key=(Printf.sprintf "day-%d" day)
          highlighted=(is_highlighted tile)
          onEnter=(onTileEnter tile)
        >(string_of_int day)</Tile>
      ) |> React.array)
    </Row>
  </div>
```

The `Shape.t` component of `highlight` is unused at runtime — only the position drives the single-cell highlight. That's intentional per the spec; later iterations (multi-cell highlight, silhouette overlay) will use it.

- [ ] **Step 5: Run build**

```
pnpm build
```

Expected: clean build.

- [ ] **Step 6: Run CT — expect all three new tests pass; default snapshot unchanged**

```
pnpm test:ct
```

Expected:

- The three new behavioural tests pass.
- Existing Board tests pass.
- `board.png` snapshot is unchanged (default `highlighted=false` everywhere produces identical visuals).

If the `highlight` test fails because the prop shape doesn't match, inspect `src/Board.js` to see how Melange destructures the runtime value and adjust the test's argument shape accordingly.

- [ ] **Step 7: Run dune and e2e — expect green**

```
pnpm test:dune
pnpm test:e2e
```

Expected: all tests pass (Game still passes `<Board />` without the new props, so default behaviour applies).

- [ ] **Step 8: Stop for user review and commit.** Do NOT start Task 6 until the user signs off.

Suggested commit message: `Board: hover + single-cell highlight`

---

## Task 6: `Game` `placement` record + e2e snap tests

Refactor `Game` state from `selected` to a single `placement` record (impossible "hover-without-selection" combo unrepresentable). Wire `onCellHover` and compose `highlight`. Add three e2e tests covering snap-on-hover behaviour.

**Files:**

- Modify: `src/Game.mlx`
- Modify: `tests/e2e/piece-interaction.spec.ts`

- [ ] **Step 1: Write the three failing e2e tests**

In `tests/e2e/piece-interaction.spec.ts`, append the following inside the `test.describe('Piece Interaction', ...)` block (before the closing `})`):

```ts
test('hovering after select highlights the cell under the cursor', async ({ page }) => {
  await page.goto('/')

  // Select a piece (Z).
  await page.locator('.piece-btn').nth(6).click()

  // Hover Jan; that tile should pick up the highlighted background.
  const jan = page.getByText('Jan', { exact: true }).locator('..')
  await jan.hover()
  await expect(jan).toHaveClass(/bg-amber-600/)

test('moving the cursor updates the highlighted tile', async ({ page }) => {
  await page.goto('/')

  await page.locator('.piece-btn').nth(0).click()

  const day10 = page.getByText('10', { exact: true }).locator('..')
  const day11 = page.getByText('11', { exact: true }).locator('..')

  await day10.hover()
  await expect(day10).toHaveClass(/bg-amber-600/)

  await day11.hover()
  await expect(day11).toHaveClass(/bg-amber-600/)
  await expect(day10).toHaveClass(/bg-amber-900/)
})

test('moving the cursor off the board clears the highlight', async ({ page }) => {
  await page.goto('/')

  await page.locator('.piece-btn').nth(6).click()

  const jan = page.getByText('Jan', { exact: true }).locator('..')
  await jan.hover()
  await expect(jan).toHaveClass(/bg-amber-600/)

  // Move outside the board entirely. `steps` is required: React's synthetic
  // mouseleave needs intermediate mousemove events to detect the exit.
  await page.mouse.move(5, 5, { steps: 10 })
  await expect(jan).toHaveClass(/bg-amber-900/)
})

test('hovering with no piece selected does not highlight any tile', async ({ page }) => {
  await page.goto('/')

  const jan = page.getByText('Jan', { exact: true }).locator('..')
  await jan.hover()
  await expect(jan).toHaveClass(/bg-amber-900/)

  const day1 = page.getByText('1', { exact: true }).locator('..')
  await day1.hover()
  await expect(day1).toHaveClass(/bg-amber-900/)
})
```

Note: `.locator('..')` walks up to the outer Tile div that carries the `bg-amber-*` class. If it doesn't match the right element, switch to `xpath=ancestor::div[contains(@class, "tile")]`.

- [ ] **Step 2: Run e2e — expect failures**

```
pnpm test:e2e
```

Expected: the three new tests fail. The first two fail because Game doesn't yet wire `Board`'s hover/highlight props — so no tile ever picks up `bg-amber-600`. The third should pass already (Board defaults to no highlight when `highlight` isn't passed), but verify.

- [ ] **Step 3: Rewrite `Game.make`**

Replace the entire contents of `src/Game.mlx` with:

```ocaml
open Fun

type placement = {
  piece    : Shape.piece;
  initial  : Geometry.coord;
  hovered  : int option;  (* Board tile index — see Board.mli *)
}

module PieceSelectPanel = struct
  let[@react.component] make ~onPieceSelect () =
    <div className="panel bg-rose-900/60 border border-rose-800 rounded-lg px-4 py-8 grid gap-4 grid-cols-2 align-items-center justify-items-center">
      ([| `Rect; `Thumb; `L; `Snake; `T; `U; `Z; `Corner |]
        |> Array.map (fun t -> <Piece.Button t key=(Shape.string_of_piece t) onSelect=onPieceSelect />)
      |> React.array)
    </div>
end

let[@react.component] make () =
  let (placement, setPlacement) = React.useState @@ Fn.const None in

  let onPieceSelect (piece, initial) =
    setPlacement @@ Fn.const (Some { piece; initial; hovered = None })
  in

  let onCellHover hovered =
    setPlacement (Option.map (fun p -> { p with hovered }))
  in

  let onClickAnywhere _ = setPlacement @@ Fn.const None in

  let highlight = match placement with
    | Some { piece; hovered = Some pos; _ } ->
        Some (Shape.of_piece piece, pos)
    | _ -> None
  in

  <div className="flex items-center justify-center min-h-screen" onClick=onClickAnywhere>
    <div className="flex items-start justify-center gap-12">
      <Board onCellHover highlight />
      <PieceSelectPanel onPieceSelect />
    </div>
    (match placement with
     | Some { piece; initial; _ } -> <Piece.Floating piece initial />
     | None -> React.null)
  </div>
```

Notes:

- `placement` is local to this file — no mli change.
- Selecting a new piece resets `hovered = None`. The cursor is on the panel at click time; the next `mouseEnter` over the board populates it.

- [ ] **Step 4: Run build**

```
pnpm build
```

Expected: clean build.

- [ ] **Step 5: Run e2e — expect all three new tests green**

```
pnpm test:e2e
```

Expected: all e2e tests pass — both existing and new. If the Tile-class selector doesn't match, adjust the locator and re-run.

- [ ] **Step 6: Run full suite**

```
pnpm test
```

Expected: every layer green — `pnpm test:dune`, `pnpm test:ct`, `pnpm test:e2e`.

- [ ] **Step 7: Snapshot regen check**

If any snapshots changed unexpectedly during this task, investigate before regenerating. If they're intentional, run:

```
pnpm test:snap
```

Confirm only expected snapshots updated.

- [ ] **Step 8: Stop for user review and commit.** This is the final task — confirm with the user that the feature is working end-to-end before considering the plan complete.

Suggested commit message: `Game: placement record + snap-on-hover behaviour`

---

## Self-Review Notes

Coverage check against the spec sections:

- §2 Shape representation → Tasks 1, 2, 3.
- §3 Piece.Floating → Task 4.
- §4 Board → Task 5.
- §5 Game → Task 6.
- §7.1 Dune/Fest tests → Tasks 1 (test updates), 2 (anchor + cells + invariants).
- §7.2 CT tests → Tasks 3 (Shape viewBox), 4 (PieceFloating transform + snapshot regen), 5 (Board hover + highlight).
- §7.3 E2E tests → Task 6.
- §6 Deferred items → not implemented (intentionally).

No placeholder text. Type signatures used in later tasks (`Shape.cells`, `Shape.anchor`, `Board.makeProps`'s `onCellHover` / `highlight`, `Game.placement`) are introduced before they're consumed. Each task ends with a "Stop for user review" gate.
