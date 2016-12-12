module.exports = function decircularize(input) {
	var output = input
	if(typeof input === 'object') {
		output = {}
		Object.keys(input).forEach(key => {
			output[key] = decircularize(input[key])
		})
	}
	return output
}
