// controlador.js

/**
 * Clase ControladorJuego: Conecta el Modelo y la Vista, maneja la entrada del usuario.
 */
class ControladorJuego {
    constructor() {
        if (!window.ModeloPegSolitaire || !window.VistaTablero || !window.VistaUI) {
            console.error("Error: Las clases ModeloPegSolitaire, VistaTablero o VistaUI no están definidas. Verifica que los scripts modelo.js y vista.js se hayan cargado antes que controlador.js.");
        }
        
        this.modelo = new ModeloPegSolitaire();
        this.vistaUI = new VistaUI();
        this.vistaTablero = new VistaTablero(this.modelo);

        // Estado visual del arrastre (Controlador lo gestiona para pasarlo a la Vista)
        this.fichaFlotantePos = null;
        this.canvas = document.getElementById('tableroCanvas'); // Referencia al Canvas
    }

    // --- MÉTODOS DE INICIALIZACIÓN Y COORDINACIÓN ---

    async init() {
        this.vistaUI.mostrarMensaje("Cargando recursos...");
        try {
            await this.vistaTablero.cargarImagenes();

            // Inicialización del Modelo
            this.modelo.inicializarTablero();

            // Inicialización del Timer (El Modelo gestiona la lógica, el Controlador pasa los callbacks de la Vista)
            this.modelo.iniciarTimer(
                (tiempo) => this.vistaUI.actualizarUI_Timer(tiempo),
                () => {
                    this.vistaUI.mostrarMensaje("¡Se acabó el tiempo! ⏳", 'error');
                }
            );

            // Inicialización de Eventos (Controlador)
            this.inicializarEventos();

            // Inicialización del Bucle de Renderizado (Vista)
            this.animarFrame();

            this.vistaUI.mostrarMensaje("¡Empieza el juego! Objetivo: 1 ficha.");

        } catch (error) {
            this.vistaUI.mostrarMensaje("Error al cargar imágenes. Verifica las rutas.", 'error');
            console.error(error);
        }
    }

    inicializarEventos() {
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', this.manejarMouseDown);
            this.canvas.addEventListener('mouseup', this.manejarMouseUp);
        }

        const btnReiniciar = document.getElementById('btnReiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', this.reiniciarJuego);
        }
    }

    animarFrame = () => {
        // Pasa la posición de arrastre a la Vista para que dibuje la ficha flotante
        this.vistaTablero.animar(this.fichaFlotantePos);
    }

    // --- UTILIDADES DEL CONTROLADOR ---

    obtenerCeldaPorCoordenadas(clientX, clientY) {
        if (!this.canvas) return null;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left - margen;
        const mouseY = clientY - rect.top - margen;

        const col = Math.floor(mouseX / celda_tamanio);
        const fila = Math.floor(mouseY / celda_tamanio);

        return this.modelo.obtenerCelda(fila, col);
    }

    // --- MANEJADORES DE EVENTOS (Input del Usuario) ---

    manejarMouseDown = (e) => {
        if (this.modelo.juegoTerminado) return;

        const celda = this.obtenerCeldaPorCoordenadas(e.clientX, e.clientY);

        if (celda && celda.estado === 1) {
            // 1. Pide al Modelo que calcule los hints
            const posibles = this.modelo.calcularHints(celda);

            if (posibles > 0) {
                // 2. Almacena la referencia en el Modelo (fichaOrigen)
                this.modelo.fichaArrastrada = celda;

                // 3. Almacena la posición visual en el Controlador (para la animación)
                const rect = this.canvas.getBoundingClientRect();
                this.fichaFlotantePos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                // 4. Inicia el monitoreo del mouse para el arrastre visual
                this.canvas.addEventListener('mousemove', this.manejarMouseMove);

            } else {
                this.vistaUI.mostrarMensaje("Esa ficha no puede moverse.");
            }
        } else {
            // Limpia hints si se hace clic fuera de una ficha movible
            this.modelo.desmarcarHints();
        }
    }

    manejarMouseMove = (e) => {
        if (this.modelo.fichaArrastrada) {
            // Solo actualiza la posición visual del arrastre
            const rect = this.canvas.getBoundingClientRect();
            this.fichaFlotantePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    manejarMouseUp = (e) => {
        if (!this.modelo.fichaArrastrada) return;

        const celdaOrigen = this.modelo.fichaArrastrada;
        const celdaDestino = this.obtenerCeldaPorCoordenadas(e.clientX, e.clientY);
        let movimientoExitoso = false;

        if (celdaDestino && celdaDestino.isDestinoPosible) {
            // 1. Pide al Modelo que ejecute la lógica de movimiento
            movimientoExitoso = this.modelo.ejecutarMovimiento(
                celdaOrigen.fila, celdaOrigen.col,
                celdaDestino.fila, celdaDestino.col
            );

            // 2. El Modelo actualizó su estado y verificó el fin del juego.
            const resultadoJuego = this.modelo.verificarFinJuego();

            if (resultadoJuego.terminado) {
                this.vistaUI.mostrarMensaje(resultadoJuego.mensaje, resultadoJuego.tipo);
            } else if (movimientoExitoso) {
                this.vistaUI.mostrarMensaje(`Movimiento realizado. Quedan ${this.modelo.contarFichas()}.`);
            }
        }

        // 3. Limpieza y fin del arrastre (Modelo y Controlador)
        this.modelo.fichaArrastrada = null;
        this.fichaFlotantePos = null;
        this.modelo.desmarcarHints();
        this.canvas.removeEventListener('mousemove', this.manejarMouseMove);

        if (!movimientoExitoso && !this.modelo.juegoTerminado) {
            this.vistaUI.mostrarMensaje("Movimiento cancelado o inválido.", 'info');
        }
    }

    reiniciarJuego = () => {
        // 1. Actualiza el Modelo
        this.modelo.inicializarTablero();
        this.modelo.reiniciarTimer();

        // 2. Re-inicia el Timer con los callbacks de la Vista
        this.modelo.iniciarTimer(
            (tiempo) => this.vistaUI.actualizarUI_Timer(tiempo),
            () => {
                this.vistaUI.mostrarMensaje("¡Se acabó el tiempo! ⏳", 'error');
            }
        );
        
        // 3. Re-inicia el ciclo de animación
        this.animarFrame();
        this.vistaUI.mostrarMensaje("Juego reiniciado.");
    }
}

// PUNTO DE ENTRADA ÚNICO
window.onload = () => {
    // Las clases Celda, ModeloPegSolitaire, VistaTablero y VistaUI deben estar disponibles aquí.
    if (document.getElementById('tableroCanvas')) {
        new ControladorJuego().init();
    } else {
        console.error("El Canvas no se encontró. Verifica el HTML.");
    }
};