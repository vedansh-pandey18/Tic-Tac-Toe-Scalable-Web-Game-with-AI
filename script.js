// ==================== GAME STATE ====================
const gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameOver: false,
    gameMode: 'pvp',
    boardSize: 3,
    aiDifficulty: 'medium',
    playerNames: { X: 'Player 1', O: 'Player 2' },
    scores: { X: 0, O: 0 },
    moveCount: 0,
    matchHistory: [],
    boardDisabled: false,
    saveButtonUsed: false,
   
    reset() {
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.moveCount = 0;
        this.boardDisabled = false;
    },
   
    resetScores() {
        this.scores = { X: 0, O: 0 };
        this.saveButtonUsed = false;
    }
};

// ==================== DOM REFERENCES ====================
const DOM = {
    currentPlayerDisplay: document.getElementById('current-player'),
    gameStatusDisplay: document.getElementById('game-status'),
    player1Display: document.getElementById('player1'),
    player2Display: document.getElementById('player2'),
    name1Input: document.getElementById('name1'),
    name2Input: document.getElementById('name2'),
    score1Display: document.getElementById('player1-score'),
    score2Display: document.getElementById('player2-score'),
    saveBtn: document.getElementById('save'),
    resetBtn: document.getElementById('reset-button'),
    welcome: document.getElementById('welcome'),
    winnerMessage: document.getElementById('winner-message'),
    gameContainer: document.getElementById('gamecontainer'),
    gameContainerWrapper: document.getElementById('gamecontainer-wrapper'),
    gameModeSelect: document.getElementById('game-mode'),
    boardSizeSelect: document.getElementById('board-size'),
    aiDifficultySelect: document.getElementById('ai-difficulty'),
    difficultyWarning: document.getElementById('difficulty-warning'),
   
    getBox(index) {
        return document.querySelector(`[data-index="${index}"] .box`);
    }
};

// ==================== AUDIO ====================
const audio = {
    move: new Audio('gameball.wav'),
    win: new Audio('claps.mp3'),
    draw: new Audio('aww.mp3'),
    click: new Audio('click.wav'),
   
    getDuration(sound) {
        return sound.duration * 1000 || 1000;
    }
};

// ==================== PURE GAME LOGIC ====================

function checkWinner(board, boardSize) {
    const winLength = boardSize;
   
    // Check rows
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col <= boardSize - winLength; col++) {
            const start = row * boardSize + col;
            let match = true;
            const line = [];
            for (let i = 0; i < winLength; i++) {
                line.push(start + i);
                if (!board[start + i] || board[start + i] !== board[start]) {
                    match = false;
                    break;
                }
            }
            if (match) return { winner: board[start], line };
        }
    }
   
    // Check columns
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row <= boardSize - winLength; row++) {
            const start = row * boardSize + col;
            let match = true;
            const line = [];
            for (let i = 0; i < winLength; i++) {
                const idx = start + i * boardSize;
                line.push(idx);
                if (!board[idx] || board[idx] !== board[start]) {
                    match = false;
                    break;
                }
            }
            if (match) return { winner: board[start], line };
        }
    }
   
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= boardSize - winLength; row++) {
        for (let col = 0; col <= boardSize - winLength; col++) {
            const start = row * boardSize + col;
            let match = true;
            const line = [];
            for (let i = 0; i < winLength; i++) {
                const idx = start + i * (boardSize + 1);
                line.push(idx);
                if (!board[idx] || board[idx] !== board[start]) {
                    match = false;
                    break;
                }
            }
            if (match) return { winner: board[start], line };
        }
    }
   
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= boardSize - winLength; row++) {
        for (let col = winLength - 1; col < boardSize; col++) {
            const start = row * boardSize + col;
            let match = true;
            const line = [];
            for (let i = 0; i < winLength; i++) {
                const idx = start + i * (boardSize - 1);
                line.push(idx);
                if (!board[idx] || board[idx] !== board[start]) {
                    match = false;
                    break;
                }
            }
            if (match) return { winner: board[start], line };
        }
    }
   
    return null;
}

function checkDraw(board) {
    return board.every(cell => cell !== null);
}

function getAvailableMoves(board) {
    return board
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
}

function minimax(board, depth, isMaximizing, boardSize) {
    const result = checkWinner(board, boardSize);
   
    if (result) {
        return result.winner === 'O' ? 10 - depth : depth - 10;
    }
   
    if (checkDraw(board)) {
        return 0;
    }
   
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const move of getAvailableMoves(board)) {
            board[move] = 'O';
            const score = minimax(board, depth + 1, false, boardSize);
            board[move] = null;
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const move of getAvailableMoves(board)) {
            board[move] = 'X';
            const score = minimax(board, depth + 1, true, boardSize);
            board[move] = null;
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

function getAIMove(board, difficulty, boardSize) {
    const available = getAvailableMoves(board);
   
    if (difficulty === 'easy') {
        return available[Math.floor(Math.random() * available.length)];
    }
   
    if (difficulty === 'medium') {
        const winLength = boardSize;
        for (const move of available) {
            const boardCopy = [...board];
            boardCopy[move] = 'O';
            if (checkWinner(boardCopy, boardSize)?.winner === 'O') return move;
        }
        for (const move of available) {
            const boardCopy = [...board];
            boardCopy[move] = 'X';
            if (checkWinner(boardCopy, boardSize)?.winner === 'X') return move;
        }
        return available[Math.floor(Math.random() * available.length)];
    }
   
    if (difficulty === 'hard' && boardSize === 3) {
        let bestScore = -Infinity;
        let bestMove = available[0];
       
        for (const move of available) {
            const boardCopy = [...board];
            boardCopy[move] = 'O';
            const score = minimax(boardCopy, 0, false, boardSize);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
   
    return available[Math.floor(Math.random() * available.length)];
}

// ==================== DOM RENDERING ====================

function renderBoard() {
    DOM.gameContainer.innerHTML = '';
    const boardSize = gameState.boardSize;
    const cellSize = boardSize === 3 ? '10vw' : boardSize === 4 ? '7vw' : '6vw';
   
    DOM.gameContainer.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize})`;
    DOM.gameContainer.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize})`;
   
    for (let i = 0; i < boardSize * boardSize; i++) {
        const boardDiv = document.createElement('div');
        boardDiv.className = 'board';
        boardDiv.setAttribute('data-index', i);
       
        const boxSpan = document.createElement('span');
        boxSpan.className = 'box';
        boxSpan.innerHTML = gameState.board[i] || '';
       
        boardDiv.appendChild(boxSpan);
        boardDiv.addEventListener('click', () => {
            if (!gameState.boardDisabled) {
                makeMove(i);
            }
        });
       
        DOM.gameContainer.appendChild(boardDiv);
    }
}

// ==================== GAME FLOW ====================

function initializeGame() {
    if (gameState.gameMode === 'pvp') {
        gameState.playerNames.X = DOM.name1Input.value || 'Player 1';
        gameState.playerNames.O = DOM.name2Input.value || 'Player 2';
    } else {
        gameState.playerNames.X = DOM.name1Input.value || 'Player 1';
        gameState.playerNames.O = 'Computer';
    }
    gameState.reset();
    renderBoard();
    updateUI();
}

function makeMove(index) {
    if (gameState.gameOver || gameState.boardDisabled || gameState.board[index] !== null) {
        return false;
    }
   
    gameState.board[index] = gameState.currentPlayer;
    gameState.moveCount++;
    audio.move.play();
   
    const winResult = checkWinner(gameState.board, gameState.boardSize);
    if (winResult) {
        endGame(winResult.winner, winResult.line);
        return true;
    }
   
    if (checkDraw(gameState.board)) {
        endGame('draw');
        return true;
    }
   
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateUI();
   
    if (gameState.gameMode === 'pvc' && gameState.currentPlayer === 'O') {
        gameState.boardDisabled = true;
        setTimeout(playAI, 500);
    }
   
    return true;
}

function playAI() {
    if (gameState.gameOver) {
        gameState.boardDisabled = false;
        return;
    }
   
    const move = getAIMove(gameState.board, gameState.aiDifficulty, gameState.boardSize);
    gameState.board[move] = 'O';
    gameState.moveCount++;
    audio.move.play();
   
    const winResult = checkWinner(gameState.board, gameState.boardSize);
    if (winResult) {
        endGame(winResult.winner, winResult.line);
        return;
    }
   
    if (checkDraw(gameState.board)) {
        endGame('draw');
        return;
    }
   
    gameState.currentPlayer = 'X';
    gameState.boardDisabled = false;
    updateUI();
}

function endGame(result, winLine = null) {
    gameState.gameOver = true;
    gameState.boardDisabled = true;
   
    let soundToPlay = null;
    let soundDuration = 1000;
   
    if (result === 'draw') {
        DOM.winnerMessage.innerHTML = "It's a draw! 🤝";
        soundToPlay = audio.draw;
        soundDuration = audio.getDuration(audio.draw);
        audio.draw.play();
        saveMatchHistory('Draw', gameState.moveCount);
    } else {
        DOM.winnerMessage.innerHTML = `${gameState.playerNames[result]} wins! 🎉`;
        soundToPlay = audio.win;
        soundDuration = audio.getDuration(audio.win);
        audio.win.play();
        gameState.scores[result]++;
        saveMatchHistory(gameState.playerNames[result], gameState.moveCount);
       
        if (winLine) {
            highlightWinner(winLine);
        }
    }
   
    updateUI();
   
    setTimeout(() => {
        autoResetBoard();
    }, soundDuration + 500);
}

function autoResetBoard() {
    gameState.reset();
    document.querySelectorAll('.box').forEach(box => {
        box.classList.remove('winner');
    });
    DOM.winnerMessage.innerHTML = '';
    renderBoard();
    updateUI();
}

function highlightWinner(winLine) {
    winLine.forEach(index => {
        const box = DOM.getBox(index);
        if (box) box.classList.add('winner');
    });
}

function saveMatchHistory(winner, moves) {
    gameState.matchHistory.unshift({
        winner,
        moves,
        date: new Date().toISOString()
    });
   
    if (gameState.matchHistory.length > 10) {
        gameState.matchHistory.pop();
    }
   
    persistToStorage();
}

function resetGame() {
    gameState.resetScores();
    gameState.reset();
    gameState.matchHistory = [];
    document.querySelectorAll('.box').forEach(box => {
        box.innerHTML = '';
        box.classList.remove('winner');
    });
    DOM.winnerMessage.innerHTML = '';
    audio.click.play();
   
    DOM.name1Input.disabled = false;
    DOM.saveBtn.disabled = false;
   
    setDefaultPlayerNames();
   
    renderBoard();
    updateUI();
   
    const stateToSave = {
        scores: gameState.scores,
        matchHistory: gameState.matchHistory,
        gameMode: gameState.gameMode,
        boardSize: gameState.boardSize,
        aiDifficulty: gameState.aiDifficulty
    };
    localStorage.setItem('ticTacToeState', JSON.stringify(stateToSave));
}

function updateUI() {
    if (gameState.gameOver) {
        DOM.currentPlayerDisplay.innerHTML = '';
    } else {
        DOM.currentPlayerDisplay.innerHTML = `Current Player: ${gameState.playerNames[gameState.currentPlayer]}`;
    }
   
    DOM.score1Display.innerHTML = gameState.scores.X;
    DOM.score2Display.innerHTML = gameState.scores.O;
    DOM.player1Display.innerHTML = gameState.playerNames.X;
    DOM.player2Display.innerHTML = gameState.playerNames.O;
   
    DOM.gameModeSelect.value = gameState.gameMode;
    DOM.boardSizeSelect.value = gameState.boardSize;
    DOM.aiDifficultySelect.value = gameState.aiDifficulty;
   
    if (gameState.gameMode === 'pvc') {
        DOM.aiDifficultySelect.disabled = false;
        DOM.name2Input.disabled = true;
        if (gameState.boardSize !== 3 && DOM.aiDifficultySelect.value === 'hard') {
            DOM.difficultyWarning.innerHTML = 'Hard mode not available for 4x4 and 5x5';
            DOM.aiDifficultySelect.value = 'medium';
            gameState.aiDifficulty = 'medium';
        } else if (gameState.boardSize === 3) {
            DOM.difficultyWarning.innerHTML = '';
        } else {
            DOM.difficultyWarning.innerHTML = 'Hard mode disabled for this board size';
        }
    } else {
        DOM.aiDifficultySelect.disabled = true;
        DOM.difficultyWarning.innerHTML = '';
        DOM.name2Input.disabled = gameState.saveButtonUsed;
    }
   
    gameState.board.forEach((cell, index) => {
        const box = DOM.getBox(index);
        if (box) box.innerHTML = cell || '';
    });
   
    if (gameState.boardDisabled && !gameState.gameOver) {
        DOM.gameStatusDisplay.innerHTML = 'Computer is thinking...';
    } else {
        DOM.gameStatusDisplay.innerHTML = '';
    }
}

// ==================== STORAGE ====================

function loadFromStorage() {
    const saved = localStorage.getItem('ticTacToeState');
    if (saved) {
        const state = JSON.parse(saved);
        gameState.scores = state.scores || gameState.scores;
        gameState.matchHistory = state.matchHistory || gameState.matchHistory;
        gameState.gameMode = state.gameMode || 'pvp';
        gameState.boardSize = state.boardSize || 3;
        gameState.aiDifficulty = state.aiDifficulty || 'medium';
    }
}

function persistToStorage() {
    const state = {
        playerNames: gameState.playerNames,
        scores: gameState.scores,
        matchHistory: gameState.matchHistory,
        gameMode: gameState.gameMode,
        boardSize: gameState.boardSize,
        aiDifficulty: gameState.aiDifficulty
    };
    localStorage.setItem('ticTacToeState', JSON.stringify(state));
}

// ==================== DEFAULT PLAYER NAMES ====================

function setDefaultPlayerNames() {
    DOM.name1Input.value = 'Player 1';
    if (gameState.gameMode === 'pvc') {
        DOM.name2Input.value = 'Computer';
        DOM.name2Input.disabled = true;
        gameState.playerNames.X = 'Player 1';
        gameState.playerNames.O = 'Computer';
    } else {
        DOM.name2Input.value = 'Player 2';
        DOM.name2Input.disabled = false;
        gameState.playerNames.X = 'Player 1';
        gameState.playerNames.O = 'Player 2';
    }
}

// ==================== EVENT LISTENERS ====================

DOM.gameModeSelect.addEventListener('change', (e) => {
    gameState.gameMode = e.target.value;
    gameState.resetScores();
    gameState.matchHistory = [];
    setDefaultPlayerNames();
   
    DOM.name1Input.disabled = false;
    DOM.name2Input.disabled = false;
    DOM.saveBtn.disabled = false;
   
    persistToStorage();
    initializeGame();
    audio.click.play();
});

DOM.boardSizeSelect.addEventListener('change', (e) => {
    gameState.boardSize = parseInt(e.target.value);
    gameState.reset();
    gameState.resetScores();
    gameState.matchHistory = [];
    persistToStorage();
    renderBoard();
    updateUI();
    audio.click.play();
});

DOM.aiDifficultySelect.addEventListener('change', (e) => {
    gameState.aiDifficulty = e.target.value;
    persistToStorage();
    updateUI();
});

DOM.saveBtn.addEventListener('click', () => {
    gameState.playerNames.X = DOM.name1Input.value || 'Player 1';
    if (gameState.gameMode === 'pvp') {
        gameState.playerNames.O = DOM.name2Input.value || 'Player 2';
    } else {
        gameState.playerNames.O = 'Computer';
    }
    gameState.saveButtonUsed = true;
    gameState.resetScores();
    gameState.matchHistory = [];
   
    DOM.saveBtn.disabled = true;
    DOM.name1Input.disabled = true;
    if (gameState.gameMode === 'pvp') {
        DOM.name2Input.disabled = true;
    }
   
    persistToStorage();
    initializeGame();
    audio.click.play();
});

DOM.resetBtn.addEventListener('click', () => {
    resetGame();
    audio.win.pause();
});

document.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (key >= 1 && key <= 9) {
        if (!gameState.boardDisabled) {
            makeMove(key - 1);
        }
    }
});

// ==================== INITIALIZATION ====================
loadFromStorage();
setDefaultPlayerNames();
renderBoard();
initializeGame();
