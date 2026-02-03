(** Inline test support for Melange using melange-fest.
    Tests only run when NODE_TEST environment variable is set. *)

include Fest

let is_test_env : bool = [%mel.raw {|typeof process !== 'undefined' && process.env.NODE_TEST|}]

(** Conditionally run inline tests. Usage:
    {[
      let () = Test.run @@ fun () ->
        let open Fest in
        test "my test" (fun () -> expect |> equal 1 1);
        test "another" (fun () -> expect |> ok true)
    ]}
*)
let run f = if is_test_env then f ()
