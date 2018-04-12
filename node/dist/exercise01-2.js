'use strict';
/**
 * 排序后很容易求出来
 */
exports.minDistance = function (arr) {
    assert(arr.length > 1);
    arr.sort();
    let minDistance = Math.abs(arr[1] - arr[0]);
    for (let i = 1; i < arr.length; i++) {
        let distance = Math.abs(arr[i] - arr[i - 1]);
        minDistance = distance < minDistance ? distance : minDistance;
    }
    return minDistance;
};
/**
 *  蛮力解决
 */
exports.minDistance2 = function (arr) {
    assert(arr.length > 1);
    let minDistance = Math.abs(arr[1] - arr[0]);
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && Math.abs(arr[j] - arr[i]) < minDistance) {
                minDistance = Math.abs(arr[j] - arr[i]);
            }
        }
    }
    return minDistance;
};
/**
 * 上一个蛮力解决有一半多余计算
 */
exports.minDistance3 = function (arr) {
    assert(arr.length > 1);
    let minDistance = Math.abs(arr[1] - arr[0]);
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (Math.abs(arr[j] - arr[i]) < minDistance) {
                minDistance = Math.abs(arr[j] - arr[i]);
            }
        }
    }
    return minDistance;
};
