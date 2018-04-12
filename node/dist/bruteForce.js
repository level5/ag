'use strict';
function pd(a, b) {
    return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
}
/**
 * 距离最近的两个点
 */
exports.closestPoints = function (points) {
    let min = [0, 1], dist = pd(points[0], points[1]);
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            let t = pd(points[i], points[j]);
            if (t < dist) {
                dist = t;
                min = [i, j];
            }
        }
    }
    return min;
};
