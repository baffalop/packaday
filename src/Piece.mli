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

type segment = O | H
type shape_spec = segment Array.t Array.t

val spec_of_t : t -> shape_spec

module Shape : sig
  val cell_size : int
  val makeProps : t:t -> ?key:string -> unit -> < t:t > Js.t
  val make : < t:t > Js.t -> React.element
end

module Button : sig
  val makeProps : t:t -> ?key:string -> unit -> < t:t > Js.t
  val make : < t:t > Js.t -> React.element
end
