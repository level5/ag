'use strict';
/**   l         s     i      r
 *    [p | .... | ....| .....]
 *
 *          <= p   > p    ?
 *    when a[i] > p
 *      i = i + 1
 *    when a[i] <= p
 *      s = s + 1
 *      a[s] <-> a[i]
 *      i = i + 1
 */
function lomutoPartition(arr, l, r) {
    const p = arr[l];
    let s = l;
    for (let i = l + 1; i < r; i++) {
        if (arr[i] < p) {
            s++;
            swap(arr, s, i);
        }
    }
    swap(arr, l, s);
}
function swap(arr, i, j) {
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}
function quickSelect(arr, k) {
}
