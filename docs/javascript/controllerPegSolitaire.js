class PegSolitaireController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.isDragging = false;
        this.dragStartPos = null;
        
        // Coordenadas de los botones en la barra lateral
        this.buttonHitboxes = {
            restart: { x: (this.model.sidebarWidth / 2) - 50, y: 375, w: 100, h: 50 },
            home:    { x: (this.model.sidebarWidth / 2) - 50, y: 445, w: 100, h: 50 }
        };

        this.inicializarEventListeners();
    }

    // liseteners del html
    inicializarEventListeners() {
        // Listener del botón de inicio de juego (HTML)
        document.getElementById('playButton').addEventListener('click', () => {
            this.iniciarJuego();
        });
        
        // Eventos del canvas de juego
        const canvas = this.view.canvas;
        
        canvas.addEventListener('mousedown', this.manejarMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.manejarMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.manejarMouseUp.bind(this));
        canvas.addEventListener('mouseleave', this.manejarMouseLeave.bind(this));
        
        // Botones de pantallas de fin de juego
        this.configurarBotonesFinDeJuego('Victory');
        this.configurarBotonesFinDeJuego('TimeUp');
        this.configurarBotonesFinDeJuego('NoMoves');
    }
    // asigna funciones a 'jugar de nuevo' e 'inicio'
    configurarBotonesFinDeJuego(suffix) {
        const btnMenu = document.getElementById(`btnMenu${suffix}`);
        const btnRetry = document.getElementById(`btnRetry${suffix}`);
        const btnPlayAgain = document.getElementById(`btnPlayAgain${suffix}`);
        
        if (btnMenu) {
            btnMenu.addEventListener('click', () => this.irAlMenu());
        }
        
        const retryOrPlayAgain = btnRetry || btnPlayAgain;
        if (retryOrPlayAgain) {
            retryOrPlayAgain.addEventListener('click', () => this.reiniciarJuego());
        }
    }

    //Se activa con el boton de play y llama a los metodos necesarios para iniciar el juego
    iniciarJuego() {
        this.model.reiniciar();
        setTimeout(() => {
            this.view.mostrarPantalla('gameScreen');
            // La vista se actualiza llamando a dibujarTablero
            this.view.dibujarTablero(this.model); 
            
            this.model.iniciarTemporizador((timeRemaining) => {
                // actualizar el timer en el canvas
                this.view.dibujarTablero(this.model); 
                if (timeRemaining === 0) {
                    this.finalizarJuego();
                }
            });
            
            this.actualizarVista();
        }, 600);
    }

    // se activa con el boton "Reiniciar"
    reiniciarJuego() {
        this.model.reiniciar();
        this.view.ocultarHints();
        this.view.mostrarPantalla('gameScreen');
        
        this.model.iniciarTemporizador((timeRemaining) => {
            this.view.dibujarTablero(this.model);
            if (timeRemaining === 0) {
                this.finalizarJuego();
            }
        });
        
        this.actualizarVista();
    }

    // se activa con el btn de Inicio
    irAlMenu() {
        this.model.detenerTemporizador();
        this.model.reiniciar();
        this.view.ocultarHints();
        this.view.mostrarPantalla('gamePreview');
    }

    // metodo cuando se hace clic
    //si se hizo clic en una ficha, procede
    manejarMouseDown(e) {
        if (this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Verificar clic en botones virtuales (barra lateral)
        if (this.verificarClicBarraLateral(x, y)) {
            return; 
        }

        // Si no es un botón, proceder con la lógica del tablero
        const cell = this.model.obtenerCeldaDelTablero(x, y);
        if (!cell) return;
        
        const { row, col } = cell;
        
        if (this.model.seleccionarPieza(row, col)) {
            this.isDragging = true;
            this.dragStartPos = { row, col };
            
            const cellData = this.model.board[row][col];
            this.view.establecerPiezaArrastrada(x, y, cellData.type, row, col);
            this.view.mostrarHints(this.model);
            this.actualizarVista(); 
        }
    }

    //maneja la logica de los clics en la barra lateral
    verificarClicBarraLateral(x, y) {
        const { restart, home } = this.buttonHitboxes;

        // Verificar si el clic está dentro del área general de los botones
        if (x < restart.x || x > restart.x + restart.w) {
            return false;
        }

        // Verifica clic en el botón RESTART
        if (y >= restart.y && y <= restart.y + restart.h) {
            this.reiniciarJuego();
            return true;
        }

        // Verifica clic en el botón HOME
        if (y >= home.y && y <= home.y + home.h) {
            this.irAlMenu();
            return true;
        }

        return false;
    }

    //actualiza la posicion de la ficha y 
    //llama a actualizar vista para que la ficha siga al mouse
    manejarMouseMove(e) {
        if (!this.isDragging || this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.view.draggedPiece) {
            this.view.draggedPiece.x = x;
            this.view.draggedPiece.y = y;
            this.actualizarVista();
        }
    }

    //cuando se suelta el clic, verifica si el movimiento fue valido
    manejarMouseUp(e) {
        if (!this.isDragging || this.model.gameOver) return;
        
        const rect = this.view.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cell = this.model.obtenerCeldaDelTablero(x, y);
        
        if (cell) {
            const { row, col } = cell;
            if (!this.model.moverPieza(row, col)) {
                this.cancelarArrastre();
            }
        } else {
            this.cancelarArrastre();
        }

        this.isDragging = false;
        this.dragStartPos = null;
        this.view.limpiarPiezaArrastrada();
        this.view.ocultarHints();
        this.actualizarVista();

        if (this.model.gameOver) {
            this.finalizarJuego();
        }
    }

    //si el mouse se sale del canvas, la ficha vuelve al lugar de inicio
    manejarMouseLeave(e) {
        if (this.isDragging) {
            this.cancelarArrastre();
            this.isDragging = false;
            this.dragStartPos = null;
            this.view.limpiarPiezaArrastrada();
            this.actualizarVista();
        }
    }

    //resetea el movimiento poniendo la ficha en su lugar
    cancelarArrastre() {
        this.model.selectedPiece = null;
        this.model.validMoves = [];
        this.view.ocultarHints();
    }

    //llama a la vista para que vuelva a dibujar el tablero
    actualizarVista() {
        this.view.dibujarTablero(this.model);
    }

    // se llama cuando el modelo detecta el fin del  juego y le manda a la vista
    //que pantalla mostrar
    finalizarJuego() {
        this.model.gameOver = true;
        this.model.detenerTemporizador();
        
        const status = this.model.obtenerEstadoDelJuego();
        const timeUsed = this.model.obtenerTiempoUsado();
        
        this.view.ocultarHints();
        
        setTimeout(() => {
            if (status === 'victory') {
                this.view.mostrarPantallaVictoria(this.model.piecesRemaining, timeUsed);
            } else if (status === 'timeout') {
                this.view.mostrarPantallaTiempoAgotado(this.model.piecesRemaining);
            } else {
                this.view.mostrarPantallaSinMovimientos(this.model.piecesRemaining, timeUsed);
            }
        }, 500);
    }
}