import React from 'react'
// @ts-expect-error Melange output has no type declarations
import { make as BoardComponent, makeProps } from '../../src/Board.js'
// @ts-expect-error Melange output has no type declarations
import { Button, Shape, Floating } from '../../src/Piece.js'

export function Board () {
  return React.createElement(BoardComponent, makeProps(undefined, undefined))
}

type Coord = { x: number, y: number }

export function PieceButton ({ t, onSelect }: { t: string, onSelect?: (args: [string, Coord]) => void }) {
  return React.createElement(Button.make, Button.makeProps(t, onSelect, undefined, undefined))
}

export function PieceShape ({ t, cellSize, className }: { t: string, cellSize?: number, className?: string }) {
  return React.createElement(Shape.make, Shape.makeProps(t, cellSize, className, undefined, undefined))
}

export function PieceFloating ({ piece, initial }: { piece: string, initial: Coord }) {
  return React.createElement(Floating.make, Floating.makeProps(piece, initial, undefined, undefined))
}
