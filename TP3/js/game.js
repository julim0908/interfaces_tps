// ==================== CONFIGURACIÓN DEL JUEGO ====================
const imageBank = [
    'img/messi.jpg',
    'img/r9.jpg',
    'img/cr7.jpg',
    'img/msn.jpg',
    'img/suarez.jpg',
    'img/maradona.jpg',
    'img/messironaldinho.jpg',
    'img/ney.jpg'
];

const levels = [
    { name: 'Nivel 1', filter: 'grayscale', time: null },
    { name: 'Nivel 2', filter: 'brightness', time: null },
    { name: 'Nivel 3', filter: 'invert', time: 60 },
    { name: 'Nivel 4', filter: 'mixed', time: 30 }
];

// ==================== ESTADO DEL JUEGO ====================

let gameState = {
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

// ==================== CANVAS Y CONTEXTOS ====================

const canvases = {
    menu: null,
    animation: null,
    game: null,
    completed: null
};

const contexts = {
    menu: null,
    animation: null,
    game: null,
    completed: null
};

// ==================== ELEMENTOS DEL DOM ====================

const elements = {
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

// ==================== INICIALIZACIÓN ====================

function iniciar() {
    configurarCanvases();
    configurarEventListeners();
    precargarImagenes();
}

function configurarCanvases() {
    canvases.menu = document.getElementById('menuCanvas');
    canvases.animation = document.getElementById('animationCanvas');
    canvases.game = document.getElementById('gameCanvas');
    canvases.completed = document.getElementById('completedCanvas');
    
    contexts.menu = canvases.menu.getContext('2d');
    contexts.animation = canvases.animation.getContext('2d');
    contexts.game = canvases.game.getContext('2d');
    contexts.completed = canvases.completed.getContext('2d');
}

function configurarEventListeners() {
    elements.btnStart.addEventListener('click', iniciarJuego);
    elements.btnHome.addEventListener('click', irAlMenu);
    elements.btnHelp.addEventListener('click', usarAyuda);
    elements.btnMenuCompleted.addEventListener('click', irAlMenu);
    elements.btnNextLevel.addEventListener('click', siguienteNivel);
    
    elements.gridSizeSelect.addEventListener('change', (e) => {
        gameState.gridSize = parseInt(e.target.value);
    });
    
    canvases.game.addEventListener('click', gestionarClickCanvasJuego);
    canvases.game.addEventListener('contextmenu', gestionarClickDerechoCanvasJuego);
}

function precargarImagenes() {
    let loadedCount = 0;
    
    imageBank.forEach((src, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            gameState.loadedImages[index] = img;
            loadedCount++;
            if (loadedCount === imageBank.length) {
                dibujarGaleriaMenu();
            }
        };
        img.onerror = () => {
            console.error(`Error al cargar imagen: ${src}`);
            loadedCount++;
        };
        img.src = src;
    });
}

// ==================== DIBUJADO DEL MENÚ ====================

function dibujarGaleriaMenu() {
    const cols = 4;
    const rows = 2;
    const padding = 10;
    const imgSize = 250;
    
    canvases.menu.width = cols * imgSize + (cols + 1) * padding;
    canvases.menu.height = rows * imgSize + (rows + 1) * padding;
    
    const ctx = contexts.menu;
    ctx.clearRect(0, 0, canvases.menu.width, canvases.menu.height);
    
    gameState.loadedImages.forEach((img, index) => {
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

// ==================== NAVEGACIÓN ====================

function mostrarPantalla(screenName) {
    elements.menuScreen.classList.add('hidden');
    elements.gameScreen.classList.add('hidden');
    elements.completedScreen.classList.add('hidden');
    
    if (screenName === 'menu') {
        elements.menuScreen.classList.remove('hidden');
    } else if (screenName === 'game') {
        elements.gameScreen.classList.remove('hidden');
    } else if (screenName === 'completed') {
        elements.completedScreen.classList.remove('hidden');
    }
    
    gameState.currentScreen = screenName;
}

function irAlMenu() {
    detenerTemporizador();
    gameState = {
        currentScreen: 'menu',
        currentLevel: 1,
        timer: 0,
        timerInterval: null,
        pieces: [],
        selectedImage: null,
        selectedImageIndex: -1,
        originalImage: null,
        gridSize: gameState.gridSize,
        helpUsed: false,
        timeLimit: null,
        loadedImages: gameState.loadedImages
    };
    mostrarPantalla('menu');
}

// ==================== CONTROL DEL JUEGO ====================

function iniciarJuego() {
    gameState.currentLevel = 1;
    mostrarAnimacionSeleccionImagen();
}

function siguienteNivel() {
    if (gameState.currentLevel < levels.length) {
        gameState.currentLevel++;
        mostrarAnimacionSeleccionImagen();
    } else {
        irAlMenu();
    }
}

function mostrarAnimacionSeleccionImagen() {
    const randomIndex = Math.floor(Math.random() * imageBank.length);
    gameState.selectedImageIndex = randomIndex;
    gameState.selectedImage = gameState.loadedImages[randomIndex];
    
    const cols = 4;
    const rows = 2;
    const imgSize = 80;
    const padding = 8;
    
    canvases.animation.width = cols * imgSize + (cols + 1) * padding;
    canvases.animation.height = rows * imgSize + (rows + 1) * padding;
    
    elements.imageAnimation.classList.remove('hidden');
    
    dibujarGaleriaAnimacion(false);
    
    setTimeout(() => {
        dibujarGaleriaAnimacion(true);
    }, 500);
    
    setTimeout(() => {
        elements.imageAnimation.classList.add('hidden');
        inicializarNivel();
    }, 2000);
}

function dibujarGaleriaAnimacion(highlight) {
    const ctx = contexts.animation;
    const cols = 4;
    const rows = 2;
    const imgSize = 80;
    const padding = 8;
    
    ctx.clearRect(0, 0, canvases.animation.width, canvases.animation.height);
    
    gameState.loadedImages.forEach((img, index) => {
        if (!img) return;
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * imgSize + (col + 1) * padding;
        const y = row * imgSize + (row + 1) * padding;
        
        const isSelected = index === gameState.selectedImageIndex;
        
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
// ==================== INICIALIZACIÓN DEL NIVEL ====================

function initializeLevel() {
    if (!gameState.selectedImage) {
        console.error('No hay imagen seleccionada');
        return;
    }
    
    gameState.originalImage = gameState.selectedImage;
    setupPuzzle();
    updateLevelInfo();
    showScreen('game');
    startTimer();
}

function setupPuzzle() {
    const img = gameState.originalImage;
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const rows = gameState.gridSize / cols;
    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;
    
    gameState.pieces = [];
    gameState.helpUsed = false;
    
    const levelConfig = levels[gameState.currentLevel - 1];
    gameState.timeLimit = levelConfig.time;
    
    // Crear piezas con canvas individuales
    for (let i = 0; i < gameState.gridSize; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const rotation = Math.floor(Math.random() * 4) * 90;
        
        // Crear canvas temporal para la pieza
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext('2d');
        
        // Dibujar la porción de imagen
        pieceCtx.drawImage(
            img,
            col * pieceWidth, row * pieceHeight,
            pieceWidth, pieceHeight,
            0, 0,
            pieceWidth, pieceHeight
        );
        
        // Aplicar filtro
        let imageData = pieceCtx.getImageData(0, 0, pieceWidth, pieceHeight);
        imageData = applyFilter(pieceCtx, imageData, levelConfig.filter, i);
        pieceCtx.putImageData(imageData, 0, 0);
        
        gameState.pieces.push({
            id: i,
            col: col,
            row: row,
            rotation: rotation,
            correctRotation: 0,
            canvas: pieceCanvas,
            isFixed: false,
            width: pieceWidth,
            height: pieceHeight
        });
    }
    
    drawGameCanvas();
}

// ==================== DIBUJADO DEL CANVAS DE JUEGO ====================

function drawGameCanvas() {
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const rows = gameState.gridSize / cols;
    const padding = 10;
    const maxSize = 600;
    
    // Calcular tamaño de pieza basado en el tamaño máximo
    const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);
    
    canvases.game.width = cols * pieceSize + (cols + 1) * padding;
    canvases.game.height = rows * pieceSize + (rows + 1) * padding;
    
    const ctx = contexts.game;
    ctx.clearRect(0, 0, canvases.game.width, canvases.game.height);
    
    // Fondo oscuro
    ctx.fillStyle = 'rgba(31, 41, 55, 0.3)';
    ctx.fillRect(0, 0, canvases.game.width, canvases.game.height);
    
    gameState.pieces.forEach((piece) => {
        const x = piece.col * pieceSize + (piece.col + 1) * padding;
        const y = piece.row * pieceSize + (piece.row + 1) * padding;
        
        ctx.save();
        
        // Mover al centro de la pieza
        ctx.translate(x + pieceSize / 2, y + pieceSize / 2);
        
        // Rotar
        ctx.rotate((piece.rotation * Math.PI) / 180);
        
        // Dibujar imagen centrada
        ctx.drawImage(
            piece.canvas,
            -pieceSize / 2,
            -pieceSize / 2,
            pieceSize,
            pieceSize
        );
        
        ctx.restore();
        
        // Borde
        if (piece.isFixed) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
        }
        ctx.strokeRect(x, y, pieceSize, pieceSize);
    });
}

// ==================== INTERACCIÓN CON EL CANVAS ====================

function handleGameCanvasClick(e) {
    const piece = getPieceAtPosition(e.offsetX, e.offsetY);
    if (piece && !piece.isFixed) {
        rotatePiece(piece.id, 'left');
    }
}

function handleGameCanvasRightClick(e) {
    e.preventDefault();
    const piece = getPieceAtPosition(e.offsetX, e.offsetY);
    if (piece && !piece.isFixed) {
        rotatePiece(piece.id, 'right');
    }
}

function getPieceAtPosition(x, y) {
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const padding = 10;
    const maxSize = 600;
    const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);
    
    for (let piece of gameState.pieces) {
        const px = piece.col * pieceSize + (piece.col + 1) * padding;
        const py = piece.row * pieceSize + (piece.row + 1) * padding;
        
        if (x >= px && x <= px + pieceSize && y >= py && y <= py + pieceSize) {
            return piece;
        }
    }
    return null;
}

function rotatePiece(pieceId, direction) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || piece.isFixed) return;
    
    if (direction === 'right') {
        piece.rotation = (piece.rotation + 90) % 360;
    } else {
        piece.rotation = (piece.rotation - 90 + 360) % 360;
    }
    
    drawGameCanvas();
    checkWin();
}

function useHelp() {
    if (gameState.helpUsed) return;
    
    const unfixedPieces = gameState.pieces.filter(p => !p.isFixed && p.rotation !== p.correctRotation);
    if (unfixedPieces.length > 0) {
        const randomPiece = unfixedPieces[Math.floor(Math.random() * unfixedPieces.length)];
        randomPiece.rotation = 0;
        randomPiece.isFixed = true;
        gameState.timer += 5;
        gameState.helpUsed = true;
        elements.btnHelp.disabled = true;
        elements.btnHelp.textContent = 'Ayuda usada';
        drawGameCanvas();
        checkWin();
    }
}

function checkWin() {
    const allCorrect = gameState.pieces.every(piece => piece.rotation === piece.correctRotation);
    if (allCorrect) {
        stopTimer();
        showCompletedScreen();
    }
}

// ==================== INICIALIZACIÓN DEL NIVEL ====================

function inicializarNivel() {
    if (!gameState.selectedImage) {
        console.error('No hay imagen seleccionada');
        return;
    }
    
    gameState.originalImage = gameState.selectedImage;
    configurarPuzzle();
    actualizarInfoNivel();
    mostrarPantalla('game');
    iniciarTemporizador();
}

function configurarPuzzle() {
    const img = gameState.originalImage;
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const rows = gameState.gridSize / cols;
    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;
    
    gameState.pieces = [];
    gameState.helpUsed = false;
    
    const levelConfig = levels[gameState.currentLevel - 1];
    gameState.timeLimit = levelConfig.time;
    
    for (let i = 0; i < gameState.gridSize; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const rotation = Math.floor(Math.random() * 4) * 90;
        
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext('2d');
        
        pieceCtx.drawImage(
            img,
            col * pieceWidth, row * pieceHeight,
            pieceWidth, pieceHeight,
            0, 0,
            pieceWidth, pieceHeight
        );
        
        let imageData = pieceCtx.getImageData(0, 0, pieceWidth, pieceHeight);
        imageData = aplicarFiltro(pieceCtx, imageData, levelConfig.filter, i);
        pieceCtx.putImageData(imageData, 0, 0);
        
        gameState.pieces.push({
            id: i,
            col: col,
            row: row,
            rotation: rotation,
            correctRotation: 0,
            canvas: pieceCanvas,
            isFixed: false,
            width: pieceWidth,
            height: pieceHeight
        });
    }
    
    dibujarCanvasJuego();
}

// ==================== DIBUJADO DEL CANVAS DE JUEGO ====================

function dibujarCanvasJuego() {
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const rows = gameState.gridSize / cols;
    const padding = 10;
    const maxSize = 600;
    
    const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);
    
    canvases.game.width = cols * pieceSize + (cols + 1) * padding;
    canvases.game.height = rows * pieceSize + (rows + 1) * padding;
    
    const ctx = contexts.game;
    ctx.clearRect(0, 0, canvases.game.width, canvases.game.height);
    
    ctx.fillStyle = 'rgba(31, 41, 55, 0.3)';
    ctx.fillRect(0, 0, canvases.game.width, canvases.game.height);
    
    gameState.pieces.forEach((piece) => {
        const x = piece.col * pieceSize + (piece.col + 1) * padding;
        const y = piece.row * pieceSize + (piece.row + 1) * padding;
        
        ctx.save();
        
        ctx.translate(x + pieceSize / 2, y + pieceSize / 2);
        
        ctx.rotate((piece.rotation * Math.PI) / 180);
        
        ctx.drawImage(
            piece.canvas,
            -pieceSize / 2,
            -pieceSize / 2,
            pieceSize,
            pieceSize
        );
        
        ctx.restore();
        
        if (piece.isFixed) {
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
        }
        ctx.strokeRect(x, y, pieceSize, pieceSize);
    });
}

// ==================== INTERACCIÓN CON EL CANVAS ====================

function gestionarClickCanvasJuego(e) {
    const piece = obtenerPiezaEnPosicion(e.offsetX, e.offsetY);
    if (piece && !piece.isFixed) {
        rotarPieza(piece.id, 'left');
    }
}

function gestionarClickDerechoCanvasJuego(e) {
    e.preventDefault();
    const piece = obtenerPiezaEnPosicion(e.offsetX, e.offsetY);
    if (piece && !piece.isFixed) {
        rotarPieza(piece.id, 'right');
    }
}

function obtenerPiezaEnPosicion(x, y) {
    const cols = gameState.gridSize === 4 ? 2 : gameState.gridSize === 6 ? 3 : 4;
    const padding = 10;
    const maxSize = 600;
    const pieceSize = Math.floor((maxSize - (cols + 1) * padding) / cols);
    
    for (let piece of gameState.pieces) {
        const px = piece.col * pieceSize + (piece.col + 1) * padding;
        const py = piece.row * pieceSize + (piece.row + 1) * padding;
        
        if (x >= px && x <= px + pieceSize && y >= py && y <= py + pieceSize) {
            return piece;
        }
    }
    return null;
}

function rotarPieza(pieceId, direction) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || piece.isFixed) return;
    
    if (direction === 'right') {
        piece.rotation = (piece.rotation + 90) % 360;
    } else {
        piece.rotation = (piece.rotation - 90 + 360) % 360;
    }
    
    dibujarCanvasJuego();
    verificarVictoria();
}

function usarAyuda() {
    if (gameState.helpUsed) return;
    
    const unfixedPieces = gameState.pieces.filter(p => !p.isFixed && p.rotation !== p.correctRotation);
    if (unfixedPieces.length > 0) {
        const randomPiece = unfixedPieces[Math.floor(Math.random() * unfixedPieces.length)];
        randomPiece.rotation = 0;
        randomPiece.isFixed = true;
        gameState.timer += 5;
        gameState.helpUsed = true;
        elements.btnHelp.disabled = true;
        elements.btnHelp.textContent = 'Ayuda usada';
        dibujarCanvasJuego();
        verificarVictoria();
    }
}

function verificarVictoria() {
    const allCorrect = gameState.pieces.every(piece => piece.rotation === piece.correctRotation);
    if (allCorrect) {
        detenerTemporizador();
        mostrarPantallaCompletado();
    }
}

function mostrarPantallaCompletado() {
    elements.completedTime.textContent = `Tiempo: ${formatearTiempo(gameState.timer)}`;
    
    canvases.completed.width = 400;
    canvases.completed.height = 400;
    contexts.completed.drawImage(gameState.originalImage, 0, 0, 400, 400);
    
    if (gameState.currentLevel < levels.length) {
        elements.btnNextLevel.style.display = 'flex';
    } else {
        elements.btnNextLevel.style.display = 'none';
    }
    
    mostrarPantalla('completed');
}

function actualizarInfoNivel() {
    const levelConfig = levels[gameState.currentLevel - 1];
    elements.levelName.textContent = levelConfig.name;
    
    if (levelConfig.time) {
        elements.timeLimit.textContent = `/ ${formatearTiempo(levelConfig.time)}`;
    } else {
        elements.timeLimit.textContent = '';
    }
    
    elements.btnHelp.disabled = false;
    elements.btnHelp.textContent = 'Ayudita (+5s)';
}

// ==================== TEMPORIZADOR ====================

function iniciarTemporizador() {
    gameState.timer = 0;
    detenerTemporizador();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        elements.timer.textContent = formatearTiempo(gameState.timer);
        
        if (gameState.timeLimit && gameState.timer >= gameState.timeLimit) {
            detenerTemporizador();
            alert('¡Tiempo agotado! Intenta nuevamente.');
            irAlMenu();
        }
    }, 1000);
}

function detenerTemporizador() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function formatearTiempo(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== FILTROS ====================

function aplicarFiltro(ctx, imageData, filterType, pieceIndex) {
    const data = imageData.data;
    
    switch(filterType) {
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
                return aplicarFiltro(ctx, imageData, selectedFilter, pieceIndex);
            }
            break;
    }
    
    return imageData;
}

// ==================== INICIAR AL CARGAR ====================

window.addEventListener('DOMContentLoaded', iniciar);