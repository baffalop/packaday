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

val anchor : t -> int * int
(** [(row, col)] of the X cell. Raises if absent. *)

val cells : t -> (int * int) list
(** Offsets [(dx, dy)] from the anchor for every filled cell, including
    the anchor itself at [(0, 0)]. *)

val string_of_piece : piece -> string

val rotate_cw : t -> t
val rotate_ccw : t -> t
val flip_horiz : t -> t
val flip_vert : t -> t

val variations : piece -> t array

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
