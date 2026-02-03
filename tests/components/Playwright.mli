(* Playwright bindings for component testing *)

type locator
type locator_assertions
type page
type mouse
type get_by_text_options

val get_by_text_options : ?exact:bool -> unit -> get_by_text_options

type fixtures =
  < mount : string -> locator Js.Promise.t [@mel.meth]
  ; page : page
  >
  Js.t

type test_helpers =
  < board : string
  ; test : string -> (fixtures -> unit Js.Promise.t) -> unit [@mel.meth]
  ; expect : locator -> locator_assertions [@mel.meth]
  ; describe : string -> (unit -> unit) -> unit [@mel.meth]
  >
  Js.t

(* Page mouse *)
val mouse : page -> mouse
val mouse_move : mouse -> int -> int -> unit Js.Promise.t

(* Locator methods *)
val click : locator -> unit Js.Promise.t
val hover : locator -> unit Js.Promise.t
val get_by_text : locator -> string -> locator
val get_by_text_opt : locator -> string -> get_by_text_options -> locator
val locator_ : locator -> string -> locator
val first : locator -> locator

(* Assertions *)
val to_be_visible : locator_assertions -> unit Js.Promise.t
val to_have_count : locator_assertions -> int -> unit Js.Promise.t
val to_have_screenshot : locator_assertions -> string -> unit Js.Promise.t
val to_have_attribute : locator_assertions -> string -> string -> unit Js.Promise.t
val to_have_class : locator_assertions -> string -> unit Js.Promise.t
val to_have_css : locator_assertions -> string -> string -> unit Js.Promise.t
