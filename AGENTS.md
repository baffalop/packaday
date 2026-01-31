This is a puzzle game webapp, written in Ocaml with the mlx syntax extension, Melange, and ReasonReact.

Ocaml rules:
- Prefer pipelines. For simple cases, prefer the `@@` operator to avoid brackets.
- Annotate types for top-level values, unless they are very obvious, or complex/verbose and better to be inferred.
- Add doc comments using (** ... *) when there is something significant to explain.
- Use mli files to keep module APIs constrained. Many tasks are best approached by writing the mli signature first.
    - When adding/changing values, be sure to keep the mli in sync, but don't add values to the mli unless they need to be exposed.
- If you have a 'run diagnostics' tool, use it to verify correctness; assume `dune build --watch` is already running. If not, verify changes using `dune runtest`.

Javascript rules:
- Tools used are pnpm and vite. Do not use npm.
- Assume vite (dev) is running
