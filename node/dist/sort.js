'use strict';
const utils = require('./utils');
/**
 * 蛮力
 */
exports.selectionSort = function (numbers) {
    for (let i = 0; i < numbers.length - 1; i++) {
        let min = i;
        for (let j = i + 1; j < numbers.length; j++) {
            if (numbers[min] > numbers[j]) {
                min = j;
            }
        }
        let tmp = numbers[min];
        numbers[min] = numbers[i];
        numbers[i] = tmp;
    }
};
exports.bubbleSort = function (numbers) {
    for (let i = 0; i < numbers.length - 1; i++) {
        for (let j = 0; j < numbers.length - i - 1; j++) {
            if (numbers[j] > numbers[j + 1]) {
                let tmp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = tmp;
            }
        }
    }
};
exports.insertionSort = function (numbers) {
    let min = 0;
    for (let i = 1; i < numbers.length; i++) {
        min = numbers[min] < numbers[i] ? min : i;
    }
    utils.swap(numbers, min, 0);
    for (let i = 1; i < numbers.length; i++) {
        const v = numbers[i];
        let j = i;
        while (numbers[j - 1] > v) {
            numbers[j] = numbers[j - 1];
            j--;
        }
        numbers[j] = v;
    }
};
