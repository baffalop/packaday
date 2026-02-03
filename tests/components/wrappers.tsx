// @ts-expect-error Melange output has no type declarations
import { Button as Piece$Button, Floating as Piece$Floating } from '../../src/Piece.js'
// @ts-expect-error Melange output has no type declarations
export { make as Shape } from '../../src/Shape.js'
// @ts-expect-error Melange output has no type declarations
export { make as Board } from '../../src/Board.js'

export const PieceButton = Piece$Button.make
export const PieceFloating = Piece$Floating.make
