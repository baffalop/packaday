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
  val makeProps : t:t -> ?key:string -> unit -> < t:t > Js.t
  val make : < t:t > Js.t -> React.element
end

module Button : sig
  val makeProps : t:t -> ?key:string -> unit -> < t:t > Js.t
  val make : < t:t > Js.t -> React.element
end

module Panel : sig
  val makeProps : ?key:string -> unit -> <  > Js.t
  val make : <  > Js.t -> React.element
end
