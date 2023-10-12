'use strict';

const gameBoard = document.querySelector('#gameBoard');
const digits = document.querySelector('#digits');
const gamePlay = document.querySelector('#game');
const eraseBtn = document.querySelector('#delete');
const solveBtn = document.getElementById('solve');
const newGameBtn = document.getElementById('newGame');
let lastSelected = null;

let solArray = [[], [], [], [], [], [], [], [], []];

const selectTile = function () {
  if (lastSelected != null) {
    lastSelected.classList.remove('select-tile');
  }
  lastSelected = this;
  this.classList.add('select-tile');
};

const eraseNumber = function () {
  if (lastSelected.classList.contains('filled')) {
    lastSelected.innerText = '';
    lastSelected.classList.remove('filled');
  }
};

eraseBtn.addEventListener('click', eraseNumber);

const addNumber = function () {
  // if(isValid(){

  // })
  lastSelected.innerText = this.innerText;
  lastSelected.classList.add('filled');
  let row = lastSelected.getAttribute('row');
  let col = lastSelected.getAttribute('col');
};

const intitGame = function () {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const div = document.createElement('div');
      div.classList.add('tile');
      div.addEventListener('click', selectTile);
      div.setAttribute('row', i);
      div.setAttribute('col', j);

      if (i == 2 || i == 5) {
        div.classList.add('border-bottom');
      }
      if (j == 2 || j == 5) {
        div.classList.add('border-right');
      }
      gameBoard.appendChild(div);
    }
  }

  for (let i = 0; i < 9; i++) {
    const num = document.createElement('div');
    num.classList.add('tile');
    num.classList.add('removeEvent');
    num.addEventListener('click', addNumber);
    num.innerText = i + 1;
    digits.appendChild(num);
  }
};

intitGame();

const stringToArray = function (boardString) {
  const newArr = [];
  while (boardString.length) newArr.push(boardString.splice(0, 9));

  return newArr;
};

const isValidSudoku = (row, col, board, char) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] == char) {
      return false;
    }
  }

  for (let i = 0; i < 9; i++) {
    if (board[i][col] == char) {
      return false;
    }
  }

  const x = ~~(row / 3) * 3;
  const y = ~~(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[x + i][y + j] == char) {
        return false;
      }
    }
  }

  return true;
};

const solver = (board) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === '.') {
        let char = '1';
        while (+char <= 9) {
          if (isValidSudoku(i, j, board, char)) {
            board[i][j] = char;
            if (solver(board)) {
              return true;
            } else {
              board[i][j] = '.';
            }
          }
          char = (+char + 1).toString();
        }
        return false;
      }
    }
  }
  solArray = board;
  return true;
};

const FillBoard = function (solution) {
  const solString = solution
    .map((arr) => arr.map((val) => val).join(''))
    .flat();
  const allTiles = gameBoard.querySelectorAll('.tile');

  console.log(solString);
  let pointer = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (allTiles[pointer].textContent === '') {
        allTiles[pointer].textContent = solString[i][j];
      }

      pointer++;
    }
  }
};

const solveSudoku = function () {
  const allTiles = gameBoard.querySelectorAll('.tile');
  const boardString = [...allTiles].map((tile) =>
    tile.innerText != '' ? tile.innerText : '.'
  );
  const boardStringArray = stringToArray(boardString);
  console.log(boardStringArray);
  const sol = solver(boardStringArray);

  if (sol) {
    FillBoard(solArray);
    eraseBtn.removeEventListener('click', eraseNumber);
    const numDigits = document.querySelectorAll('.removeEvent');
    const x = [...numDigits].map((val) =>
      val.removeEventListener('click', addNumber)
    );
  } else {
    alert('Wrong Entry!');
  }
};

const hi = function () {
  gamePlay.style.opacity = 0;
  gameBoard.innerHTML = '';
  digits.innerHTML = '';
  intitGame();
  gamePlay.style.opacity = 1;
};

solveBtn.addEventListener('click', solveSudoku);
newGameBtn.addEventListener('click', hi);
