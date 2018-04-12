'use strict';
exports.seqSearch = function (numbers, v) {
    let i = 0;
    while (i < numbers.length) {
        if (numbers[i] === v) {
            return i;
        }
    }
    return -1;
};
