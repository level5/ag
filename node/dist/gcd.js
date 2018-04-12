'use strict';
/**
 * m, n 为不全等于零的非负整数， 求最大公约数
 * 1. 怎么确定递归和循环会结束？
 * 2. 为什么gcd(m, n) == gcd(n, m mod n)?
*/
exports.euclid = function (m, n) {
    if (n == 0) {
        return m;
    }
    return exports.euclid(n, m % n);
};
exports.euclid2 = function (m, n) {
    if (n === 0) {
        return m;
    }
    while (n > 0) {
        const t = m % n;
        m = n;
        n = t;
    }
    return m;
};
exports.gcd = function (m, n) {
    let t = m > n ? n : m;
    if (t === 0) {
        return m + n;
    }
    while (m % t !== 0 || n % t !== 0) {
        t--;
    }
    return t;
};
function initArray2ToN(n) {
    const all = new Array(n - 1);
    for (var i = 0; i < all.length; i++) {
        all[i] = i + 2;
    }
    return all;
}
exports.sieve = function (n) {
    const all = initArray2ToN(n);
    for (var i = 0; i < all.length; i++) {
        if (!all[i]) {
            continue;
        }
        var t = all[i];
        for (var j = i + 1; j < all.length; j++) {
            if (all[j] && all[j] % t === 0) {
                all[j] = undefined;
            }
        }
    }
    return all.filter(v => !!v);
};
exports.sieve2 = function (n) {
    const all = initArray2ToN(n);
    for (var i = 0; i < all.length; i++) {
        if (!all[i]) {
            continue;
        }
        var t = all[i];
        // 因为 2 * t 到 (t - 1) * t如果能整除，都已经被处理过了
        var start = t * t;
        if (start > n) {
            break;
        }
        while (start <= n) {
            all[start - 2] = undefined;
            start += t;
        }
    }
    return all.filter(v => !!v);
};
exports.gcd2 = function (m, n) {
    if (m === 0 || n === 0) {
        return m + n;
    }
    const l = exports.sieve2(m > n ? m : n);
    let t = 1;
    for (let i = 0; i < l.length; i++) {
        while (m % l[i] === 0 && n % l[i] === 0) {
            m = m / l[i];
            n = n / l[i];
            t = t * l[i];
        }
    }
    return t;
};
