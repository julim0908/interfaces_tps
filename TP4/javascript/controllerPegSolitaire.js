// CONTROLLER - Manejo de eventos Peg Solitaire

class PegSolitaireController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.isDragging = false;
        this.dragStartPos = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('playButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Eventos del canvas de juego
        const canvas = this.view.canvas;
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Botones de control durante el juego
        document.getElementById('btnRestart').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('btnHome').addEventListener('click', () => {
            this.goToMenu();
        });
        
        // Botones de pantallas de fin de juego
        this.setupEndGameButtons('Victory');
        this.setupEndGameButtons('TimeUp');
        this.setupEndGameButtons('NoMoves');
    }

    setupEndGameButtons(suffix) {
        const btnMenu = document.getElementById(`btnMenu${suffix}`);
        const btnRetry = document.getElementById(`btnRetry${suffix}`);
        const btnPlayAgain = document.getElementById(`btnPlayAgain${suffix}`);
        
        if (btnMenu) {
            btnMenu.addEventListener('click', () => this.goToMenu());
        }
        
        const retryOrPlayAgain = btnRetry || btnPlayAgain;
        if (retryOrPlayAgain) {
            retryOrPlayAgain.addEventListener('click', () => this.restartGame());
        }
    }

    startGame() {
        this.model.reset();
        setTimeout(() => {
            this.view.showScreen('gameScreen');
            this.view.updateTimer(this.model.timeRemaining);
            this.model.startTimer((timeRemaining) => {
                this.view.updateTimer(timeRemaining);
                if (timeRemaining === 0) {
                    this.endGame();
                }
            });
            
            this.updateView();
            
        }, 600);
    }

    restartGame() {
        this.model.reset();
        this.view.hideHints();
        this.view.showScreen('gameScreen');
        
        // Actualiza el timer a "3:00" inmediatamente al reiniciar
        this.view.updateTimer(this.model.timeRemaining);
        
        this.model.startTimer((timeRemaining) => {
            this.view.updateTimer(timeRemaining);
            if (timeRemaining === 0) {
                this.endGame();
            }
        });
        
        this.updateView();
    }

    goToMenu() {
        this.model.stopTimer();
        this.model.reset();
        this.view.hideHints();
        this.view.showScreen('gamePreview');
    }

    handleMouseDown(e) {
        if (this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cell = this.model.getBoardCell(x, y);
        if (!cell) return;
        
        const { row, col } = cell;
        
        if (this.model.selectPiece(row, col)) {
            this.isDragging = true;
            this.dragStartPos = { row, col };
            
            const cellData = this.model.board[row][col];
            this.view.setDraggedPiece(x, y, cellData.type, row, col);
            this.view.showHints(this.model);
            this.updateView(); // Dibuja el tablero sin la pieza seleccionada
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.view.draggedPiece) {
            this.view.draggedPiece.x = x;
            this.view.draggedPiece.y = y;
            this.updateView(); // Redibuja el tablero y la pieza en la nueva pos
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging || this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cell = this.model.getBoardCell(x, y);
        
        if (cell) {
            const { row, col } = cell;
            if (!this.model.movePiece(row, col)) {
                // Movimiento inválido, cancelar drag
                this.cancelDrag();
            }
        } else {
            // Soltó fuera del tablero, cancelar drag
            this.cancelDrag();
        }

        // Limpiar estado de drag
        this.isDragging = false;
        this.dragStartPos = null;
        this.view.clearDraggedPiece();
        this.view.hideHints();
        this.updateView();

        // Verificar fin de juego después de soltar
        if (this.model.gameOver) {
            this.endGame();
        }
    }

    handleMouseLeave(e) {
        if (this.isDragging) {
            // Si el mouse sale del canvas, cancela el drag
            this.cancelDrag();
            this.isDragging = false;
            this.dragStartPos = null;
            this.view.clearDraggedPiece();
            this.updateView();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.view.canvas.dispatchEvent(mouseEvent);
section: 1
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.view.canvas.dispatchEvent(mouseEvent);
section: 1
    }

    handleTouchEnd(e) {
        e.preventDefault();
        // No usamos changedTouches[0] porque puede no tener clientX/Y
        // Usamos un truco: disparamos un mouseup genérico
        const mouseEvent = new MouseEvent('mouseup', {});
        this.view.canvas.dispatchEvent(mouseEvent);
section: 1
    }

    cancelDrag() {
        // Resetea la selección en el modelo
        this.model.selectedPiece = null;
        this.model.validMoves = [];
        this.view.hideHints();
    }

    updateView() {
        this.view.drawBoard(this.model);
        this.view.updatePiecesCount(this.model.piecesRemaining);
    }

    endGame() {
        this.model.gameOver = true;
        this.model.stopTimer();
        
        const status = this.model.getGameStatus();
        const timeUsed = this.model.getTimeUsed();
        
        this.view.hideHints();
        
        setTimeout(() => {
            if (status === 'victory') {
                this.view.showVictoryScreen(this.model.piecesRemaining, timeUsed);
            } else if (status === 'timeout') {
                this.view.showTimeUpScreen(this.model.piecesRemaining);
            } else {
                this.view.showNoMovesScreen(this.model.piecesRemaining, timeUsed);
            }
        }, 500); // Pequeño delay para ver el último movimiento
    }
}