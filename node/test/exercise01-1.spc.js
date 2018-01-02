'use strict'

const assert = require('assert')

const myutil = require('../src/utils')

const solution = require('../src/exercise01-1')

describe('exercise 1.1', () => {

  it('my sqrt', () => {
    for(let i = 0; i < 100; i++) {
      let n = myutil.getRandomInt(0, 100000)
      assert(Math.floor(Math.sqrt(n)) === solution.mysqrt(n))
    }
  })

  it('my mod', () => {
    for(let i = 0; i < 100; i++) {
      let m = myutil.getRandomInt(0, 100000)
      let n = myutil.getRandomInt(0, 100000)
      assert(m % n === solution.mymod(m, n))
    }
  })
})
