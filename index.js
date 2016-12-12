const visitedObjectsSymbol = Symbol('visitedObjects')
const currentPathSymbol = Symbol('currentPath')

/*
 * Public options:
 * - onCircular: Function that gets called when a circular ref is discovered
 *
 * Private options:
 * [visitedObjectsSymbol]: The list of objects already visited.
 * [currentPathSymbol]: The path of the current input, as an array.
 */
module.exports = function decircularize(input, options = {}) {
	if(typeof input !== 'object') {
		return input
	}

	const currentPath = options[currentPathSymbol] || ['<root>']
	const onCircular = options.onCircular || defaultTransform
	const visitedObjects = (options[visitedObjectsSymbol] || []).concat({ path: currentPath, object: input })

	if(Array.isArray(input)) {
		return input.map((object, index) => {
			const circularPath = visitedObjects.find(x => x.object === object)
			if(circularPath != null) {
				return verifyOnCircular(circularPath, onCircular)
			}

			return decircularize(object, {
				[visitedObjectsSymbol]: visitedObjects,
				[currentPathSymbol]: currentPath.concat(index),
				onCircular,
			})
		})
	}

	var output = {}
	Object.keys(input).forEach(key => {
		const object = input[key]

		const circularPath = visitedObjects.find(x => x.object === object)
		if(circularPath != null) {
			output[key] = verifyOnCircular(circularPath, onCircular)
			return
		}

		output[key] = decircularize(object, {
			[visitedObjectsSymbol]: visitedObjects,
			[currentPathSymbol]: currentPath.concat(key),
			onCircular,
		})
	})
	return output
}

function verifyOnCircular(circularPath, onCircular) {
	const result = onCircular(circularPath.path, circularPath.object)

	if(result === circularPath.object) {
		throw new Error('onCircular must not return the offending object')
	}

	return result
}

function defaultTransform(path, object) {
	return `[Circular to: ${path.join('.')}]`
}
