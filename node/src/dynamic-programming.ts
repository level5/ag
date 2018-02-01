

export function coinRow(coins: number[]): number {
  return max(coins, 0, coins.length)
}

function max(coins: number[], start: number, end: number): number {
  if (end - start === 0) {
    return 0
  }
  if (end - start === 1) {
    return coins[start]
  }
  const withoutLastOne = max(coins, start, end - 1)
  const withLastOne = max(coins, start, end - 2) + coins[end - 1]

  return Math.max(withLastOne, withoutLastOne)
}

export function coinRow2(coins: number[]): number {
  const maxCounts = new Array<number>(coins.length + 1)
  maxCounts[0] = 0
  maxCounts[1] = coins[0]
  let i = 2
  while(i <= coins.length) {
    const coin = coins[i - 1]
    maxCounts[i] = Math.max(coin + maxCounts[i - 2], maxCounts[i - 1])
    i++
  }
  return maxCounts[coins.length]
}


export function changeMaking(n: number, coins: number[]): number {
  const minCoins = new Array<number>(n + 1)
  minCoins[0] = 0
  let i = 1
  while(i <= n) {
    let min = Infinity
    for (let v of coins) {
      if (i - v < 0) {
        continue
      }
      if (min > 1 + minCoins[i - v]) {
        min = 1 + minCoins[i - v]
      }
    }
    minCoins[i] = min
    i++
  }
  return minCoins[n] < Infinity ? minCoins[n] : -1
}
