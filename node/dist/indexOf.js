'use strict';
exports.bruteForceStringMatch = function (source, sub) {
    for (let i = 0; i <= source.length - sub.length; i++) {
        let n = 0;
        while (n < sub.length && source[i + n] === sub[n]) {
            n++;
        }
        if (n === sub.length) {
            return i;
        }
    }
    return -1;
};
