// ==================== CONFIGURACIÓN DEL JUEGO ====================

const imageBank = [
    'img/ney.jpg',
    'img/equi.jpg',
    'img/r9.jpg',
    'img/suarez.jpg',
    'img/cr7.jpg'
];

const levels = [
    { name: 'Nivel 1', filter: 'grayscale', time: null },
    { name: 'Nivel 2', filter: 'brightness', time: null },
    { name: 'Nivel 3', filter: 'invert', time: 180 },
    { name: 'Nivel 4', filter: 'mixed', time: 150 }
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

function init() {
    setupCanvases();
    setupEventListeners();
    preloadImages();
}

function setupCanvases() {
    canvases.menu = document.getElementById('menuCanvas');
    canvases.animation = document.getElementById('animationCanvas');
    canvases.game = document.getElementById('gameCanvas');
    canvases.completed = document.getElementById('completedCanvas');
    
    contexts.menu = canvases.menu.getContext('2d');
    contexts.animation = canvases.animation.getContext('2d');
    contexts.game = canvases.game.getContext('2d');
    contexts.completed = canvases.completed.getContext('2d');
}

function setupEventListeners() {
    elements.btnStart.addEventListener('click', startGame);
    elements.btnHome.addEventListener('click', goToMenu);
    elements.btnHelp.addEventListener('click', useHelp);
    elements.btnMenuCompleted.addEventListener('click', goToMenu);
    elements.btnNextLevel.addEventListener('click', nextLevel);
    
    elements.gridSizeSelect.addEventListener('change', (e) => {
        gameState.gridSize = parseInt(e.target.value);
    });
    
    // Event listeners para el canvas del juego
    canvases.game.addEventListener('click', handleGameCanvasClick);
    canvases.game.addEventListener('contextmenu', handleGameCanvasRightClick);
}

function preloadImages() {
    let loadedCount = 0;
    
    imageBank.forEach((src, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            gameState.loadedImages[index] = img;
            loadedCount++;
            if (loadedCount === imageBank.length) {
                drawMenuGallery();
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

function drawMenuGallery() {
    const cols = 4;
    const rows = 2;
    const padding = 10;
    const imgSize = 260;
    
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
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        // Dibujar imagen
        ctx.drawImage(img, x, y, imgSize, imgSize);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });
}

// ==================== NAVEGACIÓN ====================

function showScreen(screenName) {
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

function goToMenu() {
    stopTimer();
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
    showScreen('menu');
}

// ==================== CONTROL DEL JUEGO ====================

function startGame() {
    gameState.currentLevel = 1;
    showImageSelectionAnimation();
}

function nextLevel() {
    if (gameState.currentLevel < levels.length) {
        gameState.currentLevel++;
        showImageSelectionAnimation();
    } else {
        goToMenu();
    }
}

function showImageSelectionAnimation() {
    // Seleccionar imagen aleatoria
    const randomIndex = Math.floor(Math.random() * imageBank.length);
    gameState.selectedImageIndex = randomIndex;
    gameState.selectedImage = gameState.loadedImages[randomIndex];
    
    // Configurar canvas de animación
    const cols = 4;
    const rows = 2;
    const imgSize = 80;
    const padding = 8;
    
    canvases.animation.width = cols * imgSize + (cols + 1) * padding;
    canvases.animation.height = rows * imgSize + (rows + 1) * padding;
    
    elements.imageAnimation.classList.remove('hidden');
    
    // Dibujar galería inicial
    drawAnimationGallery(false);
    
    // Después de 500ms, resaltar la seleccionada
    setTimeout(() => {
        drawAnimationGallery(true);
    }, 500);
    
    // Después de 2 segundos, iniciar el nivel
    setTimeout(() => {
        elements.imageAnimation.classList.add('hidden');
        initializeLevel();
    }, 2000);
}

function drawAnimationGallery(highlight) {
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
            // Borde dorado para la seleccionada
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

// ==================== INICIAR AL CARGAR ====================

window.addEventListener('DOMContentLoaded', init);