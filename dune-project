(lang dune 3.21)
(name packaday)
(maintainers "Nikita Gaidakov <nikita.gaidakov@gmail.com>")

(using melange 1.0)

(generate_opam_files true)

(package
 (name packaday)
 (synopsis "A datepicker with a puzzling UI")

 (depends
  melange
  reason-react
  reason-react-ppx
  mlx
  ocamlmerlin-mlx
  ocaml-lsp-server
  ocamlformat
  odig
 )
 (allow_empty))

(dialect
 (name mlx)
 (implementation
  (extension mlx)
  (merlin_reader mlx)
  (preprocess (run mlx-pp %{input-file}))))
