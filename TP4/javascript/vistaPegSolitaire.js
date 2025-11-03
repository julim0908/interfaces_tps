class PegSolitaireView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 70; // Debe coincidir con el Modelo
        this.pieceRadius = 25; // Debe coincidir con el Modelo
        this.activeHints = [];

        this.canvas.width = 620; // MODIFICADO: Aumentado el ancho para centrar el tablero (500px área de juego + 120px sidebar)
        this.canvas.height = 600;
        
        // Carga de imágenes (asume que los IDs img-pelota, etc., existen en el HTML)
        this.pieceImages = {};
        this.pieceImages.pelota = document.getElementById('img-pelota');
        this.pieceImages.star = document.getElementById('img-piece-star');
        this.pieceImages.rocket = document.getElementById('img-piece-rocket');
        
        this.draggedPiece = null;
        this.stars = [];

        this.backgroundImage = new Image();
        this.backgroundImage.src = './img/background-peg.jpg';
    }

    drawBoard(model) {
        const sidebarWidth = model.sidebarWidth; // 120px
        const gameAreaWidth = this.canvas.width - sidebarWidth; // 500px

        // 1. Limpia el canvas completo
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);       
        
        // 2. Dibuja el fondo del juego solo en el área de juego (a partir de X=120)
        // Esto asegura que el fondo esté centrado con el tablero y no se dibuje bajo la barra lateral.
        this.ctx.drawImage(this.backgroundImage, 
                            sidebarWidth, 0, // Posición de inicio en el canvas
                            gameAreaWidth, this.canvas.height); // Dimensiones de la porción a dibujar
        
        // 3. Dibuja la barra lateral SÓLIDA con controles
        this.drawSidebarUI(model);
        
        // 4. Dibuja el tablero.
        for (let row = 0; row < model.boardSize; row++) {
            for (let col = 0; col < model.boardSize; col++) {
                const cell = model.board[row][col];
                
                // Obtiene la posición del centro (ya incluye el offset del modelo)
                const centerPos = model.getCellPosition(row, col);
                // Calcula la esquina superior izquierda a partir del centro
                const x = centerPos.x - (this.cellSize / 2); 
                const y = centerPos.y - (this.cellSize / 2); 

                if (!cell.invalid) {
                    this.drawCell(x, y, cell, model.selectedPiece, row, col);
                }
            }
        }
        
        // 5. Dibuja la pieza arrastrada encima de todo
        if (this.draggedPiece) {
            this.drawPiece(
                this.draggedPiece.x,
                this.draggedPiece.y,
                this.draggedPiece.type,
                true // isDragging = true
            );
        }
    }

    drawSidebarUI(model) {
        const sidebarWidth = model.sidebarWidth; // 120px
        const centerX = sidebarWidth / 2;
        const margin = 10; 

        // --- Fondo de la barra lateral (sólido) ---
        // Usando el color primario más oscuro para el fondo
        this.ctx.fillStyle = '#1a002b'; 
        this.ctx.fillRect(0, 0, sidebarWidth, this.canvas.height);
        
        // --- Borde sutil a la derecha de la barra lateral ---
        this.ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)'; // Color primario más claro
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(sidebarWidth, 0);
        this.ctx.lineTo(sidebarWidth, this.canvas.height);
        this.ctx.stroke();

        // --- Info de Piezas Restantes ---
        this.ctx.font = '12px "Roboto", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText("PIEZAS:", centerX, 40); 
        this.ctx.font = 'bold 24px "Montserrat", sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(model.piecesRemaining, centerX, 70); 
        
        // --- Separador ---
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, 100);
        this.ctx.lineTo(sidebarWidth - margin, 100);
        this.ctx.stroke();


        // --- Temporizador Actual ---
        const minutes = Math.floor(model.timeRemaining / 60);
        const secs = model.timeRemaining % 60;
        const timeStr = `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
        
        this.ctx.font = '12px "Roboto", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText("TIEMPO:", centerX, 130);
        this.ctx.font = 'bold 30px "Montserrat", sans-serif';
        // Warning color si queda poco tiempo
        this.ctx.fillStyle = model.timeRemaining <= 30 ? 'red' : '#FF6B35'; 
        this.ctx.fillText(timeStr, centerX, 165);

        // --- Info de Tiempo Límite ---
        const limitMinutes = Math.floor(model.timeLimit / 60);
        const limitSecs = model.timeLimit % 60;
        const limitTimeStr = `${limitMinutes}:${String(limitSecs).padStart(2, '0')}`;

        this.ctx.font = '10px "Roboto", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillText("LÍMITE:", centerX, 190);
        this.ctx.font = '16px "Montserrat", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText(limitTimeStr, centerX, 215);


        // --- Separador (Ajustado a la nueva altura) ---
        this.ctx.beginPath();
        this.ctx.moveTo(margin, 240); // Nuevo Y
        this.ctx.lineTo(sidebarWidth - margin, 240); // Nuevo Y
        this.ctx.stroke();


        // --- Botones de Control (Posiciones Y se mantienen por ahora) ---
        
        // Botón 1: Reiniciar (Centro Y: 400)
        this.drawButton(centerX, 400, 100, 45, '#32CD32', 'REINICIAR', '#FFFFFF', 16);

        // Botón 2: Inicio (Centro Y: 470)
        this.drawButton(centerX, 470, 100, 45, '#FFFFFF', 'INICIO', '#1A002B', 16);
    }

    /**
     * Dibuja un botón en el canvas.
     */
    drawButton(centerX, centerY, width, height, bgColor, text, textColor, fontSize) {
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        const radius = 8; 

        // Dibuja el fondo del botón
        this.ctx.fillStyle = bgColor;
        this.ctx.beginPath();
        // roundRect necesita ser soportado, asumiendo ambiente moderno
        if (typeof this.ctx.roundRect === 'function') {
            this.ctx.roundRect(x, y, width, height, radius);
        } else {
            this.ctx.rect(x, y, width, height); // Fallback a rect normal
        }
        this.ctx.fill();

        // Dibuja el texto
        this.ctx.font = `bold ${fontSize}px "Montserrat", sans-serif`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, centerX, centerY);
    }
    
    /**
     * Dibuja la celda y el hueco. Incluye la lógica del borde de hint.
     */
    drawCell(x, y, cell, selectedPiece, row, col) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;

        // Determina si la celda es un destino de movimiento válido para el hint
        const isHintTarget = this.activeHints.some(
            h => h.toRow === row && h.toCol === col
        );
        
        // Fondo del hueco: más oscuro para que resalten las piezas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pieceRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde del hueco por defecto: discreto
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // DIBUJA EL HINT (Borde Dorado)
        if (!cell.hasPiece && isHintTarget) {
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 1.0)'; // Dorado puro
            this.ctx.lineWidth = 5; // Borde grueso
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.pieceRadius + 2, 0, Math.PI * 2);
            this.ctx.stroke();

            // Sombra para el hint
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
            this.ctx.shadowBlur = 10;
        } else {
            this.ctx.shadowBlur = 0;
        }
        
        // Dibuja la pieza si existe y no es la que se está arrastrando
        if (cell.hasPiece && !(this.draggedPiece && this.draggedPiece.fromRow === row && this.draggedPiece.fromCol === col)) {
            this.drawPiece(centerX, centerY, cell.type, false);
        }
        
        this.ctx.shadowBlur = 0;
    }

    drawPiece(x, y, type, isDragging) {
        this.ctx.save();
        
        if (isDragging) {
            // Sombra para la pieza arrastrada
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.shadowBlur = 20;
        }
        
        const image = this.pieceImages[type];
        if (image && image.complete) {
            const size = this.pieceRadius * 2;
            this.ctx.drawImage(image, x - this.pieceRadius, y - this.pieceRadius, size, size);
        } else if (!image) {
            console.error(`Imagen para el tipo "${type}" no encontrada. Verifica los IDs en el HTML.`);
        }
        
        this.ctx.restore();
    }

    /**
     * Almacena las coordenadas de los movimientos válidos para que drawCell los pinte.
     */
    showHints(model) {
        if (!model.selectedPiece || model.validMoves.length === 0) {
            this.activeHints = [];
            return;
        }
        
        this.activeHints = model.validMoves.map(move => ({
            toRow: move.toRow, 
            toCol: move.toCol
        }));
    }

    /**
     * Limpia la lista de hints activos.
     */
    hideHints() {
        this.activeHints = [];
    }
    
    // Los métodos updateTimer y updatePiecesCount han sido eliminados ya que la barra lateral los dibuja.
    
    showScreen(screenId) {
        const screens = ['gamePreview', 'gameScreen', 'victoryScreen', 'timeUpScreen', 'noMovesScreen', 'helpModal'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    }

    showVictoryScreen(piecesRemaining, timeUsed) {
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        
        document.getElementById('victoryPieces').textContent = piecesRemaining;
        document.getElementById('victoryTime').textContent = 
            `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        this.showScreen('victoryScreen');
    }

    showTimeUpScreen(piecesRemaining) {
        document.getElementById('timeUpPieces').textContent = piecesRemaining;
        this.showScreen('timeUpScreen');
    }

    showNoMovesScreen(piecesRemaining, timeUsed) {
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        
        document.getElementById('noMovesPieces').textContent = piecesRemaining;
        document.getElementById('noMovesTime').textContent = 
            `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        this.showScreen('noMovesScreen');
    }

    setDraggedPiece(x, y, type, fromRow, fromCol) {
        this.draggedPiece = { x, y, type, fromRow, fromCol };
    }

    clearDraggedPiece() {
        this.draggedPiece = null;
    }
}