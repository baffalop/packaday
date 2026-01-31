(lang dune 3.17)
(name fitaday)

(using melange 0.1)

(generate_opam_files true)

(package
 (name fitaday)
 (synopsis "A datepicker with a puzzling UI"))

(dialect
 (name mlx)
 (implementation
  (extension mlx)
  (merlin_reader mlx)
  (preprocess (run mlx-pp %{input-file}))))
