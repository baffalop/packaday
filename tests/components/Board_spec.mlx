(* Board component tests *)

open Playwright

let months = [| "Jan"; "Feb"; "Mar"; "Apr"; "May"; "Jun";
                "Jul"; "Aug"; "Sep"; "Oct"; "Nov"; "Dec" |]

let run_tests (helpers : test_helpers) =
  helpers##describe "Board Component" (fun () ->
    helpers##test "renders board" (fun fixtures ->
      let> component = fixtures##mount helpers##board in
      helpers##expect component |> to_be_visible);

    helpers##test "month tiles display correctly" (fun fixtures ->
      let> component = fixtures##mount helpers##board in
      let check_month i =
        let month = months.(i) in
        let el = get_by_text_opt component month (get_by_text_options ~exact:true ()) in
        helpers##expect el |> to_be_visible
      in
      let> () = check_month 0 in
      let> () = check_month 1 in
      let> () = check_month 2 in
      let> () = check_month 3 in
      let> () = check_month 4 in
      let> () = check_month 5 in
      let> () = check_month 6 in
      let> () = check_month 7 in
      let> () = check_month 8 in
      let> () = check_month 9 in
      let> () = check_month 10 in
      check_month 11);

    helpers##test "day tiles display correctly" (fun fixtures ->
      let> component = fixtures##mount helpers##board in
      let rec check_days day =
        if day > 31 then Js.Promise.resolve ()
        else
          let el = get_by_text_opt component (string_of_int day) (get_by_text_options ~exact:true ()) in
          let> () = helpers##expect el |> to_be_visible in
          check_days (day + 1)
      in
      check_days 1);

    helpers##test "correct total tile count" (fun fixtures ->
      let> component = fixtures##mount helpers##board in
      let tiles = locator_ component ".tile" in
      (* 12 months + 31 days = 43 tiles *)
      to_have_count (helpers##expect tiles) 43);

    helpers##test "visual snapshot" (fun fixtures ->
      let> component = fixtures##mount helpers##board in
      let jan = get_by_text component "Jan" in
      let> () = helpers##expect jan |> to_be_visible in
      let day31 = get_by_text_opt component "31" (get_by_text_options ~exact:true ()) in
      let> () = helpers##expect day31 |> to_be_visible in
      to_have_screenshot (helpers##expect component) "board.png"))
