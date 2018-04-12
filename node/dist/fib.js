function fib(n) {
    if (n === 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }
    return fib(n - 1) + fib(n - 2);
}
function fib2(n) {
    const fibs = new Array(n + 1);
    fibs[0] = 0;
    fibs[1] = 1;
    let i = 2;
    while (i <= n) {
        fibs[i] = fibs[i - 1] + fibs[i - 2];
    }
    return fibs[n];
}
function fib3(n) {
    if (n == 0) {
        return 0;
    }
    else if (n == 1) {
        return 1;
    }
    let i = 0, j = 1, k = 2;
    while (k < n) {
        const tmp = i + j;
        i = j;
        j = tmp;
        k++;
    }
    return i + j;
}
