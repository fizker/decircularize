module.exports = function decircularize(input) {
	if(typeof input !== 'object') {
		return input
	}

	if(Array.isArray(input)) {
		return input.map(x => decircularize(x))
	}

	var output = {}
	Object.keys(input).forEach(key => {
		output[key] = decircularize(input[key])
	})
	return output
}
