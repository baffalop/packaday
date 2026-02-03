(* Board component test - OCaml/Melange version *)

open Playwright

let run_tests (helpers : test_helpers) =
  helpers##test "renders calendar board (OCaml)" (fun fixtures ->
      fixtures##mount helpers##board
      |> Js.Promise.then_ (fun component ->
             helpers##expect component |> to_be_visible));
  helpers##test "displays month names (OCaml)" (fun fixtures ->
      fixtures##mount helpers##board
      |> Js.Promise.then_ (fun component ->
             let jan = get_by_text component "Jan" in
             helpers##expect jan |> to_be_visible))
