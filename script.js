'use strict';

// ********************************

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

// ********************************

const gameBoard = document.querySelector('#gameBoard');
const digits = document.querySelector('#digits');
const gamePlay = document.querySelector('#game');
const eraseBtn = document.querySelector('#delete');
const mistake = document.querySelector('#mistake');
const easyD = document.querySelector('#easy');
const mediumD = document.querySelector('#medium');
const hardD = document.querySelector('#hard');
const displayTime = document.getElementById('timer');
let timer = null;

let [seconds, minutes] = [0, 0];

function stopWatch() {
  seconds++;
  if (seconds == 60) {
    seconds = 0;
    minutes++;

    if (minutes == 60) {
      alert('Timeout!');
      location.reload();
    }
  }

  let m = minutes < 10 ? '0' + minutes : minutes;
  let s = seconds < 10 ? '0' + seconds : seconds;
  displayTime.innerHTML = m + ':' + s;
}

function watchStart() {
  if (timer !== null) {
    clearInterval(timer);
  }
  timer = setInterval(stopWatch, 1000);
}

function watchStop() {
  clearInterval(timer);
}

function watchReset() {
  clearInterval(timer);
  [seconds, minutes] = [0, 0];
  displayTime.innerHTML = '00:00';
}

let difficulty = 'easy';
let lastSelectedDifficulty = easyD;

let lastSelected = null;
let error = 0;

let board;
let sol;

const convertArrayToString = function (boardArray) {
  return boardArray
    .map((arr) => arr.map((val) => (val == 0 ? `-` : `${val}`)).join(''))
    .flat();
};

const selectTile = function () {
  if (lastSelected != null) {
    lastSelected.classList.remove('select-tile');
  }
  lastSelected = this;
  this.classList.add('select-tile');
};

const eraseNumber = function () {
  if (!lastSelected.classList.contains('filled')) {
    lastSelected.innerText = '';
  }
};

eraseBtn.addEventListener('click', eraseNumber);

const showError = function () {
  error++;
  mistake.innerText = error;

  if (error > 2) {
    setTimeout(function () {
      alert('You Lost. Start new Game');
      location.reload();
    }, 30);
  }
};

const isFilledCompletely = function () {
  const allTiles = gameBoard.querySelectorAll('.tile');
  return [...allTiles].every((tile) => {
    return tile.innerText != '';
  });
};

const addNumber = function () {
  if (!lastSelected.classList.contains('filled')) {
    lastSelected.innerText = this.innerText;
    let row = lastSelected.getAttribute('row');
    let col = lastSelected.getAttribute('col');

    if (sol[row][col] == lastSelected.innerText) {
      lastSelected.classList.remove('wrong-entry');
    } else {
      lastSelected.classList.add('wrong-entry');
      showError();
    }

    if (isFilledCompletely()) {
      const allTiles = gameBoard.querySelectorAll('.tile');
      let userSubmittedBoardSol = [...allTiles].map((tile) => tile.innerText);
      let pointer = 0;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (sol[i][j] != userSubmittedBoardSol[pointer]) {
            allTiles[pointer].classList.add('wrong-entry');
          }
          pointer++;
        }
      }
      let haveWrongEntry = [...allTiles].some((tile) =>
        tile.classList.contains('wrong-entry')
      );

      if (haveWrongEntry) {
        if (error > 2) {
          alert('You Lost');
          location.reload();
        }
      } else {
        alert('You Won!');
      }
    }
  }
};

const intitGame = function (puzzle) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const div = document.createElement('div');
      div.classList.add('tile');
      div.addEventListener('click', selectTile);
      div.setAttribute('row', i);
      div.setAttribute('col', j);

      if (puzzle[i][j] != '-') {
        div.innerText = puzzle[i][j];
        div.classList.add('filled');
      }
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
    const div = document.createElement('div');
    div.classList.add('tile');
    div.addEventListener('click', addNumber);
    div.innerText = i + 1;
    digits.appendChild(div);
  }
};

const getBoard = async function (difficulty) {
  try {
    const resData = await fetch(
      `https://sugoku.onrender.com/board?difficulty=${difficulty}`
    );

    if (!resData.ok) throw new Error('Error');

    const data = await resData.json();
    board = data.board;

    const solRes = await fetch('https://sugoku.onrender.com/solve', {
      method: 'POST',
      body: encodeParams(data),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

    if (!solRes.ok) throw new Error('Error');

    const solData = await solRes.json();
    const getSol = solData.solution;


    const boardStringArrayPuzzle = convertArrayToString(board);
    sol = convertArrayToString(getSol);
    intitGame(boardStringArrayPuzzle);

  } catch (error) {
    console.log(error);
  } finally {
    gamePlay.style.opacity = 1;
    watchStart();
  }
};

getBoard(difficulty);

window.onblur = function () {
  watchStop();
};

window.onfocus = function () {
  watchStart();
};

const setDifficuly = function () {
  watchReset();
  let diff = this.id;
  lastSelectedDifficulty.classList.remove('select-diff');
  lastSelectedDifficulty = this;
  this.classList.add('select-diff');
  gamePlay.style.opacity = 0;
  gameBoard.innerHTML = '';
  digits.innerHTML = '';
  alert(`Leaving this game and changed difficuty to ${diff}`);
  getBoard(diff);
};

easyD.addEventListener('click', setDifficuly);
mediumD.addEventListener('click', setDifficuly);
hardD.addEventListener('click', setDifficuly);
