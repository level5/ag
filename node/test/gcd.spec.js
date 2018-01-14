'use strict'

const assert = require('assert')
const tested = require('../src/gcd')

describe('gcd', () => {

  (['euclid', 'euclid2', 'gcd', 'gcd2']).forEach(name => {

    const gcd = tested[name]

    describe(name, () => {

      it('could get gcd', () => {
        assert(gcd(4, 2) === 2)
        assert(gcd(4, 12) === 4)
        assert(gcd(12, 12) === 12)
        assert(gcd(3, 1) === 1)
      })

      it('could get gcd when m < n', () => {
        assert(gcd(2, 4) === 2)
        assert(gcd(1, 3) === 1)
      })

      it('could get gcd when one zero in m and n', () => {
        assert(gcd(0, 4) === 4)
        assert(gcd(4, 0) === 4)
      })

    })
  });

  //
  (['sieve', 'sieve2']).forEach(name => {

    const sieve = tested[name]

    it(name, () => {
      let ns = sieve(25)
      assert.deepEqual([2, 3, 5, 7, 11, 13, 17, 19, 23], ns)
    })
  });


})
