'use strict'

const assert = require('assert')
const tested = require('../src/maze')

function path(points) {
  return points.map(([x, y]) => ({x, y}))
}


function toPath(numbers) {
  const xs = numbers.filter((v, index) => index % 2 === 0)
  const ys = numbers.filter((v, index) => index % 2 === 1)
  return xs.map((v, index) => ({x: v, y: ys[index]}))
}


describe('maze', () => {
  it('maze path', () => {
    const path = toPath([1, 1, 1, 2, 2, 2, 3, 2, 3, 1, 4, 1, 5, 1, 5, 2, 5, 3, 6, 3, 6, 4, 6, 5, 7, 5, 8, 5, 8, 6, 8, 7, 8, 8])
    assert.deepEqual(path, tested.mazePath(tested.maze))

  })
})
