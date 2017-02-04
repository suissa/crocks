/** @license ISC License (c) copyright 2017 original and current authors */
/** @author Ian Hofmann-Hicks (evil) */

const curry = require('../helpers/curry')
const constant = require('../combinators/constant')

const isFunction = require('../predicates/isFunction')
const isType = require('../internal/isType')

const Maybe = require('../crocks/Maybe')
const Either = require('../crocks/Either')

const applyTransform = (left, maybe) =>
  maybe.either(
    constant(Either.Left(left)),
    Either.Right
  )

// maybeToEither : b -> Maybe a -> Either b a
// maybeToEither : c -> (a -> Maybe b) -> a -> Either c b
function maybeToEither(left, maybe) {
  if(isType(Maybe.type(), maybe)) {
    return applyTransform(left, maybe)
  }
  else if(isFunction(maybe)) {
    return function(x) {
      const m = maybe(x)

      if(!isType(Maybe.type(), m)) {
        throw new TypeError('maybeToEither: Maybe returing function required for second argument')
      }

      return applyTransform(left, m)
    }
  }

  throw new TypeError('maybeToEither: Maybe or Maybe returing function required for second argument')
}

module.exports = curry(maybeToEither)