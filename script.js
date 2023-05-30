/*
 ** The Gameboard represents the state of the board
 ** Each equare holds a Tile (defined later)
 ** and we expose a dropToken method to be able to add Tiles to squares
 */

function Gameboard() {
  const rows = 3;
  const columns = 3;

  const board = [];
  // row 0 will represent the top row and
  // column 0 will represent the left-most column.
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Tile());
    }
  }
  // Method to get board that is used by UI
  const getBoard = () => board;

  // Method to mark selected Tile to a player's token
  const markTile = (row, column, player) => {
    if (board[row][column].getValue() !== 0) return; // ignore if selected tile is already filled
    board[row][column].addToken(player);
  };

  // Method to print out board values
  const printBoard = () => {
    // For each tile objects in board, get its value
    const boardValues = board.map((row) => row.map((tile) => tile.getValue()));
    console.log({ boardValues });
  };

  return { getBoard, markTile, printBoard };
}

/*
 ** A Tile represents one "square" on the board and can have a value of
 ** 0: no token is in the square,
 ** 1: Player One's token,
 ** 2: Player 2's token
 */

function Tile() {
  let value = 0;

  // Accept a player's token to change the value of the Tile
  const addToken = (player) => {
    value = player;
  };

  // Method to retrieve current value of Tile
  const getValue = () => value;

  return { addToken, getValue };
}

function isWinningMove(row, col, board, player) {
  const rows = board.length;
  const cols = board[0].length;

  // Check if the value of tiles in the same row is the same as player's token
  const isCompleteRow = (() => {
    for (let i = 0; i < cols; i++) {
      if (board[row][i].getValue() !== player.token) {
        return false;
      }
    }
    return true;
  })();

  // Check if the value of tiles in the same column is the same as player's token
  const isCompleteCol = (() => {
    for (let i = 0; i < rows; i++) {
      if (board[i][col].getValue() !== player.token) {
        return false;
      }
    }
    return true;
  })();

  // Check for diagonals
  const isDiag1 = () => {
    for (let i = 0; i < rows; i++) {
      if (board[i][i].getValue() !== player.token) {
        return false;
      }
    }
    return true;
  };

  const isDiag2 = () => {
    for (let i = 0; i < rows; i++) {
      if (board[i][rows - 1 - i].getValue !== player.token) {
        return false;
      }
    }
    return true;
  };

  const isCompleteDiag = (() => {
    if (Math.abs(row - col) % 2 !== 0) {
      return false; // return false if cell is not on diagonal
    } else {
      return isDiag1() || isDiag2();
    }
  })();

  return isCompleteRow || isCompleteCol || isCompleteDiag;
}

/*
 ** The GameController will be responsible for controlling the
 ** flow and state of the game's turns, as well as whether
 ** anybody has won the game
 */

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const gameboard = Gameboard();
  let roundCount = 1;

  const players = [
    {
      name: playerOneName,
      token: 1,
    },
    {
      name: playerTwoName,
      token: 2,
    },
  ];

  /* Define current activePlayer as a private variable,
   ** and visible methods to (1) switch current activePlayer, and
   ** (2) get the current activePlayer
   */
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    gameboard.printBoard();
    console.log(`${getActivePlayer().name}'s turn`);
  };

  // Code that will run at each round, starting after a player
  // has selected a tile.
  const playRound = (row, column) => {
    roundCount++;
    // Select a Tile and place marks
    gameboard.markTile(row, column, getActivePlayer().token);

    /* Check whether current move is game ending move
     ** either because current move is a winning move,
     ** or because there is no current winner and roundCount is 9
     ** which means all tiles have been filled.
     ** If current move is a winning move, the rest of the code below
     ** will not be run
     */
    if (isWinningMove(row, column, gameboard.getBoard(), getActivePlayer())) {
      // Play game end sequence
      moduleUI.endGameSequence(getActivePlayer());

      // Resets the game, keeping the score
    }
    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return { playRound, getActivePlayer, getBoard: gameboard.getBoard() };
}

const game = GameController();

// UI modules to contain functions for event listeners
const moduleUI = (() => {
  const container = document.querySelector(".container");
  const tilesUI = container.querySelectorAll(".tile");
  const playerOneTurn = document.querySelector(".player-turn .player-1");
  const playerTwoTurn = document.querySelector(".player-turn .player-2");
  const modal = container.querySelector(".modal");
  const winner = modal.querySelector(".winner-name");

  function updateDisplay(board = game.getBoard, player = game.getActivePlayer()) {
    // Get the tile token value and change the tile color correspondingly
    tilesUI.forEach((tileUI) => {
      const row = tileUI.getAttribute("data-row");
      const col = tileUI.getAttribute("data-col");
      const tileValue = board[row][col].getValue();
      tileUI.setAttribute("class", "tile");

      if (tileValue === 0) {
        tileUI.classList.add(`player-${player.token}`);
      } else if (tileValue !== 0) {
        tileUI.classList.add(`player-${tileValue}`);
        tileUI.classList.add("active");
      }
    });

    // Part of code to change player turn indicator
    if (player.token === 1) {
      playerOneTurn.setAttribute("class", "player-1 active");
      playerTwoTurn.setAttribute("class", "player-2");
    } else if (player.token === 2) {
      playerOneTurn.setAttribute("class", "player-1");
      playerTwoTurn.setAttribute("class", "player-2 active");
    }
  }

  function endGameSequence(player = game.getActivePlayer) {
    modal.classList.add('active');
    // Anounce the winner
    winner.textContent = player.name.toUpperCase();
  }

  function playerClick() {
    const row = this.getAttribute("data-row");
    const col = this.getAttribute("data-col");
    game.playRound(row, col);
    updateDisplay();
  }

  tilesUI.forEach((tileUI) => {
    tileUI.addEventListener("click", playerClick);
  });

  updateDisplay();

  return {updateDisplay, endGameSequence};
})();