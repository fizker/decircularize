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
	describe('An object with nested objects', () => {
		beforeEach(() => {
			testData.input = {
				prop: 'some string',
				otherProp: 'some other string',
				object: {
					key: 1,
				},
			}
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result.object).to.not.equal(testData.input.object)
		})
		it('should not change any of the values', () => {
			expect(testData.result).to.deep.equal(testData.input)
		})
	})
	describe('An array of simple types', () => {
		beforeEach(() => {
			testData.input = ['1', 2]
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
		})
		it('should not change any of the values', () => {
			expect(testData.result).to.deep.equal(testData.input)
		})
	})
	describe('An array of nested objects and arrays', () => {
		beforeEach(() => {
			testData.input = [
				'1',
				2,
				{ object: { a: 1 } },
				[ 1, { number: 123, object2: { b: 2 }, array: [ 1, 2 ] } ],
			]
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result[2]).to.not.equal(testData.input[2], 'first object')
			expect(testData.result[2].object).to.not.equal(testData.input[2].object, 'nested object of first object')
			expect(testData.result[3]).to.not.equal(testData.input[3], 'first array')
			expect(testData.result[3][1]).to.not.equal(testData.input[3][1], 'second object')
			expect(testData.result[3][1].object2).to.not.equal(testData.input[3][1].object2, 'nested object of second object')
			expect(testData.result[3][1].array).to.not.equal(testData.input[3][1].array, 'nested array of second object')
		})
		it('should not change any of the values', () => {
			expect(testData.result).to.deep.equal(testData.input)
		})
	})
	describe('Object with circular ref to itself', () => {
		beforeEach(() => {
			testData.input = {}
			testData.input.circular = testData.input
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
		})
		it('should replace the circular ref with a string explaining the issue', () => {
			expect(testData.result).to.deep.equal({
				circular: '[Circular to: <root>]'
			})
		})
	})
	describe('Object with nested circular ref', () => {
		beforeEach(() => {
			testData.input = {
				a: {
					b: {}
				}
			}
			testData.input.a.b.circular = testData.input.a
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result.a).to.not.equal(testData.input.a)
			expect(testData.result.a.b).to.not.equal(testData.input.a.b)
		})
		it('should replace the circular ref with a string explaining the issue', () => {
			expect(testData.result).to.deep.equal({
				a: {
					b: {
						circular: '[Circular to: <root>.a]'
					}
				}
			})
		})
	})
	describe('Array with circular ref', () => {
		beforeEach(() => {
			testData.input = []
			testData.input.push(testData.input)
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
		})
		it('should replace the circular ref with a string explaining the issue', () => {
			expect(testData.result).to.deep.equal([
				'[Circular to: <root>]'
			])
		})
	})
	describe('Object with nested array with circular ref', () => {
		beforeEach(() => {
			testData.input = [
				{ a: 1 }
			]
			testData.input[0].circular = testData.input[0]
			testData.result = decircularize(testData.input)
		})
		it('should return a deep copy', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result[0]).to.not.equal(testData.input[0])
		})
		it('should replace the circular ref with a string explaining the issue', () => {
			expect(testData.result).to.deep.equal([
				{
					a: 1,
					circular: '[Circular to: <root>.0]',
				}
			])
		})
	})
})
