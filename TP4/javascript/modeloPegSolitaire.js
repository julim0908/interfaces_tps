// MODEL - Lógica del juego Peg Solitaire

class PegSolitaireModel {
    constructor() {
        this.boardSize = 7;
        this.cellSize = 80;
        this.board = [];
        this.selectedPiece = null;
        this.validMoves = [];
        
        // --- MODIFICACIÓN 3: Dificultad única ---
        // Se eliminó el objeto 'timeLimits' y la variable 'difficulty'
        this.timeLimit = 180;     // 3 minutos (180 segundos)
        this.timeRemaining = this.timeLimit;
        // --- FIN MODIFICACIÓN 3 ---

        this.gameOver = false;
        this.timer = null;
        this.piecesRemaining = 0;
        
        // Tipos de fichas (temática espacial)
        this.pieceTypes = ['pelota', 'star', 'rocket'];
        
        this.initializeBoard();
    }

    // --- MODIFICACIÓN 3: Dificultad única ---
    // Se eliminó el método setDifficulty(difficulty) ya que no es necesario
    // --- FIN MODIFICACIÓN 3 ---

    initializeBoard() {
        // Crear tablero en forma de cruz (estilo clásico Peg Solitaire)
        this.board = [];
        const pattern = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1], // Centro vacío (0)
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]
        ];

        this.piecesRemaining = 0;
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                if (pattern[row][col] === 1) {
                    // Asignar tipo de ficha de forma variada
                    const typeIndex = (row + col) % 3;
                    this.board[row][col] = {
                        hasPiece: true,
                        type: this.pieceTypes[typeIndex]
                    };
                    this.piecesRemaining++;
                } else if (pattern[row][col] === 0 && (row < 2 || row > 4 || col < 2 || col > 4)) {
                    // Posiciones fuera del tablero
                    this.board[row][col] = { hasPiece: false, type: null, invalid: true };
                } else {
                    // Posiciones válidas vacías
                    this.board[row][col] = { hasPiece: false, type: null };
                }
            }
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.timeRemaining = this.timeLimit; // Asegura que el tiempo se reinicie
    }

    selectPiece(row, col) {
        if (this.gameOver) return false;
        
        const cell = this.board[row][col];
        if (!cell || cell.invalid || !cell.hasPiece) return false;

        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMovesForPiece(row, col);
        
        return this.validMoves.length > 0;
    }

    getValidMovesForPiece(row, col) {
        const moves = [];
        const directions = [
            { dr: -2, dc: 0, jumpR: -1, jumpC: 0 }, // Arriba
            { dr: 2, dc: 0, jumpR: 1, jumpC: 0 },   // Abajo
            { dr: 0, dc: -2, jumpR: 0, jumpC: -1 }, // Izquierda
            { dr: 0, dc: 2, jumpR: 0, jumpC: 1 }    // Derecha
        ];

        for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            const jumpRow = row + dir.jumpR;
            const jumpCol = col + dir.jumpC;

            if (this.isValidMove(row, col, newRow, newCol, jumpRow, jumpCol)) {
                moves.push({
                    toRow: newRow,
                    toCol: newCol,
                    jumpRow: jumpRow,
                    jumpCol: jumpCol,
                    direction: dir
                });
            }
        }

        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol, jumpRow, jumpCol) {
        // Verificar que las posiciones estén dentro del tablero
        if (toRow < 0 || toRow >= this.boardSize || toCol < 0 || toCol >= this.boardSize) {
            return false;
        }

        // Verificar que la posición de origen tenga una ficha
        if (!this.board[fromRow][fromCol].hasPiece) {
            return false;
        }

        // Verificar que la posición de destino esté vacía y sea válida
        const targetCell = this.board[toRow][toCol];
        if (!targetCell || targetCell.invalid || targetCell.hasPiece) {
            return false;
        }

        // Verificar que haya una ficha para saltar
        const jumpCell = this.board[jumpRow][jumpCol];
        if (!jumpCell || jumpCell.invalid || !jumpCell.hasPiece) {
            return false;
        }

        return true;
    }

    movePiece(toRow, toCol) {
        if (!this.selectedPiece || this.gameOver) return false;

        const move = this.validMoves.find(m => m.toRow === toRow && m.toCol === toCol);
        if (!move) return false;

        const { row: fromRow, col: fromCol } = this.selectedPiece;
        const { jumpRow, jumpCol } = move;

        // Mover la ficha
        this.board[toRow][toCol] = {
            hasPiece: true,
            type: this.board[fromRow][fromCol].type
        };
        this.board[fromRow][fromCol] = { hasPiece: false, type: null };
        
        // Eliminar la ficha saltada
        this.board[jumpRow][jumpCol] = { hasPiece: false, type: null };
        this.piecesRemaining--;

        this.selectedPiece = null;
        this.validMoves = [];

        // Verificar si el juego ha terminado
        this.checkGameOver();

        return true;
    }

    checkGameOver() {
        // Verificar si hay movimientos posibles
        const hasValidMoves = this.hasAnyValidMoves();
        
        if (!hasValidMoves || this.piecesRemaining === 1 || this.timeRemaining <= 0) {
            this.gameOver = true;
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    }

    hasAnyValidMoves() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col].hasPiece) {
                    const moves = this.getValidMovesForPiece(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    startTimer(callback) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (this.timeRemaining > 0 && !this.gameOver) {
                this.timeRemaining--;
                callback(this.timeRemaining);
                
                if (this.timeRemaining === 0) {
                    this.gameOver = true;
                    clearInterval(this.timer);
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    reset() {
        this.stopTimer();
        this.initializeBoard();
    }

    getGameStatus() {
        if (this.gameOver) {
            if (this.piecesRemaining === 1) {
                return 'victory';
            } else if (this.timeRemaining === 0) {
                return 'timeout';
    _         } else {
                return 'noMoves';
            }
        }
        return 'playing';
    }

    getCellPosition(row, col) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    getBoardCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            return { row, col };
        }
        return null;
    }

    getTimeUsed() {
        return this.timeLimit - this.timeRemaining;
    }
}