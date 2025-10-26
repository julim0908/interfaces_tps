//clase especifica para comprender una ficha
class Celda {
    constructor(fila, col, estado) {
        this.fila = fila;
        this.col = col;
        this.estado = estado; 
        this.isSeleccionada = false;
        this.isDestinoPosible = false;
    }
//El método convierte las coordenadas lógicas del tablero (ej: Fila 3, 
// Columna 4) en coordenadas físicas del monitor, que es lo que el Canvas necesita para dibujar imágenes o formas.
    obtenerPosicionCanvas(celda_tamanio, margen) {
        const x = margen + this.col * celda_tamanio;
        const y = margen + this.fila * celda_tamanio;
        return { x, y };
        //retorna una coordenada de la pantalla
    }
}

//Declaramos constantes que vamos a utilizar en el juego
const canvas = document.getElementById('tableroCanvas');
const ctx = canvas.getContext('2d');
const celda_tamanio = 70; 
const margen = 15; 
const filas = 7;
const columnas = 7;

// Rutas de Imágenes
//
const imagen_ficha = new Image();
imagen_ficha.src = 'img/pelotaPeg.png'; 
const imagen_ficha_vacia = new Image();
imagen_ficha_vacia.src = 'img/pelotaVacia.png';
const imagen_fondo_juego = new Image(); // Nueva imagen de fondo
imagen_fondo_juego.src = 'img/fondoPeg.jpg'; 

// Estilos
const color_hint = 'rgba(0, 255, 0, 0.7)'; 
const color_tablero = '#654321'; // Se mantiene, aunque ya no se usa para el fondo principal

//clase principal para el juego general
class PegSolitaire {
    constructor() {
        //crea una instancia 
        this.tablero = []; 
        this.fichaArrastrada = null;
        this.fichaFlotantePos = null;
        this.juegoTerminado = false;

        this.tiempoLimiteSegundos = 300;
        this.timerInterval = null;
        
        if (ctx) {
            this.init();
        } else {
            console.error("Error: El elemento 'tableroCanvas' no fue encontrado o el contexto 2D es inaccesible.");
        }
    }

    async init() {
        this.mostrarMensaje("Cargando recursos...");
        try {
            await this.cargarImagenes();
            
            this.inicializarTablero();
            this.inicializarEventos();
            this.iniciarTimer();
            this.animar();
            this.mostrarMensaje("¡Empieza el juego! Objetivo: 1 ficha.");
        } catch (error) {
            this.mostrarMensaje("Error al cargar imágenes. Verifica las rutas.", 'error');
            console.error(error);
        }
    }

    cargarImagenes() {
        const promesasCarga = [];
        // Se incluyen todas las imágenes en la carga asíncrona
        const imagenes = [imagen_ficha, imagen_ficha_vacia, imagen_fondo_juego];

        const crearPromesaCarga = (img) => {
            if (img.complete && img.naturalHeight !== 0) {
                return Promise.resolve();
            }
            
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(`Fallo al cargar la imagen: ${img.src}`);
            });
        };

        imagenes.forEach(img => {
            promesasCarga.push(crearPromesaCarga(img));
        });

        return Promise.all(promesasCarga);
    }
    
    inicializarTablero() {
        const patron_inicial = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1], 
            [1, 1, 1, 1, 1, 1, 1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        this.tablero = [];
        for (let f = 0; f < filas; f++) {
            this.tablero[f] = [];
            for (let c = 0; c < columnas; c++) {
                this.tablero[f][c] = new Celda(f, c, patron_inicial[f][c]);
            }
        }
        this.juegoTerminado = false;
        this.fichaArrastrada = null;
        this.fichaFlotantePos = null;
    }
    
    obtenerCelda(f, c) {
        if (f >= 0 && f < filas && c >= 0 && c < columnas) {
            return this.tablero[f][c];
        }
        return null;
    }

    esMovimientoValido(f1, c1, f2, c2) {
        const celdaOrigen = this.obtenerCelda(f1, c1);
        const celdaDestino = this.obtenerCelda(f2, c2);

        if (!celdaOrigen || !celdaDestino || celdaOrigen.estado === -1 || celdaDestino.estado === -1) {
            return false;
        }

        if (celdaOrigen.estado !== 1 || celdaDestino.estado !== 0) {
            return false;
        }

        const dF = Math.abs(f1 - f2);
        const dC = Math.abs(c1 - c2);
        
        if (!((dF === 2 && dC === 0) || (dF === 0 && dC === 2))) {
            return false;
        }

        const fm = (f1 + f2) / 2;
        const cm = (c1 + c2) / 2;
        const celdaIntermedia = this.obtenerCelda(fm, cm);

        if (!celdaIntermedia || celdaIntermedia.estado !== 1) {
            return false;
        }

        return true;
    }

    ejecutarMovimiento(f1, c1, f2, c2) {
        if (!this.esMovimientoValido(f1, c1, f2, c2)) {
            return false;
        }

        const celdaOrigen = this.obtenerCelda(f1, c1);
        const celdaDestino = this.obtenerCelda(f2, c2);
        const fm = (f1 + f2) / 2;
        const cm = (c1 + c2) / 2;
        const celdaIntermedia = this.obtenerCelda(fm, cm);
        
        celdaDestino.estado = 1; 
        celdaOrigen.estado = 0; 
        celdaIntermedia.estado = 0; 
        
        this.desmarcarHints();
        this.verificarFinJuego();
        return true;
    }

    calcularHints(ficha) {
        this.desmarcarHints(); 

        const direcciones = [
            { df: 2, dc: 0 }, { df: -2, dc: 0 },
            { df: 0, dc: 2 }, { df: 0, dc: -2 } 
        ];

        let posiblesDestinosEncontrados = 0;
        
        for (const dir of direcciones) {
            const nf = ficha.fila + dir.df;
            const nc = ficha.col + dir.dc;
            
            if (this.esMovimientoValido(ficha.fila, ficha.col, nf, nc)) {
                this.obtenerCelda(nf, nc).isDestinoPosible = true;
                posiblesDestinosEncontrados++;
            }
        }
        return posiblesDestinosEncontrados;
    }

    desmarcarHints() {
        this.tablero.flat().forEach(celda => {
            celda.isSeleccionada = false;
            celda.isDestinoPosible = false;
        });
    }

    contarFichas() {
        return this.tablero.flat().filter(c => c.estado === 1).length;
    }

    existenMovimientos() {
        for (let f = 0; f < filas; f++) {
            for (let c = 0; c < columnas; c++) {
                const celda = this.obtenerCelda(f, c);
                if (celda && celda.estado === 1) { 
                    const direcciones = [
                        { df: 2, dc: 0 }, { df: -2, dc: 0 },
                        { df: 0, dc: 2 }, { df: 0, dc: -2 } 
                    ];
                    
                    for (const dir of direcciones) {
                        if (this.esMovimientoValido(f, c, f + dir.df, c + dir.dc)) {
                            return true; 
                        }
                    }
                }
            }
        }
        return false;
    }

    verificarFinJuego() {
        if (!this.existenMovimientos()) {
            this.juegoTerminado = true;
            this.pararTimer();
            const fichasRestantes = this.contarFichas();
            
            if (fichasRestantes === 1) {
                this.mostrarMensaje("¡¡VICTORIA!! 🏆 Dejaste una sola ficha.", 'success');
            } else {
                this.mostrarMensaje(`Juego Terminado. Quedaron ${fichasRestantes} fichas.`, 'error');
            }
            return true;
        }
        return false;
    }
    
    dibujarTablero() {
        // 1. DIBUJAR IMAGEN DE FONDO
        ctx.drawImage(imagen_fondo_juego, 0, 0, canvas.width, canvas.height);

        this.tablero.flat().forEach(celda => {
            if (celda.estado === -1) return;

            const { x, y } = celda.obtenerPosicionCanvas(celda_tamanio, margen); 

            // 2. Dibuja el hueco (el agujero)
            ctx.drawImage(imagen_ficha_vacia, x, y, celda_tamanio, celda_tamanio); 

            // 3. Dibuja la ficha si existe (permanece en su lugar durante el arrastre)
            if (celda.estado === 1) { 
                ctx.drawImage(imagen_ficha, x, y, celda_tamanio, celda_tamanio);
            }
            
            // 4. Dibuja HINTS ANIMADOS
            if (celda.isDestinoPosible) {
                const parpadeo = Math.sin(Date.now() / 300) * 0.5 + 0.5; 
                ctx.fillStyle = `rgba(0, 255, 0, ${0.4 + parpadeo * 0.4})`; 
                
                ctx.beginPath();
                ctx.arc(x + celda_tamanio / 2, y + celda_tamanio / 2, celda_tamanio / 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        // 5. Dibuja la ficha flotante (copia visual)
        this.dibujarFichaFlotante();
    }

    dibujarFichaFlotante() {
        if (!this.fichaFlotantePos) return;

        // Dibuja la ficha arrastrada en la posición del mouse (centrada)
        ctx.drawImage(
            imagen_ficha, 
            this.fichaFlotantePos.x - celda_tamanio / 2, 
            this.fichaFlotantePos.y - celda_tamanio / 2, 
            celda_tamanio, 
            celda_tamanio
        );
    }
    
    animar = (e) => {
        this.dibujarTablero();
        
        if (!this.juegoTerminado) {
            requestAnimationFrame(this.animar);
        }
    }

    obtenerCeldaPorCoordenadas(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left - margen;
        const mouseY = clientY - rect.top - margen;
        
        const col = Math.floor(mouseX / celda_tamanio);
        const fila = Math.floor(mouseY / celda_tamanio);

        return this.obtenerCelda(fila, col);
    }

    manejarMouseDown = (e) => {
        if (this.juegoTerminado) return;
        
        const celda = this.obtenerCeldaPorCoordenadas(e.clientX, e.clientY);
        
        if (celda && celda.estado === 1) {
            const posibles = this.calcularHints(celda);
            if (posibles > 0) {
                this.fichaArrastrada = celda;
                
                // Posición de la copia visual (centrada en el clic)
                const rect = canvas.getBoundingClientRect();
                this.fichaFlotantePos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                // Inicia el monitoreo del mouse para el arrastre "orgánico"
                canvas.addEventListener('mousemove', this.manejarMouseMove);
            } else {
                this.mostrarMensaje("Esa ficha no puede moverse.");
            }
        } else {
            this.desmarcarHints();
        }
    }
    
    manejarMouseMove = (e) => {
        if (this.fichaArrastrada) {
            // Solo actualizamos la posición de la copia visual
            const rect = canvas.getBoundingClientRect();
            this.fichaFlotantePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    manejarMouseUp = (e) => {
        if (!this.fichaArrastrada) return;
        
        const celdaOrigen = this.fichaArrastrada;
        const celdaDestino = this.obtenerCeldaPorCoordenadas(e.clientX, e.clientY);
        let movimientoExitoso = false;

        if (celdaDestino && celdaDestino.isDestinoPosible) {
            movimientoExitoso = this.ejecutarMovimiento(
                celdaOrigen.fila, celdaOrigen.col, 
                celdaDestino.fila, celdaDestino.col
            );
        }
        
        // Limpieza y fin del arrastre
        this.fichaArrastrada = null;
        this.fichaFlotantePos = null;
        this.desmarcarHints();
        canvas.removeEventListener('mousemove', this.manejarMouseMove);
        this.dibujarTablero(); // Redibuja el estado final

        if (movimientoExitoso) {
            this.mostrarMensaje(`Movimiento realizado. Quedan ${this.contarFichas()}.`);
        } else if (!this.juegoTerminado) {
             this.mostrarMensaje("Movimiento cancelado o inválido.", 'info');
        }
    }

    reiniciarJuego = () => {
        this.inicializarTablero();
        this.reiniciarTimer();
        this.animar();
        this.mostrarMensaje("Juego reiniciado.");
    }

    inicializarEventos() {
        canvas.addEventListener('mousedown', this.manejarMouseDown);
        canvas.addEventListener('mouseup', this.manejarMouseUp);
        
        const btnReiniciar = document.getElementById('btnReiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', this.reiniciarJuego);
        }
    }
    
    mostrarMensaje(texto, tipo = 'info') {
        const mensajeDiv = document.getElementById('mensajeJuego');
        if (mensajeDiv) {
            mensajeDiv.textContent = texto;
            mensajeDiv.className = tipo;
        }
    }

    iniciarTimer() {
        this.tiempoActual = this.tiempoLimiteSegundos;
        this.actualizarUI_Timer();
        this.pararTimer(); 
        this.timerInterval = setInterval(() => {
            this.tiempoActual--;
            this.actualizarUI_Timer();
            if (this.tiempoActual <= 0) {
                this.pararTimer();
                if (!this.juegoTerminado) {
                     this.juegoTerminado = true;
                     this.mostrarMensaje("¡Se acabó el tiempo! ⏳", 'error');
                }
            }
        }, 1000);
    }
    
    pararTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
    
    reiniciarTimer() {
        this.pararTimer();
        this.iniciarTimer();
    }

    actualizarUI_Timer() {
        const tiempoDiv = document.getElementById('tiempoRestante');
        if (tiempoDiv) {
            const minutos = Math.floor(this.tiempoActual / 60);
            const segundos = this.tiempoActual % 60;
            tiempoDiv.textContent = 
                `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }
}

// INICIAR EL JUEGO
window.onload = () => {
    new PegSolitaire();
};