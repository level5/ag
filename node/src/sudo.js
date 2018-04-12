function arr(length, d) {
  let r = []
  for (let i = 0 ; i < length; i++) {
    r[i] = (typeof d === 'function') ? d() : d;
  }
  return r
}

function genPanel(...args) {

  const p = arr(9, function () {
    return arr(9, 0)
  })

  for (arg of args) {
    p[arg[0]][arg[1]] = arg[2]
  }

  return p
}


function sudo(panel) {
  let i, j;
  outer: for (i = 0; i < 9; i++) {
    for (j = 0; j < 9; j++) {
      if (panel[i][j] === 0) {
        break outer;
      }
    }
  }



  if (i === 9) {
    if (checkPanel(panel)) {
      return panel
    } else {
      return undefined;
    }
  }

  const nums = validNumbers(panel, i, j)
  if (nums.length == 0) return undefined;
  for (let k = 0; k < nums.length; k++) {
    panel[i][j] = nums[k];
    let r = sudo(panel);
    if (r) {
      return panel;
    }
  }
  panel[i][j] = 0;
  return undefined;
}
exports.sudo = sudo

function validNumbers(panel, i, j) {

  const row = panel[i]
  const column = panel.map(row => row[j])

  const m3x3 = []

  const mi = (i - (i % 3)) / 3
  const mj = (j - (j % 3)) / 3

  for (let m = 0; m < 3; m ++) {
    for (let n = 0; n < 3; n ++) {
      m3x3.push(panel[mi*3 + m][mj*3 + n])
    }
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    num => !row.includes(num) && !column.includes(num) && !m3x3.includes(num)
  )
}

function checkPanel(panel) {
  for (let i = 0; i < 9; i++) {
    if (!checkNumbers(panel[i]) || !checkNumbers(panel.map(row => row[i]))) {
      return false
    }
  }

  for(let i =0; i < 2; i++) {
    for(let j = 0; j < 2; j++) {
      let m3x3 = []
      for (let m = 0; m < 3; m ++) {
        for (let n = 0; n < 3; n ++) {
          m3x3.push(panel[i*3 + m][j*3 + n])
        }
      }
      if (!checkNumbers(m3x3)) {
        return false
      }
    }
  }

  return true
}

function check(i, j) {
  // row
  const row = panel[i]

  // column
  const column = panel.map(row => row[j])

  // 3 x 3
  const m3x3 = []

  const mi = (i - (i % 3)) / 3
  const mj = (j - (j % 3)) / 3

  for (let m = 0; m < 3; m ++) {
    for (let n = 0; n < 3; n ++) {
      m3x3.push(panel[mi*3 + m][mj*3 + n])
    }
  }

  return checkNumbers(row) && checkNumbers(column) && checkNumbers(m3x3)
}
exports.check = check

function checkNumbers(nums) {
  nums = nums.map(v => v)
  nums.sort()
  for (i = 0; i < 9; i++) {
    if (nums[i] !== i + 1) {
      return false
    }
  }
  return true
}
exports.checkNumbers = checkNumbers


function print(pan) {
  pan.forEach(function (row) {
    console.log(row)
  })
}

let myp = genPanel(
  [0, 1, 2], [0, 2, 9], [0, 6, 4],
  [1, 3, 5], [1, 6, 1],
  [2, 1, 4],
  [3, 4, 4], [3, 5, 2],
  [4, 0, 6], [4, 7, 7],
  [5, 0, 5],
  [6, 0, 7], [6, 3, 3], [6, 8, 5],
  [7, 1, 1], [7, 4, 9],
  [8, 7, 6]
);

print(myp)
sudo(myp)
console.log('---------')
print(myp)





