// ==================== CONFIGURACIÓN DEL JUEGO (Constantes) ====================
const imageBank = [
    '/img/messi.jpg',
    '/img/r9.jpg',
    '/img/cr7.jpg',
    '/img/msn.jpg',
    '/img/suarez.jpg',
    '/img/maradona.jpg',
    '/img/messironaldinho.jpg',
    '/img/ney.jpg'
];

const levels = [
    { name: 'Nivel 1', filter: 'grayscale', time: null },
    { name: 'Nivel 2', filter: 'brightness', time: null },
    { name: 'Nivel 3', filter: 'invert', time: 60 },
    { name: 'Nivel 4', filter: 'mixed', time: 30 }
];


// ==================== CLASE PRINCIPAL DEL JUEGO ====================
class BlockaGame {
    constructor() {
        // =============== ESTADO DEL JUEGO ===============
        this.gameState = {
            currentScreen: 'menu',
            currentLevel: 1,
            timer: 0,
            timerInterval: null,
            pieces: [],
            selectedImage: null,
            selectedImageIndex: -1,
            originalImage: null,
            gridSize: 4,
            helpUsed: false,
            timeLimit: null,
            loadedImages: []
        };

        // =============== CANVAS Y CONTEXTOS ===============
        this.canvases = {
            menu: document.getElementById('menuCanvas'),
            animation: document.getElementById('animationCanvas'),
            game: document.getElementById('gameCanvas'),
            completed: document.getElementById('completedCanvas')
        };
        this.contexts = {}; // Se llenará en configurarCanvases

        // =============== ELEMENTOS DEL DOM ===============
        this.elements = {
            menuScreen: document.getElementById('menuScreen'),
            gameScreen: document.getElementById('gameScreen'),
            completedScreen: document.getElementById('completedScreen'),
            imageAnimation: document.getElementById('imageAnimation'),
            btnStart: document.getElementById('btnStart'),
            btnHome: document.getElementById('btnHome'),
            btnHelp: document.getElementById('btnHelp'),
            btnMenuCompleted: document.getElementById('btnMenuCompleted'),
            btnNextLevel: document.getElementById('btnNextLevel'),
            gridSizeSelect: document.getElementById('gridSizeSelect'),
            levelName: document.getElementById('levelName'),
            timer: document.getElementById('timer'),
            timeLimit: document.getElementById('timeLimit'),
            completedTime: document.getElementById('completedTime')
        };
        
        // Iniciar todo
        this.iniciar();
    }

    // ==================== INICIALIZACIÓN ====================
    iniciar() {
        this.configurarCanvases();
        this.configurarEventListeners();
        this.precargarImagenes();
    }

    configurarCanvases() {
        for (const key in this.canvases) {
            this.contexts[key] = this.canvases[key].getContext('2d');
        }
    }

    configurarEventListeners() {
        this.elements.btnStart.addEventListener('click', this.iniciarJuego.bind(this));
        this.elements.btnHome.addEventListener('click', this.irAlMenu.bind(this));
        this.elements.btnHelp.addEventListener('click', this.usarAyuda.bind(this));
        this.elements.btnMenuCompleted.addEventListener('click', this.irAlMenu.bind(this));
        this.elements.btnNextLevel.addEventListener('click', this.siguienteNivel.bind(this));

        this.elements.gridSizeSelect.addEventListener('change', (e) => {
            this.gameState.gridSize = parseInt(e.target.value);
        });

        this.canvases.game.addEventListener('click', this.gestionarClickCanvasJuego.bind(this));
        this.canvases.game.addEventListener('contextmenu', this.gestionarClickDerechoCanvasJuego.bind(this));
    }

    precargarImagenes() {
        let loadedCount = 0;
        imageBank.forEach((src, index) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.gameState.loadedImages[index] = img;
                loadedCount++;
                if (loadedCount === imageBank.length) {
                    this.dibujarGaleriaMenu();
                }
            };
            img.onerror = () => {
                console.error(`Error al cargar imagen: ${src}`);
                loadedCount++;
            };
            img.src = src;
        });
    }

    // ==================== DIBUJADO Y NAVEGACIÓN ====================
    dibujarGaleriaMenu() {
        const cols = 4;
        const rows = 2;
        const padding = 10;
        const imgSize = 250;

        this.canvases.menu.width = cols * imgSize + (cols + 1) * padding;
        this.canvases.menu.height = rows * imgSize + (rows + 1) * padding;

        const ctx = this.contexts.menu;
        ctx.clearRect(0, 0, this.canvases.menu.width, this.canvases.menu.height);

        this.gameState.loadedImages.forEach((img, index) => {
            if (!img) return;
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * imgSize + (col + 1) * padding;
            const y = row * imgSize + (row + 1) * padding;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;
            ctx.drawImage(img, x, y, imgSize, imgSize);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        });
    }
    
    mostrarPantalla(screenName) {
        this.elements.menuScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.completedScreen.classList.add('hidden');

        if (screenName === 'menu') this.elements.menuScreen.classList.remove('hidden');
        else if (screenName === 'game') this.elements.gameScreen.classList.remove('hidden');
        else if (screenName === 'completed') this.elements.completedScreen.classList.remove('hidden');

        this.gameState.currentScreen = screenName;
    }

    irAlMenu() {
        this.detenerTemporizador();
        this.gameState = {
            ...this.gameState, // Mantiene loadedImages y gridSize
            currentScreen: 'menu',
            currentLevel: 1,
            timer: 0,
            timerInterval: null,
            pieces: [],
            selectedImage: null,
            selectedImageIndex: -1,
            originalImage: null,
            helpUsed: false,
            timeLimit: null,
        };
        this.mostrarPantalla('menu');
    }

    // ==================== CONTROL DEL JUEGO ====================
    iniciarJuego() {
        this.gameState.currentLevel = 1;
        this.mostrarAnimacionSeleccionImagen();
    }

    siguienteNivel() {
        if (this.gameState.currentLevel < levels.length) {
            this.gameState.currentLevel++;
            this.mostrarAnimacionSeleccionImagen();
        } else {
            this.irAlMenu();
        }
    }

    mostrarAnimacionSeleccionImagen() {
        const randomIndex = Math.floor(Math.random() * imageBank.length);
        this.gameState.selectedImageIndex = randomIndex;
        this.gameState.selectedImage = this.gameState.loadedImages[randomIndex];

        this.elements.imageAnimation.classList.remove('hidden');
        this.dibujarGaleriaAnimacion(false);

        setTimeout(() => this.dibujarGaleriaAnimacion(true), 500);
        setTimeout(() => {
            this.elements.imageAnimation.classList.add('hidden');
            this.inicializarNivel();
        }, 2000);
    }

    dibujarGaleriaAnimacion(highlight) {
        const ctx = this.contexts.animation;
        const cols = 4;
        const rows = 2;
        const imgSize = 80;
        const padding = 8;
        this.canvases.animation.width = cols * imgSize + (cols + 1) * padding;
        this.canvases.animation.height = rows * imgSize + (rows + 1) * padding;
        ctx.clearRect(0, 0, this.canvases.animation.width, this.canvases.animation.height);

        this.gameState.loadedImages.forEach((img, index) => {
            if (!img) return;
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * imgSize + (col + 1) * padding;
            const y = row * imgSize + (row + 1) * padding;
            const isSelected = index === this.gameState.selectedImageIndex;

            if (highlight && isSelected) {
                ctx.strokeStyle = '#9D4EDD';
                ctx.lineWidth = 4;
                ctx.strokeRect(x - 2, y - 2, imgSize + 4, imgSize + 4);
                ctx.globalAlpha = 1;
            } else {
                ctx.globalAlpha = highlight ? 0.5 : 0.8;
            }
            ctx.drawImage(img, x, y, imgSize, imgSize);
            ctx.globalAlpha = 1;
        });
    }

    // ==================== LÓGICA DEL NIVEL ====================
    inicializarNivel() {
        if (!this.gameState.selectedImage) {
            console.error('No hay imagen seleccionada');
            return;
        }
        this.gameState.originalImage = this.gameState.selectedImage;
        this.configurarPuzzle();
        this.actualizarInfoNivel();
        this.mostrarPantalla('game');
        this.iniciarTemporizador();
    }

    configurarPuzzle() {
        const { originalImage, gridSize, currentLevel } = this.gameState;
        const cols = gridSize === 4 ? 2 : gridSize === 6 ? 3 : 4;
        const rows = gridSize / cols;
        const pieceWidth = originalImage.width / cols;
        const pieceHeight = originalImage.height / rows;

        this.gameState.pieces = [];
        this.gameState.helpUsed = false;
        const levelConfig = levels[currentLevel - 1];
        this.gameState.timeLimit = levelConfig.time;

        for (let i = 0; i < gridSize; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            const pieceCtx = pieceCanvas.getContext('2d');

            pieceCtx.drawImage(
                originalImage,
                col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight,
                0, 0, pieceWidth, pieceHeight
            );

            let imageData = pieceCtx.getImageData(0, 0, pieceWidth, pieceHeight);
            imageData = this.aplicarFiltro(pieceCtx, imageData, levelConfig.filter, i);
            pieceCtx.putImageData(imageData, 0, 0);

            this.gameState.pieces.push({
                id: i, col, row,
                rotation: Math.floor(Math.random() * 4) * 90,
                correctRotation: 0,
                canvas: pieceCanvas,
                isFixed: false,
                width: pieceWidth,
                height: pieceHeight
            });
        }
        this.dibujarCanvasJuego();
    }
    
    dibujarCanvasJuego() {
        const { gridSize, pieces } = this.gameState;
        const cols = gridSize === 4 ? 2 : gridSize === 6 ? 3 : 4;
        const rows = gridSize / cols;
        const padding = 10;
        const maxSize = 600;
        const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);

        this.canvases.game.width = cols * pieceSize + (cols + 1) * padding;
        this.canvases.game.height = rows * pieceSize + (rows + 1) * padding;
        const ctx = this.contexts.game;
        ctx.clearRect(0, 0, this.canvases.game.width, this.canvases.game.height);
        ctx.fillStyle = 'rgba(31, 41, 55, 0.3)';
        ctx.fillRect(0, 0, this.canvases.game.width, this.canvases.game.height);

        pieces.forEach((piece) => {
            const x = piece.col * pieceSize + (piece.col + 1) * padding;
            const y = piece.row * pieceSize + (piece.row + 1) * padding;
            ctx.save();
            ctx.translate(x + pieceSize / 2, y + pieceSize / 2);
            ctx.rotate((piece.rotation * Math.PI) / 180);
            ctx.drawImage(piece.canvas, -pieceSize / 2, -pieceSize / 2, pieceSize, pieceSize);
            ctx.restore();
            
            ctx.strokeStyle = piece.isFixed ? '#32CD32' : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = piece.isFixed ? 4 : 2;
            ctx.strokeRect(x, y, pieceSize, pieceSize);
        });
    }

    // ==================== INTERACCIÓN CON EL JUEGO ====================
    gestionarClickCanvasJuego(e) {
        const piece = this.obtenerPiezaEnPosicion(e.offsetX, e.offsetY);
        if (piece && !piece.isFixed) {
            this.rotarPieza(piece.id, 'left');
        }
    }

    gestionarClickDerechoCanvasJuego(e) {
        e.preventDefault();
        const piece = this.obtenerPiezaEnPosicion(e.offsetX, e.offsetY);
        if (piece && !piece.isFixed) {
            this.rotarPieza(piece.id, 'right');
        }
    }
    
    obtenerPiezaEnPosicion(x, y) {
        const { gridSize, pieces } = this.gameState;
        const cols = gridSize === 4 ? 2 : gridSize === 6 ? 3 : 4;
        const padding = 10;
        const maxSize = 600;
        const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);

        for (let piece of pieces) {
            const px = piece.col * pieceSize + (piece.col + 1) * padding;
            const py = piece.row * pieceSize + (piece.row + 1) * padding;
            if (x >= px && x <= px + pieceSize && y >= py && y <= py + pieceSize) {
                return piece;
            }
        }
        return null;
    }

    rotarPieza(pieceId, direction) {
        const piece = this.gameState.pieces.find(p => p.id === pieceId);
        if (!piece || piece.isFixed) return;

        if (direction === 'right') {
            piece.rotation = (piece.rotation + 90) % 360;
        } else {
            piece.rotation = (piece.rotation - 90 + 360) % 360;
        }
        this.dibujarCanvasJuego();
        this.verificarVictoria();
    }
    
    usarAyuda() {
        if (this.gameState.helpUsed) return;
        const unfixedPieces = this.gameState.pieces.filter(p => !p.isFixed && p.rotation !== p.correctRotation);
        if (unfixedPieces.length > 0) {
            const randomPiece = unfixedPieces[Math.floor(Math.random() * unfixedPieces.length)];
            randomPiece.rotation = 0;
            randomPiece.isFixed = true;
            this.gameState.timer += 5;
            this.gameState.helpUsed = true;
            this.elements.btnHelp.disabled = true;
            this.elements.btnHelp.textContent = 'Ayuda usada';
            this.dibujarCanvasJuego();
            this.verificarVictoria();
        }
    }

    verificarVictoria() {
        const allCorrect = this.gameState.pieces.every(piece => piece.rotation === piece.correctRotation);
        if (allCorrect) {
            this.detenerTemporizador();
            this.mostrarPantallaCompletado();
        }
    }
    
    mostrarPantallaCompletado() {
        this.elements.completedTime.textContent = `Tiempo: ${this.formatearTiempo(this.gameState.timer)}`;
        this.canvases.completed.width = 400;
        this.canvases.completed.height = 400;
        this.contexts.completed.drawImage(this.gameState.originalImage, 0, 0, 400, 400);

        this.elements.btnNextLevel.style.display = this.gameState.currentLevel < levels.length ? 'flex' : 'none';
        this.mostrarPantalla('completed');
    }

    actualizarInfoNivel() {
        const levelConfig = levels[this.gameState.currentLevel - 1];
        this.elements.levelName.textContent = levelConfig.name;
        this.elements.timeLimit.textContent = levelConfig.time ? `/ ${this.formatearTiempo(levelConfig.time)}` : '';
        this.elements.btnHelp.disabled = false;
        this.elements.btnHelp.textContent = 'Ayudita (+5s)';
    }

    // ==================== TEMPORIZADOR ====================
    iniciarTemporizador() {
        this.gameState.timer = 0;
        this.detenerTemporizador();
        this.gameState.timerInterval = setInterval(() => {
            this.gameState.timer++;
            this.elements.timer.textContent = this.formatearTiempo(this.gameState.timer);
            if (this.gameState.timeLimit && this.gameState.timer >= this.gameState.timeLimit) {
                this.detenerTemporizador();
                alert('¡Tiempo agotado! Intenta nuevamente.');
                this.irAlMenu();
            }
        }, 1000);
    }

    detenerTemporizador() {
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
            this.gameState.timerInterval = null;
        }
    }

    formatearTiempo(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ==================== FILTROS DE IMAGEN ====================
    aplicarFiltro(ctx, imageData, filterType, pieceIndex) {
        const data = imageData.data;
        switch (filterType) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = data[i + 1] = data[i + 2] = avg;
                }
                break;
            case 'brightness':
                const factor = 0.3;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * (1 + factor));
                    data[i + 1] = Math.min(255, data[i + 1] * (1 + factor));
                    data[i + 2] = Math.min(255, data[i + 2] * (1 + factor));
                }
                break;
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;
            case 'mixed':
                const filters = ['grayscale', 'brightness', 'invert', 'none'];
                const selectedFilter = filters[pieceIndex % filters.length];
                if (selectedFilter !== 'none') {
                    return this.aplicarFiltro(ctx, imageData, selectedFilter, pieceIndex);
                }
                break;
        }
        return imageData;
    }
}

// ==================== INICIAR AL CARGAR ====================
window.addEventListener('DOMContentLoaded', () => {
    new BlockaGame(); // Se crea la instancia del juego
});