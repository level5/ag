/**
 * sqrt(n)
 */
exports.mysqrt = function (n) {
    for (let i = 1; i <= n; i++) {
        if (i * i <= n && (i + 1) * (i + 1) > n) {
            return i;
        }
    }
};
// cache the result which has calculated.
// m mod n
exports.mymod = function (m, n) {
    while (m > n) {
        m = m - n;
    }
    return m;
};
exports.door = function (n) {
    const doors = new Array(n + 1);
    for (let i = 0; i < n + 1; i++) {
        doors[i] = 0;
    }
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= n; j++) {
            if (j % i === 0) {
                doors[j] = doors[j] === 1 ? 0 : 1;
            }
        }
    }
    doors.shift();
    let p = '';
    doors.forEach((v, index) => {
        p = p + `${index + 1}: ${v}, `;
    });
    console.log(p);
};
