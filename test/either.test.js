var R = require('ramda')
var test = require('tape-catch')
var Either = require('../either.js')
var map = Either.map;
var chain = Either.chain;
var extract = Either.extract;
var of = Either.of;
var Right = Either.Right;
var Left = Either.Left;
var none = Either.Left('none');
var ap = Either.ap;
var reduce = Either.reduce;
var extend = Either.extend;
var equals = Either.equals;

var I = x => x
var B = R.curry((f, g) => x => f(g(x)))
var C = f => R.curry((a, b) => f(b, a))
var inc = R.add(1)

var eq = (t, a, b, m) => t.equals(extract(a), extract(b), m)

test('takes values', (t) => {
  t.equal(Right(1)[0], 1)
  t.equal(none[0], 'none')
  t.end()
})

test('can Extract', (t) => {
  t.equal(extract(Right(1)), 1)
  t.equal(extract(none), 'none')
  t.end()
})

test('is Setoid', (t) => {
  t.ok(equals(Right(1), Right(1)))
  t.ok(equals(none, none))
  t.ok(equals(none, Left('none')))
  t.notOk(equals(Right(2), Right(1)))
  t.notOk(equals(Right({}), Right({})))
  t.notOk(equals(none, Right(1)))
  t.notOk(equals(none, Right(null)))
  t.notOk(equals(none, Right('none')))
  t.end()
})

var mapInc = map(inc)
test('is Functor', (t) => {
  t.equal(extract(mapInc(Right(1))), 2, 'inc some')
  t.equal(extract(mapInc(none)), 'none', 'inc none')

  //identity
  t.equal(extract(map(I, Right(2))), 2, 'Identity')

  var f = R.add(2)
  var g = R.add(5)

  //composition
  eq(t
    , map(B(f, g), Right(2))
    , map(g, map(f, Right(2)))
    , 'Composition'
  )

  t.end()
})

var validatePositive = chain(a => a <= 0 ? none : Right(a))
test('is Chain', (t) => {
  t.equal(extract(validatePositive(Right(1))), 1)
  t.equal(extract(validatePositive(Right(-1))), 'none')
  t.equal(extract(validatePositive(none)), 'none')
  t.end()
})

test('is Container', (t)=> {
    t.equal(extract(of(1, none)), 1)
    t.equal(extract(of(1, Right(2))), 1)
    t.end()
})

test('is Apply', (t) => {
  // a.map(f => g => x => f(g(x))).ap(u).ap(v) is equivalent to a.ap(u.ap(v)) (composition)
  var a = Right(R.add(1))
  var u = Right(R.add(2))
  var v = Right(2)
  eq(t
    , ap(v, ap(u, map(B, a)))
    , ap(ap(v, u), a)
  )
  t.end()
})

test('is Applicative', (t) => {
  var fn = Right(inc)
  t.equal(extract(ap(Right(1), fn)), 2)
  t.equal(ap(Right(1), none), none)
  t.equal(ap(none, none), none)
  t.equal(ap(none, fn), none)

  t.end()
})

test('is Foldable', (t) => {
  t.equal(reduce(R.add, 1, Right(2)), 3)
  t.equal(reduce(R.add, 1, none), 1)
  t.end()
})

test('is Extend', (t) => {
  // w.extend(_w => _w.extract()) is equivalent to w
  t.equal(extract(extend(extract, Right(2))), 2)

  // extend(f, extend(g, w)) === extend(_w => f(extend(g, _w)), w)
  var f = a => extract(a) + 1
  var g = a => extract(a) * 2

  eq(t
    , extend(f, extend(g, Right(2)))
    , extend(_w => f(extend(g, _w)), Right(2))
  )

  //w.extend(f) is equivalent to w.extend(x => x).map(f)
  eq(t
    , extend(f, Right(2))
    , map(f, extend(x => x, Right(2)))
  )

  t.end()
})

test('Catamorphism', (t) => {
    t.equal(Either.cata(a => a + 1, Right(1)), 2)
    t.equal(Either.cata(a => a + 1, Left(1)), 2)
    t.end()
})

test('is a Bifunctor', (t) => {
    eq(Either.bimap(a => a + 1, Right(1)), Right(2))
    eq(Either.bimap(a => a + 1, Left(1)), Left(2))
    t.end()
})
