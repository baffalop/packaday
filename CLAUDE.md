This is a puzzle game webapp, written in Ocaml with the mlx syntax extension, Melange, and ReasonReact.

Rules:

- Always verify changes at the end of a task (or significant change), using at least diagnostics/`pnpm build` and `pnpm test`. _If you know you've made visual changes_ to components, expect snapshot test failures, and update using `pnpm test:snap`.
- If you have a 'run diagnostics' tool, use it to verify correctness; assume `dune build --watch` is already running. If not, typecheck using `pnpm build`.
- If you encounter a significant unexpected stumbling block in a planned change, and initial debugging/fixes aren't getting anywhere, ask for confirmation. If something would be easier debug by asking the human to check something, do stop and ask.

Ocaml:

- Annotate types for top-level values, unless they are very obvious, or complex/verbose and better to be inferred.
- Add doc comments using (\*_ ... _) when there is something significant to explain.
- Use mli files to keep module APIs constrained. Many tasks are best approached by writing the mli signature first.
  - When adding/changing values, be sure to keep the mli in sync, but don't add values to the mli unless they need to be exposed.
- When installing packages, always add to dune-project depends stanza then install with `opam install . --deps-only`.
- Prefer pipelines. Remember that Melange functions are designed to be used with the pipe first `|.` operator.
  - For simple nested expressions, prefer the `@@` operator to avoid brackets.
- There is a Prelude module with function composition and monadic utilities. Open and use when appropriate.

Javascript:

- Tools used are pnpm and vite. Do not use npm.
- Write in Standardjs style, with one amendment: prefer trailing commas (when multiline)
- Check typescript after editing ts files, using either diagnostics tool or `pnpm ts`.
