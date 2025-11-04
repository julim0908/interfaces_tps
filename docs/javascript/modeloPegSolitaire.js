class PegSolitaireModel {
    constructor() {
        this.boardSize = 7;
        this.cellSize = 70;
        this.pieceRadius = 25;
        this.board = [];
        this.selectedPiece = null;
        this.validMoves = [];
        
        // Dimensiones del Canvas
        this.canvasSizeX = 600;
        this.canvasSizeY = 600;
        
        // ancho de la barra lateral
        this.sidebarWidth = 120;
        
        // Cálculo de Centrado para el Tablero
        this.boardPixelSize = this.boardSize * this.cellSize;
        
        this.boardOffsetX = this.sidebarWidth;
        
        this.boardOffsetY = (this.canvasSizeY - this.boardPixelSize) / 2;

        this.timeLimit = 180;
        this.timeRemaining = this.timeLimit;
        
        this.gameOver = false;
        this.timer = null;
        this.piecesRemaining = 0;
        
        this.pieceTypes = ['pelota', 'cup', 'afa'];
        
        this.inicializarTablero();
    }

    inicializarTablero() {
        // Crear tablero
        this.board = [];
        const pattern = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
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

    //funcion que se llama cuando se hace click en una ficha
    //determina si el movimiento es valido o invalido
    seleccionarPieza(row, col) {
        if (this.gameOver) return false;
        
        const cell = this.board[row][col];
        if (!cell || cell.invalid || !cell.hasPiece) return false;

        this.selectedPiece = { row, col };
        // si es valido llama a obtener movimientos
        this.validMoves = this.obtenerMovimientosValidosParaPieza(row, col);
        
        return this.validMoves.length > 0;
    }

    //calcula todos los mov. posibles para una ficha
    obtenerMovimientosValidosParaPieza(row, col) {
        const moves = [];
        const directions = [
            { dr: -2, dc: 0, jumpR: -1, jumpC: 0 }, // Arriba
            { dr: 2, dc: 0, jumpR: 1, jumpC: 0 },   // Abajo
            { dr: 0, dc: -2, jumpR: 0, jumpC: -1 }, // Izquierda
            { dr: 0, dc: 2, jumpR: 0, jumpC: 1 }    // Derecha
        ];

        for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            const jumpRow = row + dir.jumpR;
            const jumpCol = col + dir.jumpC;

            if (this.esMovimientoValido(row, col, newRow, newCol, jumpRow, jumpCol)) {
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
    //confirma si cada salto de ficha es legal
    esMovimientoValido(fromRow, fromCol, toRow, toCol, jumpRow, jumpCol) {
        if (toRow < 0 || toRow >= this.boardSize || toCol < 0 || toCol >= this.boardSize) return false;
        if (!this.board[fromRow][fromCol].hasPiece) return false;
        
        const targetCell = this.board[toRow][toCol];
        if (!targetCell || targetCell.invalid || targetCell.hasPiece) return false;

        const jumpCell = this.board[jumpRow][jumpCol];
        if (!jumpCell || jumpCell.invalid || !jumpCell.hasPiece) return false;

        return true;
    }
    // se llama cuando se suelta la ficha en una casilla
    // si la pieza está en validMoves, se mueve
    moverPieza(toRow, toCol) {
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

        this.verificarFinDeJuego();

        return true;
    }
    //verifica si el juego termina verificando si ya no hay mas tiempo
    //o si hubo una victoria, o si no hay mas movimientos posibles
    verificarFinDeJuego() {
        const hasValidMoves = this.tieneMovimientosValidos();
        
        if (!hasValidMoves || this.piecesRemaining === 1 || this.timeRemaining <= 0) {
            this.gameOver = true;
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    }

    // verifica si una ficha tiene un movimiento valido y devuelve true
    //si ninguna ficha se puede mover, devuelve false
    tieneMovimientosValidos() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col].hasPiece) {
                    const moves = this.obtenerMovimientosValidosParaPieza(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //inicia el temporizador de juego
    iniciarTemporizador(callback) {
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

    // detiene el temporizador
    detenerTemporizador() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // reinicia el juego deteniendo el temporizador y reiniciar el tablero
    reiniciar() {
        this.detenerTemporizador();
        this.inicializarTablero();
    }

    // devuelve si hay victoria, si se termino el tiempo o si no hay movimientos
    // para saber qué pantalla mostrar
    obtenerEstadoDelJuego() {
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


    // Devuelve el centro de la celda, aplicando el desplazamiento
    // (x) Columna * tamaño de celda + OffsetX + mitad del tamaño de celda
    // (y) Fila * tamaño de celda + OffsetY + mitad del tamaño de celda
    obtenerPosicionDeCelda(row, col) {
        return {
            x: col * this.cellSize + this.boardOffsetX + this.cellSize / 2,
            y: row * this.cellSize + this.boardOffsetY + this.cellSize / 2
        };
    }

    //convierte coordenadas de pixeles en un clic
    //lo inverso al anterior
    obtenerCeldaDelTablero(x, y) {
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
    //calcula el tiempo total que se tardó en jugar
    obtenerTiempoUsado() {
        return this.timeLimit - this.timeRemaining;
    }
}