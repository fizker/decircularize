const decircularize = require('../index')

describe('onCircular.js', () => {
	var testData
	beforeEach(() => {
		testData = {}
	})
	describe('Passing an onCircular function in', () => {
		beforeEach(() => {
			testData.input = {
				array: [
					[
						{},
					],
					{
						key: 'second of array',
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
						key: 'second of object',
						abc: [
							1,
							2,
						]
					},
				}
			}

			testData.input.array[0][0].circular = testData.input.array[0]
			testData.input.array[0].push(testData.input.array[0])

			testData.input.array[1].abc.push(testData.input.array[1])
			testData.input.array[1].abc.push({ circular: testData.input.array[1] })

			testData.input.object.first[0].circular = testData.input.object.first
			testData.input.object.first.push(testData.input.object.first)

			testData.input.object.second.abc.push(testData.input.object.second)
			testData.input.object.second.abc.push({ circular: testData.input.object.second })

			testData.result = decircularize(testData.input, {
				onCircular: (value, otherPath, offendingPath) => {
					return Array.isArray(value)
						? `circular array from ${offendingPath.join('--')} to ${otherPath.join('--')}`
						: { key: value.key, otherPath, offendingPath }
				},
			})
		})
		it('should replace with what the onCircular returns', () => {
			expect(testData.result).to.deep.equal({
				array: [
					[
						{ circular: 'circular array from <root>--array--0--0--circular to <root>--array--0' },
						'circular array from <root>--array--0--1 to <root>--array--0',
					],
					{
						key: 'second of array',
						abc: [
							1,
							2,
							{
								key: 'second of array',
								offendingPath: [ '<root>', 'array', 1, 'abc', 2 ],
								otherPath: [ '<root>', 'array', 1 ]
							},
							{
								circular: {
									key: 'second of array',
									offendingPath: [ '<root>', 'array', 1, 'abc', 3, 'circular' ],
									otherPath: [ '<root>', 'array', 1 ]
								}
							},
						],
					},
				],
				object: {
					first: [
						{ circular: 'circular array from <root>--object--first--0--circular to <root>--object--first' },
						'circular array from <root>--object--first--1 to <root>--object--first',
					],
					second: {
						key: 'second of object',
						abc: [
							1,
							2,
							{
								key: 'second of object',
								offendingPath: [ '<root>', 'object', 'second', 'abc', 2 ],
								otherPath: [ '<root>', 'object', 'second' ]
							},
							{
								circular: {
									key: 'second of object',
									offendingPath: [ '<root>', 'object', 'second', 'abc', 3, 'circular' ],
									otherPath: [ '<root>', 'object', 'second' ]
								}
							},
						],
					},
				},
			})
		})
	})
	describe('An onCircular that returns the original object', () => {
		beforeEach(() => {
			testData.onCircular = (object) => object
		})
		describe('for a self-referencing array', () => {
			beforeEach(() => {
				testData.input = []
				testData.input.push(testData.input)
			})
			it('should throw an error', () => {
				expect(() => decircularize(testData.input, { onCircular: testData.onCircular }))
					.to.throw('onCircular must not return the offending object')
			})
		})
		describe('for a self-referencing object', () => {
			beforeEach(() => {
				testData.input = {}
				testData.input.circle = testData.input
			})
			it('should throw an error', () => {
				expect(() => decircularize(testData.input, { onCircular: testData.onCircular }))
					.to.throw('onCircular must not return the offending object')
			})
		})
	})
	describe('An onCircular that returns an object with circular refs', () => {
		beforeEach(() => {
			testData.onCircular = () => {
				const o  = {}
				o.a = o
				return o
			}
		})
		describe('for a self-referencing array', () => {
			beforeEach(() => {
				testData.input = []
				testData.input.push(testData.input)
			})
			it('should throw an error', () => {
				expect(() => decircularize(testData.input, { onCircular: testData.onCircular }))
					.to.throw('onCircular must not return a circular structure')
			})
		})
		describe('for a self-referencing object', () => {
			beforeEach(() => {
				testData.input = {}
				testData.input.circle = testData.input
			})
			it('should throw an error', () => {
				expect(() => decircularize(testData.input, { onCircular: testData.onCircular }))
					.to.throw('onCircular must not return a circular structure')
			})
		})
	})
})
