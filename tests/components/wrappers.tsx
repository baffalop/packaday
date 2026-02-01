import React from 'react'
// @ts-expect-error Melange output has no type declarations
import { make as BoardComponent, makeProps } from '../../src/Board.js'
// @ts-expect-error Melange output has no type declarations
import { Button } from '../../src/Piece.js'

export function Board () {
  return React.createElement(BoardComponent, makeProps(undefined, undefined))
}

export function PieceButton ({ t }: { t: string }) {
  return React.createElement(Button.make, Button.makeProps(t, undefined))
}
