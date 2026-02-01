import React from 'react'
// @ts-expect-error Melange output has no type declarations
import { make as BoardComponent, makeProps } from '../../src/Board.js'

export function Board () {
  return React.createElement(BoardComponent, makeProps(undefined, undefined))
}
