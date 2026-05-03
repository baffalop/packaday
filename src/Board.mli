(** Tiles are addressed by their position in a flat sequence:
    months 0–11 (Jan=0 .. Dec=11) followed by days 12–42 (1=12 .. 31=42). *)

val makeProps :
  ?onCellHover:(int option -> unit) ->
  ?highlight:(Shape.t * int) option ->
  ?key:string ->
  unit ->
  < onCellHover : (int option -> unit) option;
    highlight   : (Shape.t * int) option option > Js.t

val make :
  < onCellHover : (int option -> unit) option;
    highlight   : (Shape.t * int) option option > Js.t ->
  React.element
