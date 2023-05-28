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
    for (let j = 0; i < columns; j++) {
      board[i].push(Tile());
    }
  }

  // Method to get board that is used by UI
  const getBoard = () => board;

  // Method to mark selected Tile to a player's token
  const markTile = (row, column, player) => {
    // Return if selected tile is already filled
    if (board[row][column].getValue !== 0) return;
    board[row][column].addToken(player);
  };

  // Method to print out board values
  const printBoard = () => {
    // For each tile objects in board, get its value
    const boardValues = board.map((row) => row.map((tile) => tile.getValue));
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
  const roundCount = 1;

  const players = [
    {
      name: playerOneName,
      token: 1,
    },
    {
      name: playerTwoName,
      tolen: 2,
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
    board.printBoard();
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
    ** which means all cells have been filled.
    ** If current move is a winning move, the rest of the code below 
    ** will not be run
    */

    switchPlayerTurn();
    printNewRound()
  }

  printNewRound();

  return {playRound, getActivePlayer};
}

