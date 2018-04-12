"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 大于10， 10进制，8进制，2进制都是回文的所有数字中最小的数字。
 */
function minPalindromeNumber() {
    // 对于正整数，可以直接使用toString
    let i = 11;
    while (true) {
        if (isPalindrome(i.toString(2)) && isPalindrome(i.toString(8)) || isPalindrome(i.toString(10))) {
            return i;
        }
        i += 2;
    }
}
exports.minPalindromeNumber = minPalindromeNumber;
function toBinary(n) {
    return (n >>> 0).toString(2);
}
exports.toBinary = toBinary;
function isPalindrome(s) {
    return s.split('').reverse().join('') === s;
}
function reverse(s) {
    return s.split('').reverse().join('');
}
exports.reverse = reverse;
