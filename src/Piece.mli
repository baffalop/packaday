type t = Shape.piece

module Button : sig
  val makeProps : t:t -> ?onSelect:((t * Geometry.coord) -> unit) -> ?key:string -> unit -> < t:t; onSelect:((t * Geometry.coord) -> unit) option > Js.t
  val make : < t:t; onSelect:((t * Geometry.coord) -> unit) option > Js.t -> React.element
end

module Panel : sig
  val makeProps : ?onPieceSelect:((t * Geometry.coord) -> unit) -> ?key:string -> unit -> < onPieceSelect:((t * Geometry.coord) -> unit) option > Js.t
  val make : < onPieceSelect:((t * Geometry.coord) -> unit) option > Js.t -> React.element
end

module Floating : sig
  val makeProps : piece:t -> initial:Geometry.coord -> ?key:string -> unit -> < piece:t; initial:Geometry.coord > Js.t
  val make : < piece:t; initial:Geometry.coord > Js.t -> React.element
end
