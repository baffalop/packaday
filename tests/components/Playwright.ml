(* Playwright bindings for component testing *)

(* Promise let-binding for cleaner async code *)
let (let>) f g = Js.Promise.then_ g f

type locator
type locator_assertions
type page
type mouse

(* Options for getByText *)
type get_by_text_options

external get_by_text_options : ?exact:bool -> unit -> get_by_text_options = "" [@@mel.obj]

(* Page mouse *)
external mouse : page -> mouse = "mouse" [@@mel.get]
external mouse_move : mouse -> int -> int -> unit Js.Promise.t = "move" [@@mel.send]

(* Fixtures - passed to test callback *)
type fixtures =
  < mount : string -> locator Js.Promise.t [@mel.meth]
  ; page : page
  >
  Js.t

(* Test helpers passed from the .spec.tsx wrapper *)
type test_helpers =
  < board : string
  ; test : string -> (fixtures -> unit Js.Promise.t) -> unit [@mel.meth]
  ; expect : locator -> locator_assertions [@mel.meth]
  ; describe : string -> (unit -> unit) -> unit [@mel.meth]
  >
  Js.t

(* Locator methods *)
external click : locator -> unit Js.Promise.t = "click" [@@mel.send]
external hover : locator -> unit Js.Promise.t = "hover" [@@mel.send]
external get_by_text : locator -> string -> locator = "getByText" [@@mel.send]
external get_by_text_opt : locator -> string -> get_by_text_options -> locator = "getByText" [@@mel.send]
external locator_ : locator -> string -> locator = "locator" [@@mel.send]
external first : locator -> locator = "first" [@@mel.send]

(* Assertions - async *)
external to_be_visible : locator_assertions -> unit Js.Promise.t = "toBeVisible"
  [@@mel.send]

external to_have_count : locator_assertions -> int -> unit Js.Promise.t
  = "toHaveCount"
  [@@mel.send]

external to_have_screenshot : locator_assertions -> string -> unit Js.Promise.t
  = "toHaveScreenshot"
  [@@mel.send]

external to_have_attribute : locator_assertions -> string -> string -> unit Js.Promise.t
  = "toHaveAttribute"
  [@@mel.send]

external to_have_class : locator_assertions -> string -> unit Js.Promise.t
  = "toHaveClass"
  [@@mel.send]

external to_have_css : locator_assertions -> string -> string -> unit Js.Promise.t
  = "toHaveCSS"
  [@@mel.send]
