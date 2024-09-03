const startScreen = document.getElementById('start-screen');
const modeSelection = document.getElementById('mode-selection');
const difficultySelection = document.getElementById('difficulty-selection');
const symbolSelection = document.getElementById('symbol-selection');
const gameBoard = document.getElementById('game-board');
const endScreen = document.getElementById('end-screen');
const gameStatus = document.getElementById('game-status');
const cells = document.querySelectorAll('.cell');
const winCount = document.getElementById('win-count');
const lossCount = document.getElementById('loss-count');
const tieCount = document.getElementById('tie-count');
let currentPlayer = 'X';
let playerSymbol = 'X';
let computerSymbol = 'O';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let vsComputer = false;
let computerDifficulty = '';
let wins = 0;
let losses = 0;
let ties = 0;

// Initial Screen
document.getElementById('play-button').addEventListener('click', () => {
    startScreen.classList.add('hidden');
    modeSelection.classList.remove('hidden');
});

// Mode Selection
document.getElementById('vs-player').addEventListener('click', () => {
    modeSelection.classList.add('hidden');
    symbolSelection.classList.remove('hidden');
    vsComputer = false;
});

document.getElementById('vs-computer').addEventListener('click', () => {
    modeSelection.classList.add('hidden');
    difficultySelection.classList.remove('hidden');
    vsComputer = true;
});

// Difficulty Selection
document.getElementById('easy').addEventListener('click', () => startSymbolSelection('easy'));
document.getElementById('hard').addEventListener('click', () => startSymbolSelection('hard'));

function startSymbolSelection(difficulty) {
    difficultySelection.classList.add('hidden');
    symbolSelection.classList.remove('hidden');
    computerDifficulty = difficulty;
}

// Symbol Selection
document.getElementById('choose-x').addEventListener('click', () => startGame('X'));
document.getElementById('choose-o').addEventListener('click', () => startGame('O'));

// Navigation Buttons
document.getElementById('back-button-mode').addEventListener('click', () => {
    modeSelection.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

document.getElementById('back-button-difficulty').addEventListener('click', () => {
    difficultySelection.classList.add('hidden');
    modeSelection.classList.remove('hidden');
});

document.getElementById('back-button-symbol').addEventListener('click', () => {
    symbolSelection.classList.add('hidden');
    vsComputer ? difficultySelection.classList.remove('hidden') : modeSelection.classList.remove('hidden');
});

// Game Initialization
function startGame(symbol) {
    playerSymbol = symbol;
    computerSymbol = symbol === 'X' ? 'O' : 'X';
    symbolSelection.classList.add('hidden');
    gameBoard.classList.remove('hidden');
    resetBoard();
    updateGameStatus();
}

// Handle Cell Click
function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');

    if (board[index] !== '' || !gameActive) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;

    if (checkWin()) {
        gameOver(vsComputer ? 
            (currentPlayer === playerSymbol ? "Player 1 wins!" : "Computer wins!") :
            (currentPlayer === playerSymbol ? "Player 1 wins!" : "Player 2 wins!")
        );
        currentPlayer === playerSymbol ? wins++ : (vsComputer ? losses++ : losses++);
        updateScoreBoard();
        return;
    }

    if (board.every(cell => cell !== '')) {
        gameOver("It's a tie!");
        ties++;
        updateScoreBoard();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus();

    if (vsComputer && currentPlayer === computerSymbol) {
        setTimeout(() => computerMove(), 500); // Ensure computer move after delay
    }
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Computer Move
function computerMove() {
    let move;

    if (computerDifficulty === 'easy') {
        move = easyComputerMove();
    } else {
        move = hardComputerMove();
    }

    if (move !== undefined) {
        board[move] = computerSymbol;
        cells[move].textContent = computerSymbol;

        if (checkWin()) {
            gameOver(vsComputer ? "Computer wins!" : "Player 2 wins!");
            losses++;
            updateScoreBoard();
            return;
        }

        if (board.every(cell => cell !== '')) {
            gameOver("It's a tie!");
            ties++;
            updateScoreBoard();
            return;
        }

        currentPlayer = playerSymbol;
        updateGameStatus();
    }
}

// Update Game Status
function updateGameStatus() {
    gameStatus.textContent = `${currentPlayer}'s turn`;
}

// Check for Win
function checkWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] !== '' && board[a] === board[b] && board[b] === board[c];
    });
}

// End Game
function gameOver(message) {
    gameActive = false;
    gameBoard.classList.add('hidden');
    endScreen.classList.remove('hidden');
    document.getElementById('result').textContent = message;
}

// Retry, Home, and Quit Buttons
document.getElementById('retry-button').addEventListener('click', () => {
    endScreen.classList.add('hidden');
    startGame(playerSymbol);
});

document.getElementById('home-button').addEventListener('click', () => {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

document.getElementById('quit-button').addEventListener('click', () => {
    window.close();
});

// Reset Board
function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
    });
    gameActive = true;
    currentPlayer = playerSymbol;
}

// Update Scoreboard
function updateScoreBoard() {
    winCount.textContent = wins;
    lossCount.textContent = losses;
    tieCount.textContent = ties;
}

// Easy AI Move
function easyComputerMove() {
    const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Hard AI Move
function hardComputerMove() {
    return minimax(board, computerSymbol).index;
}

// Find Winning Move
function findWinningMove(symbol) {
    return board.findIndex((cell, index) => {
        if (cell === '') {
            board[index] = symbol;
            const win = checkWin();
            board[index] = '';
            return win;
        }
        return false;
    });
}

// Minimax Algorithm for Hard AI
function minimax(board, player) {
    const opponent = player === 'X' ? 'O' : 'X';

    if (checkWin()) return { score: player === computerSymbol ? 10 : -10 };
    if (board.every(cell => cell !== '')) return { score: 0 };

    const scores = [];
    const moves = [];

    board.forEach((cell, index) => {
        if (cell === '') {
            board[index] = player;
            const result = minimax(board, opponent);
            board[index] = '';
            scores.push(result.score);
            moves.push(index);
        }
    });

    const bestMoveIndex = scores.indexOf(Math.max(...scores));
    return { score: scores[bestMoveIndex], index: moves[bestMoveIndex] };
}
