
exports.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}


exports.getRandomIntArray = function (len, min, max) {
  const result = []

  for (let i = 0; i < len; i++) {
    result[i] = exports.getRandomInt(min, max)
  }

  return result
}


exports.swap = function (arr, i, j) {
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
