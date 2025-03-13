// Backgammon Game Logic
class BackgammonGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.dice = [0, 0];
        this.availableMoves = [];
        this.selectedChecker = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameOver = false;

        this.setupBoard();
        this.setupEventListeners();
    }

    // Initialize the board data structure
    initializeBoard() {
        // Initialize empty board (24 points, bar for both players, and home for both players)
        const board = {
            points: Array(24).fill().map(() => ({ checkers: [], color: null })),
            bar: { white: 0, black: 0 },
            home: { white: 0, black: 0 }
        };

        // Set up the initial checker positions
        // White's starting positions
        this.addCheckers(board.points[0], 'white', 2);
        this.addCheckers(board.points[11], 'white', 5);
        this.addCheckers(board.points[16], 'white', 3);
        this.addCheckers(board.points[18], 'white', 5);

        // Black's starting positions
        this.addCheckers(board.points[23], 'black', 2);
        this.addCheckers(board.points[12], 'black', 5);
        this.addCheckers(board.points[7], 'black', 3);
        this.addCheckers(board.points[5], 'black', 5);

        return board;
    }

    // Add checkers to a point
    addCheckers(point, color, count) {
        for (let i = 0; i < count; i++) {
            point.checkers.push(color);
        }
        point.color = point.checkers.length > 0 ? point.checkers[0] : null;
    }

    // Set up the visual board
    setupBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // Create the board visually
        // Top row (points 12-23)
        const topRow = document.createElement('div');
        topRow.className = 'quadrant top';

        for (let i = 12; i < 24; i++) {
            const point = document.createElement('div');
            point.className = `point ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.point = i;
            
            const triangle = document.createElement('div');
            triangle.className = 'triangle';
            point.appendChild(triangle);
            
            const label = document.createElement('div');
            label.className = 'point-label';
            label.textContent = i + 1;
            point.appendChild(label);
            
            // Add checkers
            this.renderCheckers(point, this.board.points[i], 'top');
            
            topRow.appendChild(point);
            
            // Add the bar in the middle
            if (i === 17) {
                const bar = this.createBar();
                topRow.appendChild(bar);
            }
        }
        
        // Bottom row (points 11-0)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'quadrant bottom';
        
        for (let i = 11; i >= 0; i--) {
            const point = document.createElement('div');
            point.className = `point ${i % 2 === 0 ? 'light' : 'dark'}`;
            point.dataset.point = i;
            
            const triangle = document.createElement('div');
            triangle.className = 'triangle';
            point.appendChild(triangle);
            
            const label = document.createElement('div');
            label.className = 'point-label';
            label.textContent = i + 1;
            point.appendChild(label);
            
            // Add checkers
            this.renderCheckers(point, this.board.points[i], 'bottom');
            
            bottomRow.appendChild(point);
            
            // Add the bar in the middle
            if (i === 6) {
                const bar = this.createBar('bottom');
                bottomRow.appendChild(bar);
            }
        }
        
        // Create home areas
        const whiteHome = this.createHome('white');
        const blackHome = this.createHome('black');
        
        // Add all elements to the board
        boardElement.appendChild(whiteHome);
        boardElement.appendChild(topRow);
        boardElement.appendChild(bottomRow);
        boardElement.appendChild(blackHome);
        
        // Update UI
        this.updateUI();
    }
    
    // Create the bar element
    createBar(position = 'top') {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.dataset.bar = true;
        
        // Add checkers from the bar
        const whiteCount = this.board.bar.white;
        const blackCount = this.board.bar.black;
        
        if (position === 'top' && blackCount > 0) {
            for (let i = 0; i < blackCount; i++) {
                const checker = this.createChecker('black');
                checker.dataset.bar = true;
                bar.appendChild(checker);
            }
        }
        
        if (position === 'bottom' && whiteCount > 0) {
            for (let i = 0; i < whiteCount; i++) {
                const checker = this.createChecker('white');
                checker.dataset.bar = true;
                bar.appendChild(checker);
            }
        }
        
        return bar;
    }
    
    // Create home area
    createHome(color) {
        const home = document.createElement('div');
        home.className = 'home';
        home.dataset.home = color;
        
        const label = document.createElement('div');
        label.className = 'home-label';
        label.textContent = `${color.charAt(0).toUpperCase() + color.slice(1)} Home`;
        home.appendChild(label);
        
        // Add home checkers
        const count = this.board.home[color];
        for (let i = 0; i < count; i++) {
            const checker = this.createChecker(color);
            home.appendChild(checker);
        }
        
        return home;
    }
    
    // Render checkers on a point
    renderCheckers(pointElement, pointData, position) {
        const checkers = pointData.checkers;
        
        for (let i = 0; i < checkers.length; i++) {
            const checker = this.createChecker(checkers[i]);
            checker.dataset.point = pointElement.dataset.point;
            checker.dataset.index = i;
            pointElement.appendChild(checker);
        }
    }
    
    // Create a checker element
    createChecker(color) {
        const checker = document.createElement('div');
        checker.className = `checker ${color}`;
        return checker;
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Roll dice button
        document.getElementById('roll-dice').addEventListener('click', () => {
            this.rollDice();
        });
        
        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Undo move button
        document.getElementById('undo-move').addEventListener('click', () => {
            this.undoMove();
        });
    }
    
    // Roll the dice
    rollDice() {
        if (this.gameOver) return;
        
        // Clear any selected state
        this.clearSelection();
        
        // Only allow rolling if no moves are available
        if (this.availableMoves.length > 0) return;
        
        // Roll two dice
        this.dice = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        
        // If doubles, player gets 4 moves of that value
        if (this.dice[0] === this.dice[1]) {
            this.availableMoves = Array(4).fill(this.dice[0]);
        } else {
            this.availableMoves = [...this.dice];
        }
        
        // Check if the player has any valid moves
        if (!this.hasValidMoves()) {
            alert(`No valid moves for ${this.currentPlayer}. Turn passes to the other player.`);
            this.switchPlayer();
            this.availableMoves = [];
        } else {
            this.highlightSelectableCheckers();
        }
        
        this.updateUI();
    }
    
    // Check if the current player has any valid moves
    hasValidMoves() {
        const player = this.currentPlayer;
        
        // Check if there are checkers on the bar
        if (this.board.bar[player] > 0) {
            // Check if the player can enter from the bar
            for (const dieValue of this.availableMoves) {
                const targetPoint = player === 'white' ? dieValue - 1 : 24 - dieValue;
                if (this.isValidMove(-1, targetPoint)) {
                    return true;
                }
            }
            return false;
        }
        
        // Check each point for valid moves
        for (let i = 0; i < 24; i++) {
            const point = this.board.points[i];
            if (point.color === player) {
                for (const dieValue of this.availableMoves) {
                    // Calculate target point based on direction of movement
                    const targetPoint = player === 'white' ? i + dieValue : i - dieValue;
                    
                    // Check if this is a valid move
                    if (this.isValidMove(i, targetPoint)) {
                        return true;
                    }
                    
                    // Check for bearing off
                    if (this.canBearOff(player)) {
                        if (player === 'white' && targetPoint >= 24) {
                            if (i === this.getFurthestChecker('white') || targetPoint === 24) {
                                return true;
                            }
                        } else if (player === 'black' && targetPoint < 0) {
                            if (i === this.getFurthestChecker('black') || targetPoint === -1) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    // Check if a player can bear off (all checkers in home board)
    canBearOff(player) {
        const startPoint = player === 'white' ? 18 : 0;
        const endPoint = player === 'white' ? 23 : 5;
        
        // Check if there are any checkers outside the home board or on the bar
        if (this.board.bar[player] > 0) {
            return false;
        }
        
        for (let i = 0; i < 24; i++) {
            // Skip points in the home board
            if (i >= startPoint && i <= endPoint) {
                continue;
            }
            
            // If there's a checker outside the home board, can't bear off
            if (this.board.points[i].checkers.includes(player)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get the furthest checker for a player (used for bearing off)
    getFurthestChecker(player) {
        if (player === 'white') {
            // For white, search from 0 to 23
            for (let i = 0; i < 24; i++) {
                if (this.board.points[i].checkers.includes('white')) {
                    return i;
                }
            }
        } else {
            // For black, search from 23 to 0
            for (let i = 23; i >= 0; i--) {
                if (this.board.points[i].checkers.includes('black')) {
                    return i;
                }
            }
        }
        return player === 'white' ? 0 : 23; // Fallback
    }
    
    // Check if a move is valid
    isValidMove(fromPoint, toPoint) {
        const player = this.currentPlayer;
        const opponent = player === 'white' ? 'black' : 'white';
        
        // From bar
        if (fromPoint === -1) {
            // Must have checkers on the bar
            if (this.board.bar[player] === 0) {
                return false;
            }
            
            // Target point must be on the board
            if (toPoint < 0 || toPoint >= 24) {
                return false;
            }
            
            // Target point must not have 2+ opponent checkers
            if (this.board.points[toPoint].color === opponent && 
                this.board.points[toPoint].checkers.length >= 2) {
                return false;
            }
            
            return true;
        }
        
        // Regular move checks
        
        // Point must be on the board, or bearing off
        if ((toPoint < 0 || toPoint >= 24) && !this.canBearOff(player)) {
            return false;
        }
        
        // Must have a checker at from point
        if (!this.board.points[fromPoint].checkers.includes(player)) {
            return false;
        }
        
        // If bearing off, check if it's allowed
        if (toPoint < 0 || toPoint >= 24) {
            return this.canBearOff(player);
        }
        
        // Target point must not have 2+ opponent checkers
        if (this.board.points[toPoint].color === opponent && 
            this.board.points[toPoint].checkers.length >= 2) {
            return false;
        }
        
        return true;
    }
    
    // Highlight checkers that can be moved
    highlightSelectableCheckers() {
        const player = this.currentPlayer;
        
        // Clear previous highlighting
        this.clearSelection();
        
        // If there are checkers on the bar, only they can be moved
        if (this.board.bar[player] > 0) {
            const barCheckers = document.querySelectorAll(`.checker.${player}[data-bar]`);
            barCheckers.forEach(checker => {
                checker.classList.add('selectable');
                checker.addEventListener('click', () => this.selectChecker(checker));
            });
            return;
        }
        
        // Otherwise, highlight checkers that have valid moves
        for (let i = 0; i < 24; i++) {
            if (this.board.points[i].color === player) {
                // Check if any of the available moves can be used with this checker
                let hasValidMove = false;
                
                for (const dieValue of this.availableMoves) {
                    const targetPoint = player === 'white' ? i + dieValue : i - dieValue;
                    if (this.isValidMove(i, targetPoint)) {
                        hasValidMove = true;
                        break;
                    }
                    
                    // Check for bearing off
                    if (this.canBearOff(player)) {
                        if (player === 'white' && targetPoint >= 24) {
                            if (i === this.getFurthestChecker('white') || targetPoint === 24) {
                                hasValidMove = true;
                                break;
                            }
                        } else if (player === 'black' && targetPoint < 0) {
                            if (i === this.getFurthestChecker('black') || targetPoint === -1) {
                                hasValidMove = true;
                                break;
                            }
                        }
                    }
                }
                
                if (hasValidMove) {
                    const checkers = document.querySelectorAll(`.checker.${player}[data-point="${i}"]`);
                    if (checkers.length > 0) {
                        const topChecker = checkers[checkers.length - 1];
                        topChecker.classList.add('selectable');
                        topChecker.addEventListener('click', () => this.selectChecker(topChecker));
                    }
                }
            }
        }
    }
    
    // Select a checker to move
    selectChecker(checker) {
        // Clear previous selection
        this.clearSelection();
        
        // Highlight the selected checker
        checker.classList.add('selected');
        this.selectedChecker = checker;
        
        // Show valid moves for this checker
        this.showValidMoves(checker);
    }
    
    // Show valid moves for the selected checker
    showValidMoves(checker) {
        const player = this.currentPlayer;
        let fromPoint;
        
        // Check if the checker is on the bar
        if (checker.dataset.bar) {
            fromPoint = -1;
        } else {
            fromPoint = parseInt(checker.dataset.point);
        }
        
        // Clear previous valid move indicators
        this.clearValidMoveIndicators();
        
        // For each available dice value, check if it's a valid move
        for (let i = 0; i < this.availableMoves.length; i++) {
            const dieValue = this.availableMoves[i];
            const targetPoint = player === 'white' ? 
                (fromPoint === -1 ? dieValue - 1 : fromPoint + dieValue) : 
                (fromPoint === -1 ? 24 - dieValue : fromPoint - dieValue);
            
            // Check for regular moves
            if (targetPoint >= 0 && targetPoint < 24) {
                if (this.isValidMove(fromPoint, targetPoint)) {
                    this.addValidMoveIndicator(targetPoint, dieValue);
                }
            } 
            // Check for bearing off
            else if (this.canBearOff(player)) {
                if (player === 'white' && targetPoint >= 24) {
                    if (fromPoint === this.getFurthestChecker('white') || targetPoint === 24) {
                        const homeElement = document.querySelector('[data-home="white"]');
                        this.addValidMoveIndicator('home-white', dieValue);
                    }
                } else if (player === 'black' && targetPoint < 0) {
                    if (fromPoint === this.getFurthestChecker('black') || targetPoint === -1) {
                        const homeElement = document.querySelector('[data-home="black"]');
                        this.addValidMoveIndicator('home-black', dieValue);
                    }
                }
            }
        }
    }
    
    // Add a valid move indicator
    addValidMoveIndicator(targetPoint, dieValue) {
        let targetElement;
        
        if (targetPoint === 'home-white' || targetPoint === 'home-black') {
            targetElement = document.querySelector(`[data-home="${targetPoint.split('-')[1]}"]`);
        } else {
            targetElement = document.querySelector(`.point[data-point="${targetPoint}"]`);
        }
        
        if (!targetElement) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'valid-move';
        indicator.dataset.dieValue = dieValue;
        
        // Position the indicator
        if (targetPoint === 'home-white' || targetPoint === 'home-black') {
            indicator.style.top = '50%';
        } else {
            const checkerCount = this.board.points[targetPoint].checkers.length;
            if (targetPoint < 12) {
                indicator.style.bottom = `${checkerCount * 35 + 40}px`;
            } else {
                indicator.style.top = `${checkerCount * 35 + 40}px`;
            }
        }
        
        // Add click event to move the checker
        indicator.addEventListener('click', () => {
            this.moveChecker(targetPoint, dieValue);
        });
        
        targetElement.appendChild(indicator);
        this.validMoves.push(indicator);
    }
    
    // Clear valid move indicators
    clearValidMoveIndicators() {
        this.validMoves.forEach(indicator => {
            indicator.remove();
        });
        this.validMoves = [];
    }
    
    // Move a checker
    moveChecker(targetPoint, dieValue) {
        const player = this.currentPlayer;
        let fromPoint;
        
        // Determine the source point
        if (this.selectedChecker.dataset.bar) {
            fromPoint = -1;
        } else {
            fromPoint = parseInt(this.selectedChecker.dataset.point);
        }
        
        // Save the state for undo
        this.saveGameState();
        
        // Remove the die used
        const dieIndex = this.availableMoves.indexOf(parseInt(dieValue));
        if (dieIndex !== -1) {
            this.availableMoves.splice(dieIndex, 1);
        }
        
        // Handle bearing off
        if (targetPoint === 'home-white' || targetPoint === 'home-black') {
            if (fromPoint !== -1) {
                // Remove the checker from the source
                this.board.points[fromPoint].checkers.pop();
                if (this.board.points[fromPoint].checkers.length === 0) {
                    this.board.points[fromPoint].color = null;
                }
                
                // Add to home
                this.board.home[player]++;
                
                // Check for win
                if (this.board.home[player] === 15) {
                    this.gameOver = true;
                    alert(`${player.charAt(0).toUpperCase() + player.slice(1)} wins!`);
                }
            }
        } 
        // Handle regular move
        else {
            // Convert targetPoint to a number if it's not already
            targetPoint = parseInt(targetPoint);
            
            // Check if there's a blot to hit
            const targetPointData = this.board.points[targetPoint];
            if (targetPointData.color && targetPointData.color !== player && targetPointData.checkers.length === 1) {
                // Remove opponent checker and put it on the bar
                targetPointData.checkers.pop();
                this.board.bar[targetPointData.color === 'white' ? 'white' : 'black']++;
            }
            
            // Move checker to target
            if (fromPoint === -1) {
                // Moving from bar
                this.board.bar[player]--;
            } else {
                // Moving from a point
                this.board.points[fromPoint].checkers.pop();
                if (this.board.points[fromPoint].checkers.length === 0) {
                    this.board.points[fromPoint].color = null;
                }
            }
            
            // Add to target
            targetPointData.checkers.push(player);
            targetPointData.color = player;
        }
        
        // Clear selection and update board
        this.clearSelection();
        this.setupBoard();
        
        // If no more moves, switch player
        if (this.availableMoves.length === 0) {
            if (!this.gameOver) {
                this.switchPlayer();
            }
        } else {
            // Check if there are still valid moves
            if (!this.hasValidMoves()) {
                alert(`No more valid moves for ${player}. Turn passes to the other player.`);
                this.switchPlayer();
                this.availableMoves = [];
            } else {
                this.highlightSelectableCheckers();
            }
        }
        
        this.updateUI();
    }
    
    // Save the current game state for undo
    saveGameState() {
        const state = {
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            dice: [...this.dice],
            availableMoves: [...this.availableMoves]
        };
        this.moveHistory.push(state);
    }
    
    // Undo the last move
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastState = this.moveHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.dice = lastState.dice;
        this.availableMoves = lastState.availableMoves;
        
        // Clear selection and update board
        this.clearSelection();
        this.setupBoard();
        
        // Highlight selectable checkers
        if (this.availableMoves.length > 0) {
            this.highlightSelectableCheckers();
        }
        
        this.updateUI();
    }
    
    // Switch the current player
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.dice = [0, 0];
        this.availableMoves = [];
    }
    
    // Clear selection and highlights
    clearSelection() {
        // Clear selected checker
        if (this.selectedChecker) {
            this.selectedChecker.classList.remove('selected');
            this.selectedChecker = null;
        }
        
        // Clear all selectable checkers
        document.querySelectorAll('.checker.selectable').forEach(checker => {
            checker.classList.remove('selectable');
            checker.removeEventListener('click', () => this.selectChecker(checker));
        });
        
        // Clear valid move indicators
        this.clearValidMoveIndicators();
    }
    
    // Update the UI
    updateUI() {
        // Update player indicator
        document.getElementById('player-name').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        // Update dice display
        document.getElementById('dice-1').textContent = this.dice[0] || '-';
        document.getElementById('dice-2').textContent = this.dice[1] || '-';
        
        // Enable/disable buttons
        document.getElementById('roll-dice').disabled = 
            this.availableMoves.length > 0 || this.gameOver;
            
        document.getElementById('undo-move').disabled = 
            this.moveHistory.length === 0;
    }
    
    // Reset the game
    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.dice = [0, 0];
        this.availableMoves = [];
        this.selectedChecker = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameOver = false;
        
        this.setupBoard();
        this.updateUI();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new BackgammonGame();
});