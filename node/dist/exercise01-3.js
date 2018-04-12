'use strict';
exports.comparisonCountingSort = function (arr) {
    const len = arr.length;
    const counts = new Array(len);
    for (let i = 0; i < len; i++) {
        counts[i] = 0;
    }
    for (let i = 0; i < len - 1; i++) {
        for (let j = i + 1; j < len; j++) {
            if (arr[i] < arr[j]) {
                counts[j] += 1;
            }
            else {
                counts[i] += 1;
            }
        }
    }
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
        result[counts[i]] = arr[i];
    }
    return result;
};
function isMatch(source, from, match) {
    var i, j;
    for (i = from, j = 0; i < source.length && j < match.length; i++, j++) {
        if (source[i] !== match[j]) {
            break;
        }
    }
    return j === match.length;
}
exports.myindexOf = function (source, match) {
    for (let i = 0; i < source.length; i++) {
        if (isMatch(source, i, match)) {
            return i;
        }
    }
    return -1;
};
