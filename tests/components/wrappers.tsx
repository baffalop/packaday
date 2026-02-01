import React from 'react'
import { make as BoardComponent, makeProps } from '../../_build/default/src/output/src/Board.js'

export function Board () {
  return React.createElement(BoardComponent, makeProps(undefined, undefined))
}
