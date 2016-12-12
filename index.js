const visitedObjectsSymbol = Symbol('visitedObjects')
module.exports = function decircularize(input, options = {}) {
	const visitedObjects = options[visitedObjectsSymbol] || []
	const onCircular = options.onCircular || defaultTransform

	if(typeof input !== 'object') {
		return input
	}

	if(Array.isArray(input)) {
		return input.map(x => decircularize(x))
	}

	visitedObjects.push({ object: input })

	var output = {}
	Object.keys(input).forEach(key => {
		const object = input[key]

		const circularPath = visitedObjects.find(x => x.object === object)
		if(circularPath != null) {
			output[key] = onCircular(null, circularPath.object)
			return
		}

		output[key] = decircularize(object, {
			[visitedObjectsSymbol]: visitedObjects,
		})
	})
	return output
}

function defaultTransform(path, object) {
	return `[Circular to: ${'<root>'}]`
}
