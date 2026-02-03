(** Inline test support for Melange using melange-fest.
    Tests only run when NODE_TEST environment variable is set. *)

(** Conditionally run inline tests. Usage:
    {[
      let () = Test.run @@ fun () ->
        let open Fest in
        test "my test" (fun () -> expect |> equal 1 1);
        test "another" (fun () -> expect |> ok true)
    ]}
*)
val run : (unit -> unit) -> unit
