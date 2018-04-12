"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function coinRow(coins) {
    return max(coins, 0, coins.length);
}
exports.coinRow = coinRow;
function max(coins, start, end) {
    if (end - start === 0) {
        return 0;
    }
    if (end - start === 1) {
        return coins[start];
    }
    const withoutLastOne = max(coins, start, end - 1);
    const withLastOne = max(coins, start, end - 2) + coins[end - 1];
    return Math.max(withLastOne, withoutLastOne);
}
function coinRow2(coins) {
    const maxCounts = new Array(coins.length + 1);
    maxCounts[0] = 0;
    maxCounts[1] = coins[0];
    let i = 2;
    while (i <= coins.length) {
        const coin = coins[i - 1];
        maxCounts[i] = Math.max(coin + maxCounts[i - 2], maxCounts[i - 1]);
        i++;
    }
    return maxCounts[coins.length];
}
exports.coinRow2 = coinRow2;
function changeMaking(n, coins) {
    const minCoins = new Array(n + 1);
    minCoins[0] = 0;
    let i = 1;
    while (i <= n) {
        let min = Infinity;
        for (let v of coins) {
            if (i - v < 0) {
                continue;
            }
            if (min > 1 + minCoins[i - v]) {
                min = 1 + minCoins[i - v];
            }
        }
        minCoins[i] = min;
        i++;
    }
    return minCoins[n] < Infinity ? minCoins[n] : -1;
}
exports.changeMaking = changeMaking;
