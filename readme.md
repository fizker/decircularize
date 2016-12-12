decircularize
=============

Remove circular dependencies. It also functions as a deep-copy, to ensure that
the input is never mutated and that the output can be trusted, even if there are
no issues with circular structures.


Usage
-----

The default behavior replaces the dependencies with a string suitable for
debugging.

```js
import decircularize from 'decircularize'

var obj = {
	a: 1,
	b: { something: 2 }
}
obj.b.bad = obj
obj.b.alsoBad = obj.b

JSON.stringify(obj) // explodes

JSON.stringify(decircularize(obj), null, 2)
/* returns
{
  a: 1,
  b: {
    something: 2,
    bad: '[Circular to: <root>]',
    alsoBad: '[Circular to: <root>.b]'
  }
}
*/
```


This can easily be overridden for any custom need. For example, imagine a REST
API where each entity have an `id` prop that uniquely identifies it:

```js
import decircularize from 'decircularize'

var obj = {
	id: '123',
	b: {
		id: 'abc',
		entities: [ 2 ]
	}
}
obj.b.entities.push(obj.b)

decircularize(obj, {
	onCircular: (object, otherPath, offendingPath) => {
		assert(object === obj.b)

		// In this instance, otherPath equals [ '<root>', 'b' ]
		// and offendingPath equals [ '<root>', 'b', 'entities', 1 ]

		return { id: object.id }
	}
})
/* returns
{
	a: 1,
	b: {
		id: 'abc',
		entities: [
			2,
			{ id: 'abc' }
		]
	}
}
*/
```
