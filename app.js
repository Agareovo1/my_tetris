document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.querySelector('.gameGrid'); // grid
    let gameGridSquares = Array.from(document.querySelectorAll('.gameGrid div')); // squares
    const TetrisScoreDisplay = document.querySelector('#score');
    const TetrisStartBtn = document.querySelector('#start-button');
    const gameGridWidth = 10; // width
    let nextRandomPieceIndex = 0; // nextRandom
    let TetrisTimerId; // timerId
    let TetrisScore = 0; // score
    const tetrominoColors = [ // colors
      'black',
      'brown',
      'green',
      'pink',
      'cyan'
    ];
  
    // The Tetrominoes
    const lShapeTetromino = [
      [1, gameGridWidth + 1, gameGridWidth * 2 + 1, 2],
      [gameGridWidth, gameGridWidth + 1, gameGridWidth + 2, gameGridWidth * 2 + 2],
      [1, gameGridWidth + 1, gameGridWidth * 2 + 1, gameGridWidth * 2],
      [gameGridWidth, gameGridWidth * 2, gameGridWidth * 2 + 1, gameGridWidth * 2 + 2]
    ];
  
    const zShapeTetromino = [
      [0, gameGridWidth, gameGridWidth + 1, gameGridWidth * 2 + 1],
      [gameGridWidth + 1, gameGridWidth + 2, gameGridWidth * 2, gameGridWidth * 2 + 1],
      [0, gameGridWidth, gameGridWidth + 1, gameGridWidth * 2 + 1],
      [gameGridWidth + 1, gameGridWidth + 2, gameGridWidth * 2, gameGridWidth * 2 + 1]
    ];
  
    const tShapeTetromino = [
      [1, gameGridWidth, gameGridWidth + 1, gameGridWidth + 2],
      [1, gameGridWidth + 1, gameGridWidth + 2, gameGridWidth * 2 + 1],
      [gameGridWidth, gameGridWidth + 1, gameGridWidth + 2, gameGridWidth * 2 + 1],
      [1, gameGridWidth, gameGridWidth + 1, gameGridWidth * 2 + 1]
    ];
  
    const oShapeTetromino = [
      [0, 1, gameGridWidth, gameGridWidth + 1],
      [0, 1, gameGridWidth, gameGridWidth + 1],
      [0, 1, gameGridWidth, gameGridWidth + 1],
      [0, 1, gameGridWidth, gameGridWidth + 1]
    ];
  
    const iShapeTetromino = [
      [1, gameGridWidth + 1, gameGridWidth * 2 + 1, gameGridWidth * 3 + 1],
      [gameGridWidth, gameGridWidth + 1, gameGridWidth + 2, gameGridWidth + 3],
      [1, gameGridWidth + 1, gameGridWidth * 2 + 1, gameGridWidth * 3 + 1],
      [gameGridWidth, gameGridWidth + 1, gameGridWidth + 2, gameGridWidth + 3]
    ];
  
    const tetrominoShapes = [lShapeTetromino, zShapeTetromino, tShapeTetromino, oShapeTetromino, iShapeTetromino];
  
    let currentPiecePosition = 4;
    let currentPieceRotation = 0;
  
    // randomly select a tetromino and its first rotation
    let randomPieceIndex = Math.floor(Math.random() * tetrominoShapes.length);
    let currentPiece = tetrominoShapes[randomPieceIndex][currentPieceRotation];
  
    // draw the current tetromino
    function drawTetromino() {
      currentPiece.forEach(index => {
        gameGridSquares[currentPiecePosition + index].classList.add('tetromino');
        gameGridSquares[currentPiecePosition + index].style.backgroundColor = tetrominoColors[randomPieceIndex];
      });
    }
  
    // undraw the current tetromino
    function undrawTetromino() {
      currentPiece.forEach(index => {
        gameGridSquares[currentPiecePosition + index].classList.remove('tetromino');
        gameGridSquares[currentPiecePosition + index].style.backgroundColor = '';
      });
    }
  
    // move the tetromino down
    function moveTetrominoDown() {
      undrawTetromino();
      currentPiecePosition += gameGridWidth;
      drawTetromino();
      freezeTetromino();
    }
  
    // freeze the tetromino in place
    function freezeTetromino() {
      if (currentPiece.some(index => gameGridSquares[currentPiecePosition + index + gameGridWidth].classList.contains('taken'))) {
        currentPiece.forEach(index => gameGridSquares[currentPiecePosition + index].classList.add('taken'));
        // start a new tetromino falling
        randomPieceIndex = nextRandomPieceIndex;
        nextRandomPieceIndex = Math.floor(Math.random() * tetrominoShapes.length);
        currentPiece = tetrominoShapes[randomPieceIndex][currentPieceRotation];
        currentPiecePosition = 4;
        drawTetromino();
        updateNextTetrominoDisplay();
        updateScore();
        checkGameOver();
      }
    }
  
    // move the tetromino left
    function moveTetrominoLeft() {
      undrawTetromino();
      const isAtLeftEdge = currentPiece.some(index => (currentPiecePosition + index) % gameGridWidth === 0);
  
      if (!isAtLeftEdge) {
        currentPiecePosition -= 1;
      }
  
      if (currentPiece.some(index => gameGridSquares[currentPiecePosition + index].classList.contains('taken'))) {
        currentPiecePosition += 1;
      }
  
      drawTetromino();
    }
  
    // move the tetromino right
    function moveTetrominoRight() {
      undrawTetromino();
      const isAtRightEdge = currentPiece.some(index => (currentPiecePosition + index) % gameGridWidth === gameGridWidth - 1);
  
      if (!isAtRightEdge) {
        currentPiecePosition += 1;
      }
  
      if (currentPiece.some(index => gameGridSquares[currentPiecePosition + index].classList.contains('taken'))) {
        currentPiecePosition -= 1;
      }
  
      drawTetromino();
    }
  
    // rotate the tetromino
    function rotateTetromino() {
      undrawTetromino();
      currentPieceRotation++;
  
      if (currentPieceRotation === currentPiece.length) {
        currentPieceRotation = 0;
      }
  
      currentPiece = tetrominoShapes[randomPieceIndex][currentPieceRotation];
      drawTetromino();
    }
  
    // show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.preview-grid div');
    const displayWidth = 4;
    let displayIndex = 0;
  
    // The Tetrominoes without rotations
    const upNextTetrominoes = [
      [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lShapeTetromino
      [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // zShapeTetromino
      [1, displayWidth, displayWidth + 1, displayWidth + 2], // tShapeTetromino
      [0, 1, displayWidth, displayWidth + 1], // oShapeTetromino
      [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // iShapeTetromino
    ];
  
    // display the shape in the preview-grid display
    function updateNextTetrominoDisplay() {
      displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
      });
      upNextTetrominoes[nextRandomPieceIndex].forEach(index => {
        displaySquares[displayIndex + index].classList.add('tetromino');
        displaySquares[displayIndex + index].style.backgroundColor = tetrominoColors[nextRandomPieceIndex];
      });
    }
  
    // add functionality to the button
    TetrisStartBtn.addEventListener('click', () => {
      if (TetrisTimerId) {
        clearInterval(TetrisTimerId);
        TetrisTimerId = null;
      } else {
        drawTetromino();
        TetrisTimerId = setInterval(moveTetrominoDown, 1000);
        nextRandomPieceIndex = Math.floor(Math.random() * tetrominoShapes.length);
        updateNextTetrominoDisplay();
      }
    });
  
    // add score
    function updateScore() {
      for (let i = 0; i < 199; i += gameGridWidth) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
        if (row.every(index => gameGridSquares[index].classList.contains('taken'))) {
          TetrisScore += 10;
          TetrisScoreDisplay.innerHTML = TetrisScore;
          row.forEach(index => {
            gameGridSquares[index].classList.remove('taken');
            gameGridSquares[index].classList.remove('tetromino');
            gameGridSquares[index].style.backgroundColor = '';
          });
  
          const squaresRemoved = gameGridSquares.splice(i, gameGridWidth);
          gameGridSquares = squaresRemoved.concat(gameGridSquares);
          gameGridSquares.forEach(cell => gameGrid.appendChild(cell));
        }
      }
    }
  
    // game over
    function checkGameOver() {
      if (currentPiece.some(index => gameGridSquares[currentPiecePosition + index].classList.contains('taken'))) {
        TetrisScoreDisplay.innerHTML = 'Game Over';
        clearInterval(TetrisTimerId);
      }
    }
  
    // assign function to KeyCodes
    function handleKeyPress(e) {
      if (TetrisTimerId) {
        if (e.keyCode === 37) {
          moveTetrominoLeft();
        } else if (e.keyCode === 38) {
          rotateTetromino();
        } else if (e.keyCode === 39) {
          moveTetrominoRight();
        } else if (e.keyCode === 40) {
          moveTetrominoDown();
        }
      }
    }
  
    document.addEventListener('keyup', handleKeyPress);
  });
  