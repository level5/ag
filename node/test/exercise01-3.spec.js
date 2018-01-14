'use strict'

const assert = require('assert')
const tested = require('../src/exercise01-3')

describe('exercise 1.3', () => {

  it('comparisonCountingSort', () => {
    assert.deepEqual([14, 35, 47, 60, 81, 98], tested.comparisonCountingSort([60, 35, 81, 98, 14, 47]))
  })

  it('myindexof', () => {
    assert(tested.myindexOf('hello', 'h') === 0)
    assert(tested.myindexOf('hello', 'x') === -1)
    assert(tested.myindexOf('hello world', 'world') === 6)
  })

})

