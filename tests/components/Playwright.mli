(* Minimal Playwright bindings for component testing *)

type locator
type locator_assertions
type page
type component

type fixtures =
  < mount : string -> locator Js.Promise.t [@mel.meth]
  ; page : page
  >
  Js.t

type test_helpers =
  < board : string
  ; test : string -> (fixtures -> unit Js.Promise.t) -> unit [@mel.meth]
  ; expect : locator -> locator_assertions [@mel.meth]
  >
  Js.t

val click : locator -> unit Js.Promise.t
val hover : locator -> unit Js.Promise.t
val get_by_text : locator -> string -> locator
val locator_ : locator -> string -> locator

val to_be_visible : locator_assertions -> unit Js.Promise.t
val to_have_count : locator_assertions -> int -> unit Js.Promise.t
val to_have_screenshot : locator_assertions -> string -> unit Js.Promise.t
