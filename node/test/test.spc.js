const assert = require('assert')

describe('hello', () => {

  it('world', () => {
    assert('hello world' === 'hello wor')
  })

  it('assert array', () => {
    assert.deepEqual([1, 2, 3], [1, 2, 4])
  })

})
