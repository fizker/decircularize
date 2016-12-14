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
module.exports = decircularize
function decircularize(input, options = {}) {
	if(typeof input !== 'object' || input === null) {
		return input
	}

	const currentPath = options[currentPathSymbol] || ['<root>']
	const onCircular = options.onCircular || defaultTransform
	const visitedObjects = (options[visitedObjectsSymbol] || []).concat({ path: currentPath, object: input })

	if(Array.isArray(input)) {
		return input.map((object, index) => {
			const nextPath = currentPath.concat(index)

			const circularPath = visitedObjects.find(x => x.object === object)
			if(circularPath != null) {
				return verifyOnCircular(circularPath, onCircular, nextPath)
			}

			return decircularize(object, {
				[visitedObjectsSymbol]: visitedObjects,
				[currentPathSymbol]: nextPath,
				onCircular,
			})
		})
	}

	var output = {}
	Object.keys(input).forEach(key => {
		const object = input[key]
		const nextPath = currentPath.concat(key)

		const circularPath = visitedObjects.find(x => x.object === object)
		if(circularPath != null) {
			output[key] = verifyOnCircular(circularPath, onCircular, nextPath)
			return
		}

		output[key] = decircularize(object, {
			[visitedObjectsSymbol]: visitedObjects,
			[currentPathSymbol]: nextPath,
			onCircular,
		})
	})
	return output
}

function verifyOnCircular(circularPath, onCircular, offendingPath) {
	const result = onCircular(circularPath.object, circularPath.path, offendingPath)

	if(result === circularPath.object) {
		throw new Error('onCircular must not return the offending object')
	}

	return decircularize(result, { onCircular: () => {
		throw new Error('onCircular must not return a circular structure')
	} })
}

function defaultTransform(object, path) {
	return `[Circular to: ${path.join('.')}]`
}
