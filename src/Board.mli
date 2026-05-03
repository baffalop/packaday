val makeProps :
  ?onCellHover:((int * int) option -> unit) ->
  ?highlight:(Shape.t * (int * int)) option ->
  ?key:string ->
  unit ->
  < onCellHover : ((int * int) option -> unit) option;
    highlight   : (Shape.t * (int * int)) option option > Js.t

val make :
  < onCellHover : ((int * int) option -> unit) option;
    highlight   : (Shape.t * (int * int)) option option > Js.t ->
  React.element
