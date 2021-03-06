union-type-either
=================

Either implementation for [union-type](https://github.com/paldepind/union-type). See also [union-type-option](https://github.com/jethrolarson/union-type-option).


### Implemented interfaces:
* Setoid
* Foldable
* Functor
* Apply
* Chain
* Applicative
* Monad
* Extract


Documentation
-------------
Like [Ramda](https://github.com/ramda/ramda), the functions in this lib take
the `Either` instance as the final argument. All functions with more than one
argument are auto-curried using ramda.

This library is written in node-supported es2015 (4.0+) so if you're running in
an old environment you may need to transpile to es5.

```js
var Either = require('union-type-either')
var Right = Either.Right
var Left = Either.Left
```

#### Right :: a -> Either a
Create an instance of `Either` with a valid value.
```js
Right(1) // Right(1)
```

#### Left :: a -> Either a
Create an instance of `Either` with a default value.
```js
Left('Danger Will Robinson')
```

#### equals :: Either a -> Either b -> Boolean
Compare the contained value of one `Either` against another using `===`.

```js
Either.equals(Right(1), Right(1)) //true
Either.equals(Right({}), Right({})) //false
Either.equals(Left('Doh'), Left('Doh')) //true
```

#### map :: (a -> b) -> Either a -> Either b
Run a function on a value in an `Either` and return new Either with the result.
```js
Either.map(a => a + 3, Right(1)) // Right(4)
```

#### extract :: Either a -> a
Get the value out of an `Either`. Could be `Left` or `Right`.
```js
Either.extract(Right(1)) // 1
Either.extract(Left('Doh')) // 'Doh'
```

#### of :: a -> Either b -> a
Put a value in an `Either`. Mostly useful for higher level operations.
```js
Either.of(1, Left('Doh')) // Right(1)
Either.of(1, Right(999)) // Right(1)
```

#### chain :: (a -> Either b) -> Either a -> Either b
Run a function that returns an `Either` on the value in another `Either`.
```js
var validLength = str => str.length < 8 ? Left('Passwords must contain at least 8 characters') : Right(str)
var validHasCapitals = str => (/[A-Z]/).test(str) ? Right(str) : Left('Password must contain at least one capital')
var validateUsername = username => Either.chain(validHasCapitals, validLength(username))
```

#### chainLeft :: (a -> Either b) -> Either a -> Either b
Like chain but only applies to `Left` values.

#### bichain :: (a -> Either b) -> (b -> Either c) -> Either a b -> Either c
Like chain but takes two functions and applies one of them to Left or Right.

#### ap :: Either a -> Either (a -> b) -> Either b
Run a function inside an `Either` on the value in another `Either`

```js
Either.ap(Right(2), Right(a => a * 2)) // Right(4)
```

#### reduce :: (b -> a -> b) -> b -> Either a -> b
Turn an option into something else by combining its right value with a seed and a reducing function.

```js
Either.reduce((a, b) => a + b, 1, Right(2)) // Right(3)
```

#### extend :: Either a => (a -> b) -> a -> Either b
Run a function on an `Either` and wrap with another `Either`.

```js
Either.extend(a => a.extract() + 1, Right(1)) // 2
```

#### cata :: (a -> c) -> (b -> c) -> Either a b ->  c
Catamorphism. Run a function on the value of both branches of an `Either`

```js
Either.cata(a => a + 1, Right(1)) // 2
Either.cata(a => a + 1, Left(1)) // 2
```

#### bimap :: (a -> b) -> (c -> d) -> Either a c -> Either b d
Run a function on the value of both branches of an `Either` and return an `Either`

```js
Either.bimap(a => a + 1, Right(1)) // Right(2)
Either.bimap(a => a + 1, Left(1)) // Left(2)
```
