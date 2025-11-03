class PegSolitaireController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.isDragging = false;
        this.dragStartPos = null;
        
        // Coordenadas de los botones virtuales en la barra lateral
        // Se usan las propiedades del modelo para consistencia
        this.buttonHitboxes = {
            // El ancho de la barra lateral es `model.sidebarWidth`
            // Los botones tienen un ancho de 100px y están centrados en la barra (x: 10 a 110)
            restart: { x: (this.model.sidebarWidth / 2) - 50, y: 375, w: 100, h: 50 }, // Centro Y: 400 (375 a 425)
            home:    { x: (this.model.sidebarWidth / 2) - 50, y: 445, w: 100, h: 50 }  // Centro Y: 470 (445 a 495)
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Listener del botón de inicio de juego (HTML)
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
        
        // Botones de pantallas de fin de juego (Siguen siendo elementos HTML fuera del canvas)
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
            // La vista se actualiza llamando a drawBoard
            this.view.drawBoard(this.model); 
            
            this.model.startTimer((timeRemaining) => {
                // Forzar el redibujado para actualizar el timer en el canvas
                this.view.drawBoard(this.model); 
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
        
        this.model.startTimer((timeRemaining) => {
            this.view.drawBoard(this.model);
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

        // 1. Verificar clic en botones virtuales (barra lateral)
        if (this.checkSidebarClick(x, y)) {
            return; 
        }

        // 2. Si no es un botón, proceder con la lógica del tablero
        const cell = this.model.getBoardCell(x, y);
        if (!cell) return;
        
        const { row, col } = cell;
        
        if (this.model.selectPiece(row, col)) {
            this.isDragging = true;
            this.dragStartPos = { row, col };
            
            const cellData = this.model.board[row][col];
            this.view.setDraggedPiece(x, y, cellData.type, row, col);
            this.view.showHints(this.model);
            this.updateView(); 
        }
    }

    /**
     * Verifica si un clic dado cae dentro de la hitbox de un botón virtual.
     * @param {number} x Coordenada X del clic.
     * @param {number} y Coordenada Y del clic.
     * @returns {boolean} True si se manejó un clic de botón.
     */
    checkSidebarClick(x, y) {
        const { restart, home } = this.buttonHitboxes;

        // Verificar si el clic está dentro del área general de los botones (X: restart.x a restart.x + w)
        if (x < restart.x || x > restart.x + restart.w) {
            return false;
        }

        // Verifica clic en el botón RESTART
        if (y >= restart.y && y <= restart.y + restart.h) {
            this.restartGame();
            return true;
        }

        // Verifica clic en el botón HOME
        if (y >= home.y && y <= home.y + home.h) {
            this.goToMenu();
            return true;
        }

        return false;
    }

    handleMouseMove(e) {
        if (!this.isDragging || this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.view.draggedPiece) {
            this.view.draggedPiece.x = x;
            this.view.draggedPiece.y = y;
            this.updateView();
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
                this.cancelDrag();
            }
        } else {
            this.cancelDrag();
        }

        this.isDragging = false;
        this.dragStartPos = null;
        this.view.clearDraggedPiece();
        this.view.hideHints();
        this.updateView();

        if (this.model.gameOver) {
            this.endGame();
        }
    }

    handleMouseLeave(e) {
        if (this.isDragging) {
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
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.view.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.view.canvas.dispatchEvent(mouseEvent);
    }

    cancelDrag() {
        this.model.selectedPiece = null;
        this.model.validMoves = [];
        this.view.hideHints();
    }

    updateView() {
        this.view.drawBoard(this.model);
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
        }, 500);
    }
}