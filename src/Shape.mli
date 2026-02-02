(** A shape is a 2D grid geometry of filled/empty cells *)

type piece = [
  | `Rect
  | `Thumb
  | `Corner
  | `Snake
  | `U
  | `L
  | `T
  | `Z
]

type t

val of_piece : piece -> t

val string_of_piece : piece -> string

val makeProps :
  t:t ->
  ?cellSize:int ->
  ?className:string ->
  ?key:string ->
  unit ->
  < t : t ; cellSize : int option ; className : string option > Js.t

val make :
  < t : t ; cellSize : int option ; className : string option > Js.t ->
  React.element
