'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const spinnerContainer = document.querySelector('.spinner-container');
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
  let difficulty = 'easy';
  let lastSelectedDifficulty = easyD;
  let lastSelected = null;
  let error = 0;
  let board;
  let sol;

  function showSpinner() {
    spinnerContainer.style.display = 'block';
  }

  function hideSpinner() {
    spinnerContainer.style.display = 'none';
  }

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

  const encodeBoard = (board) =>
    board.reduce(
      (result, row, i) =>
        result +
        `%5B${encodeURIComponent(row)}%5D${
          i === board.length - 1 ? '' : '%2C'
        }`,
      ''
    );

  const encodeParams = (params) =>
    Object.keys(params)
      .map((key) => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
      .join('&');

  const convertArrayToString = (boardArray) =>
    boardArray
      .map((arr) => arr.map((val) => (val == 0 ? `-` : `${val}`)).join(''))
      .flat();

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
    return [...allTiles].every((tile) => tile.innerText != '');
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

  const initGame = function (puzzle) {
    let gameBoardHTML = '';
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let tileClass = 'tile';
        if (puzzle[i][j] != '-') {
          tileClass += ' filled';
        }
        if (i == 2 || i == 5) {
          tileClass += ' border-bottom';
        }
        if (j == 2 || j == 5) {
          tileClass += ' border-right';
        }
        gameBoardHTML += `<div class="${tileClass}" row="${i}" col="${j}">${
          puzzle[i][j] != '-' ? puzzle[i][j] : ''
        }</div>`;
      }
    }
    gameBoard.innerHTML = gameBoardHTML;

    let digitsHTML = '';
    for (let i = 0; i < 9; i++) {
      digitsHTML += `<div class="tile" onclick="addNumber.call(this)">${
        i + 1
      }</div>`;
    }
    digits.innerHTML = digitsHTML;
  };

  const getBoard = async function (difficulty) {
    try {
      showSpinner();
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
      initGame(boardStringArrayPuzzle);
    } catch (error) {
      console.log(error);
    } finally {
      hideSpinner();
      gamePlay.style.opacity = 1;
      watchStart();
    }
  };

  window.onblur = function () {
    watchStop();
  };

  window.onfocus = function () {
    watchStart();
  };

  const setDifficulty = function () {
    watchReset();
    let diff = this.id;
    lastSelectedDifficulty.classList.remove('select-diff');
    lastSelectedDifficulty = this;
    this.classList.add('select-diff');
    gamePlay.style.opacity = 0;
    gameBoard.innerHTML = '';
    digits.innerHTML = '';
    alert(`Leaving this game and changed difficulty to ${diff}`);
    getBoard(diff);
  };

  easyD.addEventListener('click', setDifficulty);
  mediumD.addEventListener('click', setDifficulty);
  hardD.addEventListener('click', setDifficulty);
  getBoard('easy');
});
