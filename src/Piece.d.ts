import type { FC } from 'react'

export type Piece = 'L' | 'T' | 'U' | 'Z' | 'Snake' | 'Thumb' | 'Rect' | 'Corner'
type Position = { x: number; y: number }

export declare const Button: {
  make: FC<{ t: Piece; onSelect: (arg: [Piece, Position]) => void }>
}

export declare const Floating: {
  make: FC<{ piece: Piece; initial: Position }>
}
