// VIEW - Renderizado y actualización de la interfaz Peg Solitaire

class PegSolitaireView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 80;
        this.pieceRadius = 30; // Usamos esto para definir el tamaño de la imagen (60x60)
        this.hintsContainer = document.getElementById('hints');
        
        // Configurar tamaño del canvas
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        // --- MODIFICACIÓN 2: Cargar imágenes PNG ---
        // En lugar de dibujar, cargamos las <img> del HTML
        this.pieceImages = {};
        this.pieceImages.pelota = document.getElementById('img-pelota');
        this.pieceImages.star = document.getElementById('img-piece-star');
        this.pieceImages.rocket = document.getElementById('img-piece-rocket');
        // Se eliminó la llamada a this.generatePieceImages();
        // --- FIN MODIFICACIÓN 2 ---
        
        // Animaciones
        this.draggedPiece = null;
        this.stars = [];

        this.backgroundImage = new Image();
        this.backgroundImage.src = './img/background-peg.jpg';
    }

    drawBoard(model) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);       
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < model.boardSize; row++) {
            for (let col = 0; col < model.boardSize; col++) {
                const cell = model.board[row][col];
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                if (!cell.invalid) {
                    this.drawCell(x, y, cell, model.selectedPiece, row, col);
                }
            }
        }
        
        if (this.draggedPiece) {
            this.drawPiece(
                this.draggedPiece.x,
                this.draggedPiece.y,
                this.draggedPiece.type,
                true
            );
        }
    }

    drawCell(x, y, cell, selectedPiece, row, col) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        
        // Dibuja el 'hueco' vacío
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pieceRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(197, 187, 187, 0.64)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            // Resalta el 'hueco' de origen si la pieza está siendo arrastrada
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
        
        if (cell.hasPiece && !(this.draggedPiece && this.draggedPiece.fromRow === row && this.draggedPiece.fromCol === col)) {
            // Dibuja la ficha (imagen) si existe y no es la que se está arrastrando
            this.drawPiece(centerX, centerY, cell.type, false);
        }
    }

    drawPiece(x, y, type, isDragging) {
        this.ctx.save();
        
        if (isDragging) {
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

    showHints(model) {
        this.hintsContainer.innerHTML = '';
        
        if (!model.selectedPiece || model.validMoves.length === 0) {
            return;
        }
       
        
        model.validMoves.forEach(move => {
            const pos = model.getCellPosition(move.toRow, move.toCol);
            
            const hint = document.createElement('div');
            hint.className = 'hint-arrow';
            
            const dr = move.toRow - model.selectedPiece.row;
            const dc = move.toCol - model.selectedPiece.col;
            
            if (dr < 0) hint.textContent = '⬆️';
            else if (dr > 0) hint.textContent = '⬇️';
            else if (dc < 0) hint.textContent = '⬅️';
            else if (dc > 0) hint.textContent = '➡️';
            
            // Posiciona el hint sobre el canvas
            // Ajusta el 'left' y 'top' basado en el offset del canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            hint.style.left = (pos.x) + 'px';
            hint.style.top = (pos.y) + 'px';
            
            this.hintsContainer.appendChild(hint);
        });
    }

    hideHints() {
        this.hintsContainer.innerHTML = '';
    }

    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`; // Corregido a 1 pad para minutos
        
        if (seconds <= 30) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    }

    updatePiecesCount(count) {
        document.getElementById('piecesCount').textContent = count;
    }

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