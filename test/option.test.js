var R = require('ramda')
var test = require('tape-catch')
var Opt = require('../option.js')
var map = Opt.map;
var chain = Opt.chain;
var extract = Opt.extract;
var of = Opt.of;
var Some = Opt.Some;
var None = Opt.None;
var none = Opt.none;
var ap = Opt.ap;
var reduce = Opt.reduce;
var extend = Opt.extend;
var equals = Opt.equals;

var I = x => x
var B = R.curry((f, g) => x => f(g(x)))
var C = f => R.curry((a, b) => f(b, a))
var inc = R.add(1)

var eq = (t, a, b, m) => t.equals(extract(a), extract(b), m)

test('takes values', (t) => {
  t.equal(Some(1)[0], 1)
  t.equal(none[0], undefined)
  t.end()
})

test('can Extract', (t) => {
  t.equal(extract(Some(1)), 1)
  t.equal(extract(none), null)
  t.end()
})

test('is Setoid', (t) => {
  t.ok(equals(Some(1), Some(1)))
  t.ok(equals(none,none))
  t.ok(equals(none, None()))
  t.ok(equals(None(), None()))
  t.notOk(equals(Some(2), Some(1)))
  t.notOk(equals(Some({}), Some({})))
  t.notOk(equals(none, Some(1)))
  t.notOk(equals(none, Some(null)))
  t.end()
})

var mapInc = map(inc)
test('is Functor', (t) => {
  t.equal(extract(mapInc(Some(1))), 2, 'inc some')
  t.equal(extract(mapInc(none)), null, 'inc none')

  //identity
  t.equal(extract(map(I, Some(2))), 2, 'Identity')

  var f = R.add(2)
  var g = R.add(5)

  //composition
  eq(t
    , map(B(f, g), Some(2))
    , map(g, map(f, Some(2)))
    , 'Composition'
  )

  t.end()
})

var validatePositive = chain(a => a <= 0 ? none : Some(a))
test('is Chain', (t) => {
  t.equal(extract(validatePositive(Some(1))), 1)
  t.equal(extract(validatePositive(Some(-1))), null)
  t.equal(extract(validatePositive(none)), null)
  t.end()
})

test('is Container', (t)=> {
    t.equal(extract(of(1, none)), 1)
    t.equal(extract(of(1, Some(2))), 1)
    t.end()
})

test('is Apply', (t) => {
  // a.map(f => g => x => f(g(x))).ap(u).ap(v) is equivalent to a.ap(u.ap(v)) (composition)
  var a = Some(R.add(1))
  var u = Some(R.add(2))
  var v = Some(2)
  eq(t
    , ap(v, ap(u, map(B, a)))
    , ap(ap(v, u), a)
  )
  t.end()
})

test('is Applicative', (t) => {
  var fn = Some(inc)
  t.equal(extract(ap(Some(1), fn)), 2)
  t.equal(ap(Some(1), none), none)
  t.equal(ap(none, none), none)
  t.equal(ap(none, fn), none)

  t.end()
})

test('is Foldable', (t) => {
  t.equal(reduce(R.add, 1, Some(2)), 3)
  t.equal(reduce(R.add, 1, none), 1)
  t.end()
})

test('is Extend', (t) => {
  // w.extend(_w => _w.extract()) is equivalent to w
  t.equal(extract(extend(extract, Some(2))), 2)

  // extend(f, extend(g, w)) === extend(_w => f(extend(g, _w)), w)
  var f = a => extract(a) + 1
  var g = a => extract(a) * 2

  eq(t
    , extend(f, extend(g, Some(2)))
    , extend(_w => f(extend(g, _w)), Some(2))
  )

  //w.extend(f) is equivalent to w.extend(x => x).map(f)
  eq(t
    , extend(f, Some(2))
    , map(f, extend(x => x, Some(2)))
  )

  t.end()
})

test('is Filterable', (t) => {
  eq(t
    , Opt.filter(a => a > 3, Some(2))
    , None()
  )
  eq(t
    , Opt.filter(a => a > 3, Some(4))
    , Some(4)
  )
  eq(t
    , Opt.filter(a => a > 3, None())
    , none
  )
  t.end()
})
