'use strict'

const assert = require('assert')
// const tested = require('../src/sudo')


describe('sudo', function() {


  it.skip('checkNumbers', function() {
    assert(tested.checkNumbers([1,2, 3, 4, 5, 6, 7, 8, 9]) == true)
    assert(tested.checkNumbers([1, 1, 2, 3, 4, 5, 6, 7, 8, 9]) === false)
    assert(tested.checkNumbers([1, 0, 2, 3, 4, 5, 6, 7, 8, 9]) === false)
  })

  it('genPanel', function (done) {
    Promise.resolve().then(() => {
      assert(1 == 2);
      done();
    })
  })

})
