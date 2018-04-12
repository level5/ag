const puzzle = require('../src/puzzle')
const assert = require('assert')

describe('puzzle', () => {

  describe('palindrome', () => {

    it('大于10， 2进制，8进制，10进制都是回文的最小的整数', () => {
      assert(puzzle.minPalindromeNumber() === 585)
    })

    it('toBinary', () => {
      assert( '10' === (2).toString(2))
      assert( '-10' === (-2).toString(2))

      assert(puzzle.toBinary(-2) === '11111111111111111111111111111110')
    })

    it('reverse string', () => {

      String.fromCodePoint
      assert('𝌆'.length === 2)
      console.log('a𝌆b'.codePointAt(1).toString(16), 'a𝌆b'.codePointAt(2).toString(16))

    })

  })

})
