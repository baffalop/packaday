# Piece snapping — design

## 1. Scope

When a piece is selected, hovering the board highlights a single cell — the
cell where the piece's *anchor* would land if dropped. The floating piece
keeps following the cursor, but with its anchor (not bounding-box centre) on
the cursor, so the ghost and the highlighted cell visually agree.

Out of scope for this iteration:

- Click-to-place
- Validating board edges or piece overlap
- Highlighting all cells the piece would occupy (multi-cell highlight)
- Rendering the piece silhouette as a board-side overlay
- Touch / mobile

The data model and component APIs are forward-shaped so each of these
extensions lands without breaking the snap pipeline.

## 2. `Shape` representation

### 2.1 The anchor as a third `segment` variant

```ocaml
type segment = O | H | X   (** O empty, H filled, X filled-and-anchor *)
```

`Shape.t` remains `segment array array`. Each piece definition picks exactly
one cell to be `X` — the visual centre the user grabs by. Designer's choice
per piece (which cell looks like the natural hand-grip); the choices are
recorded only in `of_piece`.

For `Thumb`, for example:

```
.  H
H  X
H  H
```

Rotation and flips are unchanged: they operate on the matrix; `X` rides
along.

### 2.2 New helpers

```ocaml
val anchor : t -> int * int
(** (row, col) of the X cell within the matrix. Raises if not found. *)

val cells : t -> (int * int) list
(** Offsets (dx, dy) from the anchor for every filled cell, including the
    anchor itself at (0, 0). *)
```

`anchor` is implemented by linear scan and `Option.get` (or equivalent
unwrap). The "exactly one X" invariant is covered by tests, not by an
explicit runtime assert.

### 2.3 Anchor-aware SVG rendering

`Shape.make` no longer iterates rows/cols directly to render. It uses
`cells` to produce a bounding box `(min_dx, min_dy)..(max_dx, max_dy)` and
sets:

- `width  = (max_dx - min_dx + 1) * cellSize`
- `height = (max_dy - min_dy + 1) * cellSize`
- `viewBox = "min_dx*cellSize  min_dy*cellSize  width  height"`
- Each rect is rendered at `(dx * cellSize, dy * cellSize)`

The shifted viewBox means SVG coord `(0, 0)` is the top-left of the anchor
cell. Element-positioning consumers (the floating piece) line the anchor up
by positioning the SVG itself; the SVG body knows nothing about the cursor.

### 2.4 Tests

- `anchor` returns the right `(row, col)` for several pieces.
- `cells` returns the expected offset list (including `(0, 0)`).
- Rotation preserves the presence of `X` in the rotated matrix.
- The "exactly one X" invariant holds for every piece (test iterates the
  full piece list).

## 3. `Piece.Floating`

Today the wrapper uses `-translate-x-1/2 -translate-y-1/2` to centre the
SVG bounding box on the cursor. With anchor-aware rendering, the SVG places
its anchor cell's top-left at SVG `(0, 0)`, so we replace the
bounding-box-relative translate with a half-cell translate that puts the
anchor cell *centre* on the cursor:

```text
style: { left: cursorX, top: cursorY,
         transform: translate(-cellSize/2, -cellSize/2) }
```

`pointer-events-none` and `position: fixed` stay. No bounding-box arithmetic.

## 4. `Board`

Minimum changes to support hover and a single-cell highlight; deeper
restructuring (see §6) is deferred.

### 4.1 Per-tile position threading

The four existing render blocks each iterate over indices that map cleanly
to `(row, col)`:

- Block 1 (Jan-Jun): `(0, col)` for `col ∈ 0..5`
- Block 2 (Jul-Dec): `(1, col)` for `col ∈ 0..5`
- Block 3 (days 1-28): `(row + 2, col)` over `Array.init 4 ... Array.init 7`
- Block 4 (days 29-31): `(6, col)` for `col ∈ 0..2`

Each tile receives its `(row, col)` via the closures already constructed in
each block.

### 4.2 New props

```ocaml
?onCellHover : ((int * int) option -> unit)
(** Fires Some (r, c) on cell mouseEnter, None on board-container mouseLeave.
    Default: ignore. *)

?highlight   : (Shape.t * (int * int)) option
(** Future-shaped: tells Board "highlight this Shape at this anchor cell".
    For this iteration, Board ignores the [Shape.t] component and tile-level
    highlights only the (int * int) cell. Default: None. *)
```

### 4.3 `Tile`

```ocaml
?highlighted : bool                (* swap bg-amber-900 to a brighter shade *)
~onEnter     : unit -> unit        (* wired to onMouseEnter *)
```

Visual treatment for `highlighted` is a colour swap on the outer tile
background; final shade tuned during implementation.

### 4.4 Board outer wrapper

A single `onMouseLeave = fun _ -> onCellHover None` on the outer `<div>`
clears hover when the cursor exits the grid. Inter-tile movement is handled
by the next tile's `onMouseEnter`.

The floating piece is already `pointer-events-none`, so `mouseEnter` on
tiles fires through it — no changes needed there.

## 5. `Game`

### 5.1 State: a single `placement` value

```ocaml
type placement = {
  piece    : Shape.piece;
  initial  : Geometry.coord;       (* fallback for Piece.Floating before *)
                                   (* the first mousemove *)
  hovered  : (int * int) option;   (* current hovered cell, if any *)
}
```

Rationale: combining `selected` and `hoveredCell` into one record makes the
"impossible" combination (no piece selected but a hovered cell present)
unrepresentable. The `hovered` field is only meaningful while a piece is
being placed; making it a sub-field of `placement` enforces that.

If a future feature needs board-cell hover *independent* of placement,
we'll lift it then.

### 5.2 Wiring

```ocaml
let (placement, setPlacement) = React.useState (Fn.const None) in

let highlight = match placement with
  | Some { piece; hovered = Some pos; _ } ->
      Some (Shape.of_piece piece, pos)
  | _ -> None
in

let onPieceSelect (piece, initial) =
  setPlacement (Fn.const (Some { piece; initial; hovered = None }))
in

let onCellHover hovered =
  setPlacement (Option.map (fun p -> { p with hovered }))
in

let onClickAnywhere _ = setPlacement (Fn.const None) in

<Board onCellHover highlight />
<PieceSelectPanel onPieceSelect />
(match placement with
 | Some { piece; initial; _ } -> <Piece.Floating piece initial />
 | None -> React.null)
```

Click-anywhere-to-cancel is unchanged. Selecting a new piece resets
`hovered = None` (cursor is on the panel at click time, not on the board;
the next `mouseEnter` will populate it).

## 6. Deferred / future considerations

These are intentionally not implemented now, but the API shape above leaves
clean entry points for each.

### 6.1 Multi-cell tile highlight

Once the single-cell version is working, extend Board to project via
`Shape.cells`: highlight every `(r + dy, c + dx)` for `(dx, dy)` in
`Shape.cells`. No prop changes — Board starts using the `Shape.t` component
of `highlight`.

Out-of-board projected cells silently don't render (no tile exists there),
which may be acceptable until validation lands.

### 6.2 Piece silhouette overlay (B)

Render the actual piece shape — not tile-level highlights — as a coloured
overlay anchored to a board cell. Two implementation options:

- A second `Shape.make` instance positioned over the board, anchor-locked
  to a cell's screen coordinates. Likely needs the unified iteration
  (§6.4) to compute that screen position cleanly.
- An SVG layer co-located with the board grid.

Same `highlight` prop drives it.

### 6.3 Validation

- Edges: a projected cell falls outside the board's set of valid `(row,
  col)` positions.
- Overlap: a projected cell collides with already-placed pieces.

When validation fails, the highlight (or silhouette) renders in a
"rejected" colour. The validation predicate is naturally a function of the
piece, the anchor cell, and the current placed-pieces state.

### 6.4 Unified board iteration

The four-block render structure scatters `(row, col)` knowledge across
disjoint code paths. A single 7×7 iteration driven by

```ocaml
val cellLabel : int * int -> string option
(** Returns Some label for cells that exist; None for empty positions. *)
```

would centralise this. Empty positions render nothing; the existing visual
layout (left-aligned months and last-day rows) is preserved. Worth doing
when we move to the silhouette overlay or anything that needs to address
the grid uniformly.

### 6.5 Touch / mobile

`mouseEnter` does not fire on touch. A touch-equivalent path will need
`touchmove` listeners on the board and per-event hit-testing against tile
bounding boxes (or `document.elementFromPoint`). Out of scope here, but
none of the design choices above preclude it.

## 7. Test plan

OCaml-side tests (Fest):

- Shape: `anchor`, `cells`, "exactly one X" invariant across all pieces,
  rotation preserves `X`.

Component-level checks (visual / manual for this iteration):

- Selecting a piece, hovering the board: the cell directly under the
  cursor highlights; the floating ghost's anchor cell sits over the same
  cell.
- Moving between tiles: highlight follows.
- Cursor leaves the board: highlight clears.
- Selecting nothing (or after click-cancel): no highlight even when
  hovering the board.
- Visual snapshot of the new Shape SVG output (anchor-aware viewBox).

`pnpm build` and `pnpm test`/`pnpm test:snap` per project conventions.
