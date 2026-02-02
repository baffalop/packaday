let (>>) f g x = g (f x)
let (<<) f g x = f (g x)

module Fn = struct
  let const x _ = x
  let id x = x
end

module Let = struct
  let (let@) = Result.bind
  let (let*) = Option.bind
end
