var decircularize = require('../index')

describe('decircularize.js', () => {
	var testData
	beforeEach(() => {
		testData = {}
	})
	describe('An object with only strings', () => {
		beforeEach(() => {
			testData.input = {
				prop: 'some string',
				otherProp: 'some other string',
			}
			testData.result = decircularize(testData.input)
		})
		it('should return a copy', () => {
			expect(testData.result).to.not.equal(testData.input)
		})
		it('should not change any of the values', () => {
			expect(testData.result).to.deep.equal(testData.input)
		})
	})
})
