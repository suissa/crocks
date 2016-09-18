const test = require('tape')
const sinon = require('sinon')
const helpers = require('../test/helpers')

const noop = helpers.noop
const bindFunc = helpers.bindFunc
const isObject = require('../internal/isObject')
const isFunction = require('../internal/isFunction')

const constant = require('../combinators/constant')
const composeB = require('../combinators/composeB')
const identity = require('../combinators/identity')
const reverseApply = require('../combinators/reverseApply')

const MockCrock = require('../test/MockCrock')

const Maybe = require('./Maybe')

test('Maybe', t => {
  const m = Maybe(0)

  t.ok(isFunction(Maybe), 'is a function')
  t.ok(isObject(m), 'returns an object')

  t.ok(isFunction(Maybe.of), 'provides an of function')
  t.ok(isFunction(Maybe.type), 'provides a type function')

  t.throws(Maybe, TypeError, 'throws with no parameters')

  t.end()
})

test('Maybe inspect', t => {
  const m = Maybe('great')
  const n = Maybe(null)

  t.ok(isFunction(m.inspect), 'provides an inspect function')
  t.equal(m.inspect(), 'Maybe great', 'returns inspect string')
  t.equal(n.inspect(), 'Maybe.Nothing', 'Nothing returns inspect string')

  t.end()
})

test('Maybe type', t => {
  t.equal(Maybe(0).type(), 'Maybe', 'type returns Maybe')
  t.end()
})

test('Maybe maybe', t => {
  t.equal(Maybe(0).maybe(), 0, 'maybe returns 0 when 0 is wrapped')
  t.equal(Maybe(1).maybe(), 1, 'maybe returns 1 when 1 is wrapped')
  t.equal(Maybe('').maybe(), '', "maybe returns '' when '' is wrapped")
  t.equal(Maybe('string').maybe(), 'string', "maybe returns 'string' when 'string' is wrapped")
  t.equal(Maybe(false).maybe(), false, 'maybe returns false when false is wrapped')
  t.equal(Maybe(true).maybe(), true, 'maybe returns true when true is wrapped')

  t.equal(Maybe(null).maybe(), undefined, 'maybe returns undefined when null is wrapped')
  t.equal(Maybe(undefined).maybe(), undefined, 'maybe returns undefined when undefined is wrapped')
  t.end()
})

test('Maybe option', t => {
  const nothing = Maybe(null)
  const something = Maybe('something')

  t.equal(nothing.option('was nothing'), 'was nothing', 'returns passed value when called on Nothing')
  t.equal(something.option('was something'), 'something', 'returns wrapped value when called on Something')

  t.end()
})

test('Maybe either', t => {
  const nothing = Maybe(null)
  const something = Maybe('value')

  const fn = bindFunc(Maybe(23).either)

  t.throws(fn(), TypeError, 'throws when nothing passed')

  t.throws(fn(null, noop), TypeError, 'throws with null in left')
  t.throws(fn(undefined, noop), TypeError, 'throws with undefined in left')
  t.throws(fn(0, noop), TypeError, 'throws with falsey number in left')
  t.throws(fn(1, noop), TypeError, 'throws with truthy number in left')
  t.throws(fn('', noop), TypeError, 'throws with falsey string in left')
  t.throws(fn('string', noop), TypeError, 'throws with truthy string in left')
  t.throws(fn(false, noop), TypeError, 'throws with false in left')
  t.throws(fn(true, noop), TypeError, 'throws with true in left')
  t.throws(fn({}, noop), TypeError, 'throws with object in left')
  t.throws(fn([], noop), TypeError, 'throws with array in left')

  t.throws(fn(noop, null), TypeError, 'throws with null in right')
  t.throws(fn(noop, undefined), TypeError, 'throws with undefined in right')
  t.throws(fn(noop, 0), TypeError, 'throws with falsey number in right')
  t.throws(fn(noop, 1), TypeError, 'throws with truthy number in right')
  t.throws(fn(noop, ''), TypeError, 'throws with falsey string in right')
  t.throws(fn(noop, 'string'), TypeError, 'throws with truthy string in right')
  t.throws(fn(noop, false), TypeError, 'throws with false in right')
  t.throws(fn(noop, true), TypeError, 'throws with true in right')
  t.throws(fn(noop, {}), TypeError, 'throws with object in right')
  t.throws(fn(noop, []), TypeError, 'throws with array in right')

  t.equal(nothing.either(constant('nothing'), constant('something')), 'nothing', 'returns left function result when called on Nothing')
  t.equal(something.either(constant('nothing'), constant('something')), 'something', 'returns right function result when called on Somthing')

  t.end()
})

test('Maybe coalesce', t => {
  const fn = bindFunc(Maybe(23).coalesce)

  t.throws(fn(null, noop), TypeError, 'throws with null in left')
  t.throws(fn(undefined, noop), TypeError, 'throws with undefined in left')
  t.throws(fn(0, noop), TypeError, 'throws with falsey number in left')
  t.throws(fn(1, noop), TypeError, 'throws with truthy number in left')
  t.throws(fn('', noop), TypeError, 'throws with falsey string in left')
  t.throws(fn('string', noop), TypeError, 'throws with truthy string in left')
  t.throws(fn(false, noop), TypeError, 'throws with false in left')
  t.throws(fn(true, noop), TypeError, 'throws with true in left')
  t.throws(fn({}, noop), TypeError, 'throws with object in left')
  t.throws(fn([], noop), TypeError, 'throws with array in left')

  t.throws(fn(noop, null), TypeError, 'throws with null in right')
  t.throws(fn(noop, undefined), TypeError, 'throws with undefined in right')
  t.throws(fn(noop, 0), TypeError, 'throws with falsey number in right')
  t.throws(fn(noop, 1), TypeError, 'throws with truthy number in right')
  t.throws(fn(noop, ''), TypeError, 'throws with falsey string in right')
  t.throws(fn(noop, 'string'), TypeError, 'throws with truthy string in right')
  t.throws(fn(noop, false), TypeError, 'throws with false in right')
  t.throws(fn(noop, true), TypeError, 'throws with true in right')
  t.throws(fn(noop, {}), TypeError, 'throws with object in right')
  t.throws(fn(noop, []), TypeError, 'throws with array in right')

  const nothing = Maybe(null).coalesce(constant('was nothing'), identity)
  const something = Maybe('here').coalesce(identity, constant('was something'))

  t.ok(nothing.equals(Maybe('was nothing')),'returns a Maybe wrapping was nothing' )
  t.ok(something.equals(Maybe('was something')),'returns a Maybe wrapping was something' )

  t.end()
})

test('Maybe equals functionality', t => {
  const a = Maybe(0)
  const b = Maybe(0)
  const c = Maybe(1)

  const value = 0
  const nonMaybe = { type: 'Maybe...Not' }

  t.equal(a.equals(c), false, 'returns false when 2 Maybes are not equal')
  t.equal(a.equals(b), true, 'returns true when 2 Maybes are equal')
  t.equal(a.equals(value), false, 'returns false when passed a simple value')
  t.equal(a.equals(nonMaybe), false, 'returns false when passed a non-Maybe')

  t.end()
})

test('Maybe equals properties (Setoid)', t => {
  const a = Maybe(0)
  const b = Maybe(0)
  const c = Maybe(1)
  const d = Maybe(0)

  t.ok(isFunction(Maybe(0).equals), 'provides an equals function')

  t.equal(a.equals(a), true, 'reflexivity')
  t.equal(a.equals(b), b.equals(a), 'symmetry (equal)')
  t.equal(a.equals(c), c.equals(a), 'symmetry (!equal)')
  t.equal(a.equals(b) && b.equals(d), a.equals(d), 'transitivity')

  t.end()
})

test('Maybe map errors', t => {
  const map = bindFunc(Maybe(0).map)

  t.throws(map(undefined), TypeError, 'throws with undefined')
  t.throws(map(null), TypeError, 'throws with null')
  t.throws(map(0), TypeError, 'throws with falsey number')
  t.throws(map(1), TypeError, 'throws with truthy number')
  t.throws(map(''), TypeError, 'throws with falsey string')
  t.throws(map('string'), TypeError, 'throws with truthy string')
  t.throws(map(false), TypeError, 'throws with false')
  t.throws(map(true), TypeError, 'throws with true')
  t.throws(map([]), TypeError, 'throws with an array')
  t.throws(map({}), TypeError, 'throws iwth object')

  t.doesNotThrow(map(noop), 'allows a function')

  t.end()
})

test('Maybe map functionality', t => {
  const spy = sinon.spy(identity)

  t.equal(Maybe(0).map(identity).type(), 'Maybe', 'returns a Maybe')

  const undef = Maybe(undefined).map(spy)

  t.equal(undef.type(), 'Maybe', 'returns a Maybe when undefined')
  t.equal(undef.maybe(), undefined, 'returns a Maybe with an undefined value')
  t.equal(spy.called, false, 'mapped function is never called when undefined')

  const def = Maybe(0).map(spy)

  t.equal(def.type(), 'Maybe', 'returns a Maybe when not undefined')
  t.equal(def.maybe(), 0, 'returns a Maybe with the same value when mapped with identity')
  t.equal(spy.called, true, 'mapped function is called when not undefined')

  t.end()
})

test('Maybe map properties (Functor)', t => {
  const f = x => x + 2
  const g = x => x * 2

  t.ok(isFunction(Maybe(0).map), 'provides a map function')

  t.equal(Maybe(0).map(identity).maybe(), 0, 'identity')
  t.equal(Maybe(10).map(x => f(g(x))).maybe(), Maybe(10).map(g).map(f).maybe(), 'composition')

  t.end()
})

test('Maybe ap errors', t => {
  const m = { type: () => 'Maybe...Not' }
  const ap = bindFunc(Maybe(noop).ap)

  t.throws(Maybe(0).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is a falsey number')
  t.throws(Maybe(1).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is a truthy number')
  t.throws(Maybe('').ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is a falsey string')
  t.throws(Maybe('string').ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is a truthy string')
  t.throws(Maybe(false).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is false')
  t.throws(Maybe(true).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is true')
  t.throws(Maybe([]).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is an array')
  t.throws(Maybe({}).ap.bind(null, Maybe(0)), TypeError, 'throws when wrapped value is an object')

  t.throws(ap(undefined), TypeError, 'throws with undefined')
  t.throws(ap(null), TypeError, 'throws with null')
  t.throws(ap(0), TypeError, 'throws with falsey number')
  t.throws(ap(1), TypeError, 'throws with truthy number')
  t.throws(ap(''), TypeError, 'throws with falsey string')
  t.throws(ap('string'), TypeError, 'throws with truthy string')
  t.throws(ap(false), TypeError, 'throws with false')
  t.throws(ap(true), TypeError, 'throws with true')
  t.throws(ap([]), TypeError, 'throws with an array')
  t.throws(ap({}), TypeError, 'throws with an object')
  t.throws(ap(m), TypeError, 'throws when container types differ')

  t.doesNotThrow(ap(Maybe(0)), 'allows a Maybe')

  t.end()
})

test('Maybe ap properties (Apply)', t => {
  const m = Maybe(identity)

  const a = m.map(composeB).ap(m).ap(m)
  const b = m.ap(m.ap(m))

  t.ok(isFunction(Maybe(0).ap), 'provides an ap function')
  t.ok(isFunction(Maybe(0).map), 'implements the Functor spec')

  t.equal(a.ap(Maybe(3)).maybe(), b.ap(Maybe(3)).maybe(), 'composition Just')
  t.equal(a.ap(Maybe(undefined)).maybe(), b.ap(Maybe(undefined)).maybe(), 'composition Nothing')

  t.end()
})

test('Maybe of', t => {
  t.equal(Maybe.of, Maybe(0).of, 'Maybe.of is the same as the instance version')
  t.equal(Maybe.of(0).type(), 'Maybe', 'returns a Maybe')
  t.equal(Maybe.of(0).maybe(), 0, 'wraps the value passed into a Maybe')

  t.end()
})

test('Maybe of properties (Applicative)', t => {
  const m = Maybe(identity)

  t.ok(isFunction(Maybe(0).of), 'provides an of function')
  t.ok(isFunction(Maybe(0).ap), 'implements the Apply spec')

  t.equal(m.ap(Maybe(3)).maybe(), 3, 'identity Just')
  t.equal(m.ap(Maybe(undefined)).maybe(), undefined, 'identity Nothing')

  t.equal(m.ap(Maybe.of(3)).maybe(), Maybe.of(identity(3)).maybe(), 'homomorphism Just')
  t.equal(m.ap(Maybe.of(undefined)).maybe(), Maybe.of(identity(undefined)).maybe(), 'homomorphism Nothing')

  const a = x => m.ap(Maybe.of(x))
  const b = x => Maybe.of(reverseApply(x)).ap(m)

  t.equal(a(3).maybe(), b(3).maybe(), 'interchange Just')
  t.equal(a(undefined).maybe(), b(undefined).maybe(), 'interchange Nothing')

  t.end()
})

test('Maybe chain errors', t => {
  const chain = bindFunc(Maybe(0).chain)
  const nChain = bindFunc(Maybe(undefined).chain)

  t.throws(chain(undefined), TypeError, 'throws with undefined')
  t.throws(chain(null), TypeError, 'throws with null')
  t.throws(chain(0), TypeError, 'throws with falsey number')
  t.throws(chain(1), TypeError, 'throws with truthy number')
  t.throws(chain(''), TypeError, 'throws with falsey string')
  t.throws(chain('string'), TypeError, 'throws with truthy string')
  t.throws(chain(false), TypeError, 'throws with false')
  t.throws(chain(true), TypeError, 'throws with true')
  t.throws(chain([]), TypeError, 'throws with an array')
  t.throws(chain({}), TypeError, 'throws with an object')
  t.throws(chain(noop), TypeError, 'throws with a non-Maybe returning function')

  t.doesNotThrow(chain(Maybe.of), 'allows a Maybe returning function')

  t.end()
})

test('Maybe chain properties (Chain)', t => {
  t.ok(isFunction(Maybe(0).chain), 'provides a chain function')
  t.ok(isFunction(Maybe(0).ap), 'implements the Apply spec')

  const f = x => Maybe(x + 2)
  const g = x => Maybe(x + 10)

  const a = x => Maybe(x).chain(f).chain(g)
  const b = x => Maybe(x).chain(y => f(y).chain(g))

  t.equal(a(10).maybe(), b(10).maybe(), 'assosiativity Just')
  t.equal(a(null).maybe(), b(null).maybe(), 'assosiativity Nothing')

  t.end()
})

test('Maybe chain properties (Monad)', t => {
  t.ok(isFunction(Maybe(0).chain), 'implements the Chain spec')
  t.ok(isFunction(Maybe(0).of), 'implements the Applicative spec')

  const f = x => Maybe(x)

  t.equal(Maybe.of(3).chain(f).maybe(), f(3).maybe(), 'left identity Just')
  t.equal(Maybe.of(null).chain(f).maybe(), f(null).maybe(), 'left identity Nothing')

  const m = x => Maybe(x)

  t.equal(m(3).chain(Maybe.of).maybe(), m(3).maybe(), 'right identity Just')
  t.equal(m(null).chain(Maybe.of).maybe(), m(null).maybe(), 'right identity Nothing')

  t.end()
})

test('Maybe sequence errors', t => {
  const seq = bindFunc(Maybe(MockCrock({ something: true })).sequence)
  const seqBad = bindFunc(Maybe(0).sequence)

  const seqNothing = bindFunc(Maybe(undefined).sequence)

  t.throws(seq(undefined), TypeError, 'throws with undefined')
  t.throws(seq(null), TypeError, 'throws with null')
  t.throws(seq(0), TypeError, 'throws falsey with number')
  t.throws(seq(1), TypeError, 'throws truthy with number')
  t.throws(seq(''), TypeError, 'throws falsey with string')
  t.throws(seq('string'), TypeError, 'throws with truthy string')
  t.throws(seq(false), TypeError, 'throws with false')
  t.throws(seq(true), TypeError, 'throws with true')
  t.throws(seq([]), TypeError, 'throws with an array')
  t.throws(seq({}), TypeError, 'throws with an object')
  t.doesNotThrow(seq(noop), 'allows a function')

  t.throws(seqBad(noop), TypeError, 'wrapping non-Applicative throws')
  t.doesNotThrow(seqNothing(noop), 'allows Nothing with non-Applicative wrapped')

  t.end()
})

test('Maybe sequence functionality', t => {
  const x = []
  const s = Maybe(MockCrock(x)).sequence(MockCrock.of)
  const n = Maybe(MockCrock(null)).sequence(MockCrock.of)

  t.equal(s.type(), 'MockCrock', 'Provides an outer type of MockCrock')
  t.equal(s.value().type(), 'Maybe', 'Provides an inner type of Maybe')
  t.same(s.value().maybe(), x, 'Maybe contains original inner value')

  t.equal(n.type(), 'MockCrock', 'Provides an outer type of MockCrock')
  t.equal(n.value().type(), 'Maybe', 'Provides an inner type of Maybe')
  t.equal(n.value().option('Nothing'), 'Nothing', 'Reports as a Nothing')

  t.end()
})
