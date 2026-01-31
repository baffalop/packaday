(lang dune 3.17)
(name fitaday)

(using melange 0.1)

(generate_opam_files true)

(package
 (name fitaday)
 (synopsis "Puzzle game webapp"))

(dialect
 (name mlx)
 (implementation
  (extension mlx)
  (merlin_reader mlx)
  (preprocess (run mlx-pp %{input-file}))))
