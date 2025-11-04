class PegSolitaireView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 70;
        this.pieceRadius = 25;
        this.activeHints = [];

        this.canvas.width = 620;
        this.canvas.height = 600;
        
        // Carga de imágenes
        this.pieceImages = {};
        this.pieceImages.pelota = document.getElementById('img-pelota');
        this.pieceImages.cup = document.getElementById('img-piece-cup');
        this.pieceImages.afa = document.getElementById('img-piece-afa');
        
        this.draggedPiece = null;
        this.stars = [];

        this.backgroundImage = new Image();
        this.backgroundImage.src = './img/background-peg.jpg';
    }

    // se encarga de dibujar el tablero y se va llamando cada vez q el tiempo cambia,
    // se mueve una ficha, etc
    dibujarTablero(model) {
        const sidebarWidth = model.sidebarWidth;
        const gameAreaWidth = this.canvas.width - sidebarWidth;

        // Limpia el canvas completo
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);       
        
        // Dibuja el fondo del juego solo en el área de juego
        this.ctx.drawImage(this.backgroundImage, sidebarWidth, 0, gameAreaWidth, this.canvas.height);
        
        // Dibuja la barra lateral SÓLIDA con controles
        this.dibujarUIBarraLateral(model);
        
        // Dibuja el tablero.
        for (let row = 0; row < model.boardSize; row++) {
            for (let col = 0; col < model.boardSize; col++) {
                const cell = model.board[row][col];
                const centerPos = model.obtenerPosicionDeCelda(row, col);
                const x = centerPos.x - (this.cellSize / 2); 
                const y = centerPos.y - (this.cellSize / 2); 

                if (!cell.invalid) {
                    this.dibujarCelda(x, y, cell, model.selectedPiece, row, col);
                }
            }
        }
        
        // Dibuja la pieza arrastrada encima de todo
        if (this.draggedPiece) {
            this.dibujarPieza(
                this.draggedPiece.x,
                this.draggedPiece.y,
                this.draggedPiece.type,
                true
            );
        }
    }

    //interfaz de la izquierda con tiempo, btn reiniciar y btn de inicio
    dibujarUIBarraLateral(model) {
        const sidebarWidth = model.sidebarWidth;
        const centerX = sidebarWidth / 2;
        const margin = 10; 

        //Fondo de la barra lateral
        this.ctx.fillStyle = '#1a002b'; 
        this.ctx.fillRect(0, 0, sidebarWidth, this.canvas.height);
        
        // Borde a la derecha de la barra lateral
        this.ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(sidebarWidth, 0);
        this.ctx.lineTo(sidebarWidth, this.canvas.height);
        this.ctx.stroke();

        // Info de Piezas Restantes
        this.ctx.font = '18px "Roboto", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText("PIEZAS:", centerX, 40); 
        this.ctx.font = 'bold 24px "Montserrat", sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(model.piecesRemaining, centerX, 70); 
        
        // Separador
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, 100);
        this.ctx.lineTo(sidebarWidth - margin, 100);
        this.ctx.stroke();

        //  Temporizador Actual
        const minutes = Math.floor(model.timeRemaining / 60);
        const secs = model.timeRemaining % 60;
        const timeStr = `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
        
        this.ctx.font = '18px "Roboto", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText("TIEMPO:", centerX, 130);
        this.ctx.font = 'bold 30px "Montserrat", sans-serif';
        // Warning color si queda poco tiempo
        this.ctx.fillStyle = model.timeRemaining <= 30 ? 'red' : '#FF6B35'; 
        this.ctx.fillText(timeStr, centerX, 165);

        // Info de Tiempo Límite 
        const limitMinutes = Math.floor(model.timeLimit / 60);
        const limitSecs = model.timeLimit % 60;
        const limitTimeStr = `${limitMinutes}:${String(limitSecs).padStart(2, '0')}`;

        this.ctx.font = '15px "Roboto", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillText("LÍMITE:", centerX, 190);
        this.ctx.font = '17px "Montserrat", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText(limitTimeStr, centerX, 215);

        // Separador
        this.ctx.beginPath();
        this.ctx.moveTo(margin, 240);
        this.ctx.lineTo(sidebarWidth - margin, 240);
        this.ctx.stroke();

        // Botones de Control
        
        // Botón 1: Reiniciar
        this.dibujarBoton(centerX, 400, 100, 45, '#32CD32', 'Reiniciar', '#FFFFFF', 16, true);

        // Botón 2: Inicio
        this.dibujarBoton(centerX, 470, 100, 45, '#FFFFFF', 'Inicio', '#1A002B', 16, true);
    }

    //sirve para los btn de la barra lateral
    dibujarBoton(centerX, centerY, width, height, bgColor, text, textColor, fontSize, applyBtnVerMasStyle = false) {
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        
        const radius = applyBtnVerMasStyle ? 25 : 8; 
        if (applyBtnVerMasStyle) {
            this.ctx.shadowColor = 'rgba(50, 205, 50, 0.5)';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 4;
        }

        // Dibuja el fondo del botón
        this.ctx.fillStyle = bgColor;
        this.ctx.beginPath();
        if (typeof this.ctx.roundRect === 'function') {
            this.ctx.roundRect(x, y, width, height, radius);
        } else {
            this.ctx.rect(x, y, width, height);
        }
        this.ctx.fill();
        
        // Limpiar sombra para el texto
        if (applyBtnVerMasStyle) {
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }

        // Dibuja el texto
        this.ctx.font = `bold ${fontSize}px "Montserrat", sans-serif`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, centerX, centerY);
        
        // Restaurar el estado 
        this.ctx.textBaseline = 'alphabetic'; 
    }
    

    // Dibuja la celda y el hueco. Incluye la lógica del borde de hint.
    dibujarCelda(x, y, cell, selectedPiece, row, col) {
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
        
        // Borde del hueco por defecto
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // DIBUJA EL HINT (Borde Dorado)
        if (!cell.hasPiece && isHintTarget) {
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 1.0)';
            this.ctx.lineWidth = 5;
            
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
            this.dibujarPieza(centerX, centerY, cell.type, false);
        }
        
        this.ctx.shadowBlur = 0;
    }

    //dibuja la imagen de la ficha (cualq. de las tres)
    //y detalles en dorado para la ficha que esta siendo clickeable
    dibujarPieza(x, y, type, isDragging) {
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


    //muestra los movimientos validos que tiene cada piezqa que está siendo clickeada
    mostrarHints(model) {
        if (!model.selectedPiece || model.validMoves.length === 0) {
            this.activeHints = [];
            return;
        }
        
        this.activeHints = model.validMoves.map(move => ({
            toRow: move.toRow, 
            toCol: move.toCol
        }));
    }


    //Limpia la lista de hints activos.
    ocultarHints() {
        this.activeHints = [];
    }
    
    //para verificar qué pantalla mostrar, si la del menu, la de juego, etc.
    mostrarPantalla(screenId) {
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

    //pantalla si se gana el juego
    mostrarPantallaVictoria(piecesRemaining, timeUsed) {
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        
        document.getElementById('victoryPieces').textContent = piecesRemaining;
        document.getElementById('victoryTime').textContent = 
            `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        this.mostrarPantalla('victoryScreen');
    }

    //pantalla si se termina el tiempo de juego
    mostrarPantallaTiempoAgotado(piecesRemaining) {
        document.getElementById('timeUpPieces').textContent = piecesRemaining;
        this.mostrarPantalla('timeUpScreen');
    }

    //pantalla si no hay movimientos posibles
    mostrarPantallaSinMovimientos(piecesRemaining, timeUsed) {
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        
        document.getElementById('noMovesPieces').textContent = piecesRemaining;
        document.getElementById('noMovesTime').textContent = 
            `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        this.mostrarPantalla('noMovesScreen');
    }
    //guarda la ficha que esta siendo clickeada
    establecerPiezaArrastrada(x, y, type, fromRow, fromCol) {
        this.draggedPiece = { x, y, type, fromRow, fromCol };
    }
    //cuando se suelta una ficha
    limpiarPiezaArrastrada() {
        this.draggedPiece = null;
    }
}