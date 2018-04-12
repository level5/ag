'use strict';
const Q = 'Q';
const EMPTY = '-';
const N = 8;
function initBoard() {
    const board = [];
    for (let i = 0; i < N; i++) {
        board[i] = [];
        for (let j = 0; j < N; j++) {
            board[i][j] = EMPTY;
        }
    }
    return board;
}
exports.findSolution = function () {
    const board = initBoard();
    const resolved = solution(board, N);
    return board;
};
function solution(board, n) {
    let i = n - 1;
    for (let j = 0; j < N; j++) {
        if (validPosition(board, i, j)) {
            board[i][j] = Q;
            if (n === 1 || solution(board, n - 1)) {
                return true;
            }
            else {
                board[i][j] = EMPTY;
            }
        }
    }
    return false;
}
function validPosition(board, i, j) {
    for (let n = 0; n < N; n++) {
        if (board[n][j] === Q || board[i][n] === Q) {
            return false;
        }
        if (i + n < N && j + n < N && board[i + n][j + n] === Q) {
            return false;
        }
        if (i - n >= 0 && j - n >= 0 && board[i - n][j - n] === Q) {
            return false;
        }
        if (i - n >= 0 && j + n < N && board[i - n][j + n] === Q) {
            return false;
        }
        if (i + n < N && j - n >= 0 && board[i + n][j - n] === Q) {
            return false;
        }
    }
    return true;
}
let r = exports.findSolution();
for (let i = 0; i < r.length; i++) {
    console.log(r[i]);
}
