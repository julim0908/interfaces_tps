class PegSolitaireModel {
    constructor() {
        this.boardSize = 7;
        this.cellSize = 70; // Reducido a 70px (7 * 70 = 490px)
        this.pieceRadius = 25; // Reducido el radio
        this.board = [];
        this.selectedPiece = null;
        this.validMoves = [];
        
        // --- Dimensiones del Canvas ---
        this.canvasSizeX = 600;
        this.canvasSizeY = 600;
        
        // --- Nuevo ancho de la barra lateral ---
        this.sidebarWidth = 120; // Aumentado a 120px para los elementos
        
        // --- Cálculo de Centrado para el Tablero ---
        this.boardPixelSize = this.boardSize * this.cellSize; // 7 * 70 = 490px
        
        // Área de juego disponible para el tablero: canvasSizeX - sidebarWidth = 600 - 120 = 480px
        // El tablero es 490px, así que no se centrará perfectamente, pero estará alineado a la derecha.
        // Si quieres que el tablero se centre en los 480px, necesitaríamos reducir el cellSize o boardSize.
        // Por ahora, asumimos que el tablero de 490px se extenderá un poco más allá de los 480px si es necesario,
        // o que se ajustará si el canvas es más grande.
        // **ACTUALIZACIÓN:** Para que quepa y se centre, la lógica es:
        // Espacio disponible para el tablero = this.canvasSizeX - this.sidebarWidth = 480px
        // Si this.boardPixelSize (490px) es mayor, el tablero no puede centrarse en ese espacio.
        // Se sugiere ajustar `cellSize` a 60 para un tablero de 420x420, que sí cabría y se centraría.
        // O dejarlo así y aceptar que el tablero se dibuje desde el borde del área de juego.
        
        // Vamos a mantener cellSize=70 y aceptamos que el tablero va de sidebarWidth a sidebarWidth + boardPixelSize
        // y se centrará en Y.
        
        // Offset X: Inicio del área de juego principal es 'sidebarWidth'. El tablero empieza allí.
        this.boardOffsetX = this.sidebarWidth;
        // Offset Y: (Canvas Alto - Tamaño del Tablero) / 2 = (600 - 490) / 2 = 55px
        this.boardOffsetY = (this.canvasSizeY - this.boardPixelSize) / 2; // 55px
        // ----------------------------------------------------------------------

        this.timeLimit = 180;     // 3 minutos (180 segundos)
        this.timeRemaining = this.timeLimit;
        
        this.gameOver = false;
        this.timer = null;
        this.piecesRemaining = 0;
        
        this.pieceTypes = ['pelota', 'star', 'rocket'];
        
        this.initializeBoard();
    }

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
                    const typeIndex = (row + col) % 3;
                    this.board[row][col] = {
                        hasPiece: true,
                        type: this.pieceTypes[typeIndex]
                    };
                    this.piecesRemaining++;
                } else if (pattern[row][col] === 0 && (row < 2 || row > 4 || col < 2 || col > 4)) {
                    this.board[row][col] = { hasPiece: false, type: null, invalid: true };
                } else {
                    this.board[row][col] = { hasPiece: false, type: null };
                }
            }
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.timeRemaining = this.timeLimit;
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
        if (toRow < 0 || toRow >= this.boardSize || toCol < 0 || toCol >= this.boardSize) return false;
        if (!this.board[fromRow][fromCol].hasPiece) return false;
        
        const targetCell = this.board[toRow][toCol];
        if (!targetCell || targetCell.invalid || targetCell.hasPiece) return false;

        const jumpCell = this.board[jumpRow][jumpCol];
        if (!jumpCell || jumpCell.invalid || !jumpCell.hasPiece) return false;

        return true;
    }

    movePiece(toRow, toCol) {
        if (!this.selectedPiece || this.gameOver) return false;

        const move = this.validMoves.find(m => m.toRow === toRow && m.toCol === toCol);
        if (!move) return false;

        const { row: fromRow, col: fromCol } = this.selectedPiece;
        const { jumpRow, jumpCol } = move;

        this.board[toRow][toCol] = {
            hasPiece: true,
            type: this.board[fromRow][fromCol].type
        };
        this.board[fromRow][fromCol] = { hasPiece: false, type: null };
        
        this.board[jumpRow][jumpCol] = { hasPiece: false, type: null };
        this.piecesRemaining--;

        this.selectedPiece = null;
        this.validMoves = [];

        this.checkGameOver();

        return true;
    }

    checkGameOver() {
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
            } else {
                return 'noMoves';
            }
        }
        return 'playing';
    }

    /**
     * Devuelve las coordenadas del centro de la celda, aplicando el desplazamiento de centrado.
     * @param {number} row 
     * @param {number} col 
     * @returns {{x: number, y: number}}
     */
    getCellPosition(row, col) {
        // Devuelve el centro de la celda, aplicando el desplazamiento
        // (x) Columna * tamaño de celda + OffsetX + mitad del tamaño de celda
        // (y) Fila * tamaño de celda + OffsetY + mitad del tamaño de celda
        return {
            x: col * this.cellSize + this.boardOffsetX + this.cellSize / 2,
            y: row * this.cellSize + this.boardOffsetY + this.cellSize / 2
        };
    }

    /**
     * Convierte coordenadas de la pantalla (mouse/touch) a filas/columnas.
     * Resta el desplazamiento de centrado antes de calcular.
     * @param {number} x 
     * @param {number} y 
     * @returns {{row: number, col: number} | null}
     */
    getBoardCell(x, y) {
        // Ignorar clics si están en el área de la barra lateral
        if (x < this.sidebarWidth) return null; 
        
        // Restar el offset de centrado a las coordenadas de clic
        const adjustedX = x - this.boardOffsetX;
        const adjustedY = y - this.boardOffsetY;

        const col = Math.floor(adjustedX / this.cellSize);
        const row = Math.floor(adjustedY / this.cellSize);
        
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            return { row, col };
        }
        return null;
    }

    getTimeUsed() {
        return this.timeLimit - this.timeRemaining;
    }
}