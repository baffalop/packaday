type t = [
  | `Rect
  | `Thumb
  | `Corner
  | `Snake
  | `U
  | `L
  | `T
  | `Z
]

module Shape : sig
  val makeProps : t:t -> ?cellSize:int -> ?className:string -> ?key:string -> unit -> < t:t; cellSize:int option; className:string option > Js.t
  val make : < t:t; cellSize:int option; className:string option > Js.t -> React.element
end

module Button : sig
  val makeProps : t:t -> ?onSelect:(t -> unit) -> ?key:string -> unit -> < t:t; onSelect:(t -> unit) option > Js.t
  val make : < t:t; onSelect:(t -> unit) option > Js.t -> React.element
end

module Panel : sig
  val makeProps : ?onPieceSelect:(t -> unit) -> ?key:string -> unit -> < onPieceSelect:(t -> unit) option > Js.t
  val make : < onPieceSelect:(t -> unit) option > Js.t -> React.element
end

module Floating : sig
  val makeProps : piece:t -> ?key:string -> unit -> < piece:t > Js.t
  val make : < piece:t > Js.t -> React.element
end
