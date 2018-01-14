'use strict'

/**
 * 二维数组
 */

const WALL = -1
const EMPTY = 0


function initMaze() {
  const maze = []
  // 初始化整个迷宫
  for (let i = 0; i < 10; i++) {
    maze[i] = []
    for (let j = 0; j < 10; j++) {
      maze[i][j] = EMPTY
    }
  }
  // 四面的墙
  for (let i = 0; i < 10; i++) {
    maze[0][i] = WALL
    maze[i][0] = WALL
    maze[9][i] = WALL
    maze[i][9] = WALL
  }

  // 创建墙
  maze[1][3] = maze[1][7] = maze[2][3] = maze[2][7] = WALL
  maze[3][5] = maze[3][6] = maze[4][2] = maze[4][3] = maze[4][4] = WALL
  maze[5][4] = maze[6][2] = maze[6][6] = WALL
  maze[7][2] = maze[7][3] = maze[7][4] = maze[7][6] = maze[7][7] = WALL
  maze[8][1] = WALL

  return {
    maze,
    start: {x: 1, y: 1},
    end: {x: 8, y: 8}
  }
}


exports.maze = initMaze()


function eql(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y
}

const NORTH = [-1, 0]
const SOUTH = [1, 0]
const WEST = [0, -1]
const EAST = [0, 1]


exports.mazePath = function mazePath(data) {
  const stack = []
  let currentStep = 1, currentPosition = data.start
  const maze = data.maze

  while (!eql(currentPosition, data.end)) {
    if (canPass(maze, currentPosition)) {
      mark(maze, currentPosition, currentStep)
      stack.push({p: currentPosition, s: currentStep, d: EAST})
      currentStep++
      currentPosition = go(currentPosition, EAST)
    } else {
      const lastStep = stack.pop()
      const next = nextDirect(lastStep.d)
      if (next) {
        lastStep.d = next
        stack.push(lastStep)
        currentPosition = go(lastStep.p, next)
      } else {
        currentPosition = lastStep.p
        currentStep = lastStep.s
      }
    }
  }
  if (eql(currentPosition, data.end)) {
    stack.push({p: currentPosition, s: currentStep, d: EAST})
    return stack.map(step => step.p)
  } else {
    return []
  }
}

function go(position, direct) {
  return {
    x: position.x + direct[0],
    y: position.y + direct[1]
  }
}

function nextDirect(direct) {
  if (direct === EAST) {
    return SOUTH
  }
  if (direct === SOUTH) {
    return WEST
  }
  if (direct === WEST) {
    return NORTH
  }
  return undefined
}

function canPass(maze, {x, y}) {
  return maze[x][y] === EMPTY
}

function mark(maze, {x, y}, number) {
  maze[x][y] = number
}

