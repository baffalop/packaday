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

module Button : sig
  val makeProps : t:t -> ?key:string -> unit -> < t:t > Js.t
  val make : < t:t > Js.t -> React.element
end
