'use strict';

import assert = require('assert');
import {
  coinRow,
  coinRow2,
  changeMaking
} from '../src/dynamic-programming'

const coins = [5, 1, 2, 10, 6, 2]

describe('coin row', () => {

  it('get max with coinRow', () => {
    assert(coinRow(coins) === 17)
  })

  it('get max with coinRow2', () => {
    assert(coinRow2(coins) === 17)
  })

  it('get min coins number with changeMaking', () => {
    assert(changeMaking(6, [4, 3, 1]) === 2)
  })
})
