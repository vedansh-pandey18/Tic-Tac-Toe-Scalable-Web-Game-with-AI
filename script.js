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

// Single source of truth for name input locking
let namesLocked = false;

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
    winningLineOverlay: document.getElementById('winning-line-overlay'),
   
    getBox(index) {
        return document.querySelector(`[data-index="${index}"] .box`);
    }
};

// ==================== UI EFFECTS ====================
function createParticles(cellIndex, winnerSymbol = null) {
    const cell = DOM.gameContainer.querySelector(`[data-index="${cellIndex}"]`);
    if (!cell) return;
    
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Color palette based on winner for better visual feedback
    const colorPalette = winnerSymbol === 'X' 
        ? ['#38BDF8', '#22D3EE', '#06B6D4']
        : winnerSymbol === 'O' 
        ? ['#F472B6', '#EC4899', '#F91E63']
        : ['#38BDF8', '#F472B6', '#22D3EE', '#A855F7'];
    
    const symbols = ['✨', '⭐', '💫', '✸', '🎉'];
    
    for (let i = 0; i < 26; i++) {  // Increased from 18 to 26
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        
        // Random size between 12-24px (larger and more visible)
        const size = Math.floor(Math.random() * 13) + 12;
        particle.style.setProperty('--particle-size', size + 'px');
        
        // 2x spread: 160-240px for greater visual impact
        const distance = Math.floor(Math.random() * 81) + 160;
        const angle = Math.random() * Math.PI * 2;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        // Random rotation for variety
        const rotation = Math.random() * 360;
        particle.style.setProperty('--rotation', rotation + 'deg');
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2500);
    }
}

function drawWinningLine(line, boardSize) {
    let overlay = DOM.winningLineOverlay;
    
    // Ensure overlay exists and is inside the container
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'winning-line-overlay';
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
        DOM.gameContainer.appendChild(overlay);
        DOM.winningLineOverlay = overlay;
    }
    
    // Clear only the SVG content, not the overlay element
    overlay.innerHTML = '';
    
    const container = DOM.gameContainer;
    
    // Get the first and last winning cells
    const firstCell = container.querySelector(`[data-index="${line[0]}"]`);
    const lastCell = container.querySelector(`[data-index="${line[line.length - 1]}"]`);
    
    if (!firstCell || !lastCell) return;
    
    // Query the .box elements INSIDE the cells for actual symbol geometry
    const firstBox = firstCell.querySelector('.box');
    const lastBox = lastCell.querySelector('.box');
    
    if (!firstBox || !lastBox) return;
    
    // Get container position for coordinate conversion
    const containerRect = container.getBoundingClientRect();
    
    // Measure the .box element bounding rectangles (actual symbol dimensions)
    const firstBoxRect = firstBox.getBoundingClientRect();
    const lastBoxRect = lastBox.getBoundingClientRect();
    
    // Calculate exact centers of the symbols relative to the overlay's coordinate space
    // (which is the same as the container since overlay is inside it)
    const startX = firstBoxRect.left - containerRect.left + firstBoxRect.width / 2;
    const startY = firstBoxRect.top - containerRect.top + firstBoxRect.height / 2;
    const endX = lastBoxRect.left - containerRect.left + lastBoxRect.width / 2;
    const endY = lastBoxRect.top - containerRect.top + lastBoxRect.height / 2;
    
    // Create SVG that fills the overlay container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', container.offsetWidth);
    svg.setAttribute('height', container.offsetHeight);
    svg.setAttribute('viewBox', `0 0 ${container.offsetWidth} ${container.offsetHeight}`);
    svg.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;');
    
    // Determine stroke color based on current player (winner)
    const strokeColor = gameState.currentPlayer === 'X' ? '#38BDF8' : '#F472B6';
    
    // Dynamic stroke width scaled with board size
    const strokeWidth = Math.max(3, boardSize * 1.3);
    
    // Create the line element
    const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineElement.setAttribute('x1', startX);
    lineElement.setAttribute('y1', startY);
    lineElement.setAttribute('x2', endX);
    lineElement.setAttribute('y2', endY);
    lineElement.setAttribute('stroke', strokeColor);
    lineElement.setAttribute('stroke-width', strokeWidth);
    lineElement.setAttribute('stroke-linecap', 'round');
    
    // Animate the line draw
    const lineLength = Math.hypot(endX - startX, endY - startY);
    lineElement.setAttribute('stroke-dasharray', lineLength);
    lineElement.setAttribute('stroke-dashoffset', lineLength);
    lineElement.style.animation = `drawLine 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
    
    svg.appendChild(lineElement);
    overlay.appendChild(svg);
}

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
    // Preserve the winning line overlay before clearing
    const overlay = DOM.gameContainer.querySelector('#winning-line-overlay');
    const overlayClone = overlay ? overlay.cloneNode(true) : null;
    
    DOM.gameContainer.innerHTML = '';
    
    // Re-append the overlay if it existed
    if (overlayClone) {
        DOM.gameContainer.appendChild(overlayClone);
        DOM.winningLineOverlay = overlayClone;
    }
    
    // Set CSS custom properties for current player colors
    const isPlayerX = gameState.currentPlayer === 'X';
    const playerColor = isPlayerX ? '#38BDF8' : '#F472B6';
    const playerColorRgb = isPlayerX ? '56, 189, 248' : '244, 114, 182';
    const playerGlow = isPlayerX ? 'rgba(56, 189, 248, 0.35)' : 'rgba(244, 114, 182, 0.35)';
    const playerGlowOutline = isPlayerX ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 114, 182, 0.4)';
    
    document.documentElement.style.setProperty('--player-color', playerColor);
    document.documentElement.style.setProperty('--player-color-rgb', playerColorRgb);
    document.documentElement.style.setProperty('--player-glow', playerGlow);
    document.documentElement.style.setProperty('--player-glow-outline', playerGlowOutline);
    
    const boardSize = gameState.boardSize;
    const cellSize = boardSize === 3 ? '10vw' : boardSize === 4 ? '7vw' : '6vw';
   
    DOM.gameContainer.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize})`;
    DOM.gameContainer.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize})`;
   
    for (let i = 0; i < boardSize * boardSize; i++) {
        const boardDiv = document.createElement('div');
        boardDiv.className = 'board';
        boardDiv.setAttribute('data-index', i);
        boardDiv.setAttribute('tabindex', '0');
        boardDiv.setAttribute('role', 'button');
        boardDiv.setAttribute('aria-label', `Cell ${i + 1}`);
       
        const boxSpan = document.createElement('span');
        boxSpan.className = 'box';
        boxSpan.innerHTML = gameState.board[i] || '';
        if (gameState.board[i]) {
            boxSpan.setAttribute('data-symbol', gameState.board[i]);
        }
        
        const previewSpan = document.createElement('span');
        previewSpan.className = 'preview';
        previewSpan.setAttribute('data-symbol', gameState.currentPlayer);
        previewSpan.innerHTML = gameState.currentPlayer;
       
        boardDiv.appendChild(boxSpan);
        boardDiv.appendChild(previewSpan);
        
        let hoverTimeout;
        
        boardDiv.addEventListener('mouseenter', () => {
            if (!gameState.board[i] && !gameState.boardDisabled && !gameState.gameOver) {
                // Dynamically update preview to match current player
                previewSpan.setAttribute('data-symbol', gameState.currentPlayer);
                previewSpan.innerHTML = gameState.currentPlayer;
                // Delay preview display by 80ms
                hoverTimeout = setTimeout(() => {
                    previewSpan.style.opacity = '0.35';
                }, 80);
            }
        });
        
        boardDiv.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            previewSpan.style.opacity = '0';
        });
        
        boardDiv.addEventListener('click', () => {
            if (!gameState.boardDisabled) {
                makeMove(i);
            }
        });
        
        boardDiv.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !gameState.boardDisabled) {
                e.preventDefault();
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
    
    const box = DOM.getBox(index);
    if (box) {
        box.innerHTML = gameState.currentPlayer;
        box.setAttribute('data-symbol', gameState.currentPlayer);
        box.classList.add('pop-in');
    }
   
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
        DOM.winnerMessage.className = '';
        soundToPlay = audio.draw;
        soundDuration = audio.getDuration(audio.draw);
        audio.draw.play();
        saveMatchHistory('Draw', gameState.moveCount);
    } else {
        DOM.winnerMessage.innerHTML = `${gameState.playerNames[result]} wins! 🎉`;
        DOM.winnerMessage.setAttribute('aria-live', 'polite');
        // Apply player-based color class to winner message
        DOM.winnerMessage.className = result === 'X' ? 'winner-x' : 'winner-o';
        soundToPlay = audio.win;
        soundDuration = audio.getDuration(audio.win);
        audio.win.play();
        gameState.scores[result]++;
        saveMatchHistory(gameState.playerNames[result], gameState.moveCount);
       
        if (winLine) {
            highlightWinner(winLine, result);
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
        box.classList.remove('pop-in');
    });
    // Clear the overlay content completely on reset
    if (DOM.winningLineOverlay) {
        DOM.winningLineOverlay.innerHTML = '';
    }
    DOM.winnerMessage.innerHTML = '';
    renderBoard();
    updateUI();
}

function highlightWinner(winLine, winnerSymbol = 'X') {
    // Trigger soft pulse animation on the game container
    DOM.gameContainer.classList.add('pulse-win');
    
    // Add enhanced glow to winning symbols
    winLine.forEach((index) => {
        const box = DOM.getBox(index);
        if (box) {
            box.classList.add('winner-glow');
        }
    });
    
    // Create particles without highlighting boxes
    winLine.forEach((index, idx) => {
        setTimeout(() => {
            createParticles(index, winnerSymbol);
        }, 200 + idx * 100);
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
    namesLocked = false;
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
    DOM.name2Input.disabled = false;
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
        DOM.currentPlayerDisplay.className = '';
    } else {
        DOM.currentPlayerDisplay.innerHTML = `Current Player: ${gameState.playerNames[gameState.currentPlayer]}`;
        // Apply player-based color class
        DOM.currentPlayerDisplay.className = gameState.currentPlayer === 'X' ? 'player-x' : 'player-o';
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
        if (box) {
            box.innerHTML = cell || '';
            if (cell) {
                box.setAttribute('data-symbol', cell);
            } else {
                box.removeAttribute('data-symbol');
            }
        }
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
    // Do not modify inputs if names are locked (after Save Names was clicked)
    if (namesLocked) {
        return;
    }
   
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
    // Prevent mode changes when names are locked
    if (namesLocked) {
        DOM.gameModeSelect.value = gameState.gameMode;
        return;
    }
   
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
    persistToStorage();
    renderBoard();
    updateUI();
    audio.click.play();
})

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
    namesLocked = true;
    gameState.resetScores();
    gameState.matchHistory = [];
   
    DOM.saveBtn.disabled = true;
    DOM.name1Input.disabled = true;
    DOM.name2Input.disabled = true;
   
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
