'use strict'

const assert = require('assert')
const tested = require('../src/sort')
const util = require('../src/utils')

describe('sort', () => {

  describe('brute force', () => {


    ['selectionSort', 'bubbleSort', 'insertionSort'].forEach(name => {
      const sort = tested[name]
      it(`sort by ${name}`, () => {
        for (let i = 0; i < 10; i++) {
          let arr = util.getRandomIntArray(10, 0, 1000)
          sort(arr)
          for(let j = 0; j < arr.length - 1; j++) {
            assert(arr[j] <= arr[j + 1])
          }
        }
      })
    })


  })
})
