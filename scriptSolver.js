// 'use strict';

console.log('hello');

// const getBoard = async function () {
//   try {
//     const resData = await fetch(
//       'https://sugoku.onrender.com/board?difficulty=easy'
//     );

//     if (!resData.ok) throw new Error('Error');

//     const data = await resData.json();
//     let {board} = data;
//     console.log(board);
//     return board;
//   } catch (error) {
//     console.log(error);
//   }
// };

const encodeBoard = (board) =>
  board.reduce(
    (result, row, i) =>
      result +
      `%5B${encodeURIComponent(row)}%5D${i === board.length - 1 ? '' : '%2C'}`,
    ''
  );

const encodeParams = (params) =>
  Object.keys(params)
    .map((key) => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
    .join('&');

// ********************************** //

// const data = {
//   board: [
//     [0, 0, 0, 0, 0, 0, 8, 0, 0],
//     [0, 0, 4, 0, 0, 8, 0, 0, 9],
//     [0, 7, 0, 0, 0, 0, 0, 0, 5],
//     [0, 1, 0, 0, 7, 5, 0, 0, 8],
//     [0, 5, 6, 0, 9, 1, 3, 0, 0],
//     [7, 8, 0, 0, 0, 0, 0, 0, 0],
//     [0, 2, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 9, 3, 0, 0, 1, 0],
//     [0, 0, 5, 7, 0, 0, 4, 0, 3],
//   ],
// };

// fetch('https://sugoku.onrender.com/solve', {
//   method: 'POST',
//   body: encodeParams(data),
//   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
// })
//   .then((response) => response.json())
//   .then((response) => console.log(response.solution))
//   .catch(console.warn);

var board = [[], [], [], [], [], [], [], [], []];

const getBoard = async function () {
  try {
    const resData = await fetch(
      'https://sugoku.onrender.com/board?difficulty=easy'
    );

    if (!resData.ok) throw new Error('Error');

    const data = await resData.json();
    board = data.board;
    console.log(board);

    FillBoard(board);

    const solRes = await fetch('https://sugoku.onrender.com/solve', {
      method: 'POST',
      body: encodeParams(data),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

    if (!solRes.ok) throw new Error('Error');

    const sol = await solRes.json();

    console.log(sol.solution);
  } catch (error) {
    console.log(error);
  }
};

getBoard();
