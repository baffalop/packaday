(* Board component tests *)

open Playwright

let months = [| "Jan"; "Feb"; "Mar"; "Apr"; "May"; "Jun";
                "Jul"; "Aug"; "Sep"; "Oct"; "Nov"; "Dec" |]

let run_tests (helpers : test_helpers) =
  helpers##describe "Board Component" (fun () ->
    helpers##test "renders board" (fun fixtures ->
        fixtures##mount helpers##board
        |> Js.Promise.then_ (fun component ->
               helpers##expect component |> to_be_visible));

    helpers##test "month tiles display correctly" (fun fixtures ->
        fixtures##mount helpers##board
        |> Js.Promise.then_ (fun component ->
               let check_month i =
                 let month = months.(i) in
                 let el = get_by_text_opt component month (get_by_text_options ~exact:true ()) in
                 helpers##expect el |> to_be_visible
               in
               (* Check all 12 months sequentially *)
               check_month 0
               |> Js.Promise.then_ (fun () -> check_month 1)
               |> Js.Promise.then_ (fun () -> check_month 2)
               |> Js.Promise.then_ (fun () -> check_month 3)
               |> Js.Promise.then_ (fun () -> check_month 4)
               |> Js.Promise.then_ (fun () -> check_month 5)
               |> Js.Promise.then_ (fun () -> check_month 6)
               |> Js.Promise.then_ (fun () -> check_month 7)
               |> Js.Promise.then_ (fun () -> check_month 8)
               |> Js.Promise.then_ (fun () -> check_month 9)
               |> Js.Promise.then_ (fun () -> check_month 10)
               |> Js.Promise.then_ (fun () -> check_month 11)));

    helpers##test "day tiles display correctly" (fun fixtures ->
        fixtures##mount helpers##board
        |> Js.Promise.then_ (fun component ->
               let rec check_days day =
                 if day > 31 then Js.Promise.resolve ()
                 else
                   let el = get_by_text_opt component (string_of_int day) (get_by_text_options ~exact:true ()) in
                   helpers##expect el |> to_be_visible
                   |> Js.Promise.then_ (fun () -> check_days (day + 1))
               in
               check_days 1));

    helpers##test "correct total tile count" (fun fixtures ->
        fixtures##mount helpers##board
        |> Js.Promise.then_ (fun component ->
               let tiles = locator_ component ".tile" in
               (* 12 months + 31 days = 43 tiles *)
               to_have_count (helpers##expect tiles) 43));

    helpers##test "visual snapshot" (fun fixtures ->
        fixtures##mount helpers##board
        |> Js.Promise.then_ (fun component ->
               let jan = get_by_text component "Jan" in
               helpers##expect jan |> to_be_visible
               |> Js.Promise.then_ (fun () ->
                      let day31 = get_by_text_opt component "31" (get_by_text_options ~exact:true ()) in
                      helpers##expect day31 |> to_be_visible)
               |> Js.Promise.then_ (fun () ->
                      to_have_screenshot (helpers##expect component) "board.png"))))
