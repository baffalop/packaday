import type { FC } from 'react'

type Segment = 0 | 1
export type Shape = Segment[][]

export declare const make: FC<{ t: Shape; cellSize?: number; className?: string }>
