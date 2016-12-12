const decircularize = require('../index')

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
	describe('Object with both arrays and objects with circular refs', () => {
		beforeEach(() => {
			testData.input = {
				array: [
					[
						{},
					],
					{
						abc: [
							1,
							2,
						]
					}
				],
				object: {
					first: [
						{},
					],
					second: {
						abc: [
							1,
							2,
						]
					},
				}
			}

			testData.input.array[0][0].circular = testData.input.array[0]
			testData.input.array[0].push(testData.input.array[0])

			testData.input.array[1].abc.push(testData.input.array[1].abc)
			testData.input.array[1].abc.push({ circular: testData.input.array[1].abc })

			testData.input.object.first[0].circular = testData.input.object.first
			testData.input.object.first.push(testData.input.object.first)

			testData.input.object.second.abc.push(testData.input.object.second.abc)
			testData.input.object.second.abc.push({ circular: testData.input.object.second.abc })

			testData.result = decircularize(testData.input)
		})
		it('should replace the circular ref with a string explaining the issue', () => {
			expect(testData.result).to.deep.equal({
				array: [
					[
						{ circular: '[Circular to: <root>.array.0]' },
						'[Circular to: <root>.array.0]'
					],
					{
						abc: [
							1,
							2,
							'[Circular to: <root>.array.1.abc]',
							{ circular: '[Circular to: <root>.array.1.abc]' },
						],
					},
				],
				object: {
					first: [
						{ circular: '[Circular to: <root>.object.first]' },
						'[Circular to: <root>.object.first]',
					],
					second: {
						abc: [
							1,
							2,
							'[Circular to: <root>.object.second.abc]',
							{ circular: '[Circular to: <root>.object.second.abc]' },
						]
					}
				},
			})
		})
	})
	describe('Object where an item is referenced as siblings', () => {
		beforeEach(() => {
			const common = { a: 1 }
			testData.input = {
				first: common,
				second: common,
			}
			testData.result = decircularize(testData.input)
		})
		it('should copy everything', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result.first).to.not.equal(testData.input.first)
			expect(testData.result.second).to.not.equal(testData.input.second)
			expect(testData.result.first).to.not.equal(testData.input.second)
		})
		it('should not change any of them', () => {
			expect(testData.result).to.deep.equal({
				first: { a: 1 },
				second: { a: 1 },
			})
		})
	})
	describe('Array where an item is referenced as siblings', () => {
		beforeEach(() => {
			const common = { a: 1 }
			testData.input = [
				common,
				common,
			]
			testData.result = decircularize(testData.input)
		})
		it('should copy everything', () => {
			expect(testData.result).to.not.equal(testData.input)
			expect(testData.result[0]).to.not.equal(testData.input[0])
			expect(testData.result[1]).to.not.equal(testData.input[1])
			expect(testData.result[0]).to.not.equal(testData.input[1])
		})
		it('should not change any of them', () => {
			expect(testData.result).to.deep.equal([
				{ a: 1 },
				{ a: 1 },
			])
		})
	})
})
