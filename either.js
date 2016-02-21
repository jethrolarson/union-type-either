var Type = require('union-type')
var curry = require('ramda').curry
var T = () => true
var I = a => a

var Either = Type({Left: [T], Right: [T]})
var Right = Either.Right
var Left = Either.Left

Either.equals = curry((a, b) => Either.case({
    Right: v => b.name === 'Right' && v === Either.extract(b)
  , Left: v => b.name === 'Left' && v === Either.extract(b)
}, a))


//:: (a -> b) -> Either a -> Either b
Either.map = curry((f, a) => Either.case({
    Right: v => Right(f(v))
  , Left: _ => a
}, a))

//:: Either a -> a
Either.extract = Either.case({
    Right: I
  , Left: I
})

//:: a -> Either _ -> Either a
Either.of = curry((a, b) => Either.case({
    Right: _ => Right(a)
  , Left: _ => Right(a)
}, b))

//:: (a -> Either b) -> Either a -> Either b
Either.chain = curry((f, a) => Either.case({
    Right: v => f(v)
  , Left: _ => a
}, a))

//:: Either a -> Either (a -> b) -> Either b
Either.ap = curry((a, b) => Either.case({
    Right: v => b.name === "Right" ? Right(Either.extract(b)(v)) : none
  , Left: I
}, a))

//:: (b -> a -> b) -> b -> Either a -> b
Either.reduce = curry((f, b, a) => Either.case({
    Right: v => f(b, v)
  , Left: _ => b
}, a))

//:: (Either a -> b) -> Either a -> b
Either.extend = curry((f, a) => Either.case({
    Right: _ => f(a)
  , Left: _ => a
}, a))

module.exports = Either
