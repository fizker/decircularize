const visitedObjectsSymbol = Symbol('visitedObjects')
const currentPathSymbol = Symbol('currentPath')
module.exports = function decircularize(input, options = {}) {
	const visitedObjects = options[visitedObjectsSymbol] || []
	const currentPath = options[currentPathSymbol] || ['<root>']
	const onCircular = options.onCircular || defaultTransform

	if(typeof input !== 'object') {
		return input
	}

	visitedObjects.push({ path: currentPath, object: input })

	if(Array.isArray(input)) {
		return input.map((object, index) => {
			const circularPath = visitedObjects.find(x => x.object === object)
			if(circularPath != null) {
				return onCircular(circularPath.path, circularPath.object)
			}

			return decircularize(object, {
				[visitedObjectsSymbol]: visitedObjects,
				[currentPathSymbol]: currentPath.concat(index),
			})
		})
	}

	var output = {}
	Object.keys(input).forEach(key => {
		const object = input[key]

		const circularPath = visitedObjects.find(x => x.object === object)
		if(circularPath != null) {
			output[key] = onCircular(circularPath.path, circularPath.object)
			return
		}

		output[key] = decircularize(object, {
			[visitedObjectsSymbol]: visitedObjects,
			[currentPathSymbol]: currentPath.concat(key),
		})
	})
	return output
}

function defaultTransform(path, object) {
	return `[Circular to: ${path.join('.')}]`
}
