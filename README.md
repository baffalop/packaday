# Packaday

> _A datepicker with a puzzling UI_

A puzzle game based on A-Puzzle-A-Day by DragonFjord. Pack 7 pentominos (and 1 bastard rectangle) into a calendar grid, leaving gaps for month and date. Each day has multiple possible solutions.

Built with [Ocaml](https://ocaml.org/) and [ReasonReact](https://reasonml.github.io/reason-react/), using the [mlx](https://github.com/ocaml-mlx/mlx) syntax extension.

**[Play here](https://baffalop.github.io/packaday)**

### Develop

```sh
# install
pnpm install
opam switch create .

# dev
pnpm dev

# build
pnpm build

# tests (Playwright + Dune)
pnpm test # all tests
pnpm test:ui # launch Playwright UI
pnpm test:ct # component tests
pnpm test:e2e # end-to-end tests
pnpm test:snap # update snapshots

# verify
pnpm ts # typescript
pnpm lint # eslint
pnpm lint:fix
```
