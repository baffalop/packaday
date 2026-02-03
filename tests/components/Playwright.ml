(* Minimal Playwright bindings for component testing *)

type locator
type locator_assertions
type page
type component

(* Fixtures - passed to test callback *)
(* mount takes a component name string, wrapper renders JSX *)
type fixtures =
  < mount : string -> locator Js.Promise.t [@mel.meth]
  ; page : page
  >
  Js.t

(* Test helpers passed from the .spec.tsx wrapper *)
type test_helpers =
  < board : string (* component name *)
  ; test : string -> (fixtures -> unit Js.Promise.t) -> unit [@mel.meth]
  ; expect : locator -> locator_assertions [@mel.meth]
  >
  Js.t

(* Locator methods *)
external click : locator -> unit Js.Promise.t = "click" [@@mel.send]
external hover : locator -> unit Js.Promise.t = "hover" [@@mel.send]
external get_by_text : locator -> string -> locator = "getByText" [@@mel.send]
external locator_ : locator -> string -> locator = "locator" [@@mel.send]

(* Assertions *)
external to_be_visible : locator_assertions -> unit Js.Promise.t = "toBeVisible"
  [@@mel.send]

external to_have_count : locator_assertions -> int -> unit Js.Promise.t
  = "toHaveCount"
  [@@mel.send]

external to_have_screenshot : locator_assertions -> string -> unit Js.Promise.t
  = "toHaveScreenshot"
  [@@mel.send]
