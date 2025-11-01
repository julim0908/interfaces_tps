class Celda {
    constructor(fila, col, estado) {
        this.fila = fila;
        this.col = col;
        this.estado = estado; // -1: No jugable, 0: Vacío, 1: Ficha
        this.isSeleccionada = false;
        this.isDestinoPosible = false;
    }
}

class ModeloPegSolitaire {
    constructor() {
        this.tablero = [];
        this.fichaArrastrada = null; // Referencia a la celda de origen seleccionada
        this.juegoTerminado = false;
        this.tiempoLimiteSegundos = 300; // 5 minutos
        this.tiempoActual = this.tiempoLimiteSegundos;
        this.timerInterval = null;
    }

    // --- MÉTODOS DE INICIALIZACIÓN Y ACCESO ---

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
        const filas = patron_inicial.length;
        const columnas = patron_inicial[0].length;

        this.tablero = [];
        for (let f = 0; f < filas; f++) {
            this.tablero[f] = [];
            for (let c = 0; c < columnas; c++) {
                this.tablero[f][c] = new Celda(f, c, patron_inicial[f][c]);
            }
        }
        this.juegoTerminado = false;
        this.fichaArrastrada = null;
    }

    obtenerCelda(f, c) {
        if (f >= 0 && f < this.tablero.length && c >= 0 && c < this.tablero[0].length) {
            return this.tablero[f][c];
        }
        return null;
    }

    // --- MÉTODOS DE REGLAS DEL JUEGO ---

    esMovimientoValido(f1, c1, f2, c2) {
        const celdaOrigen = this.obtenerCelda(f1, c1);
        const celdaDestino = this.obtenerCelda(f2, c2);

        // 1. Validación de existencia y jugabilidad
        if (!celdaOrigen || !celdaDestino || celdaOrigen.estado === -1 || celdaDestino.estado === -1) {
            return false;
        }

        // 2. Validación de estados (Origen=Ficha, Destino=Vacío)
        if (celdaOrigen.estado !== 1 || celdaDestino.estado !== 0) {
            return false;
        }

        // 3. Validación de distancia (2 casillas de distancia, horizontal o vertical)
        const dF = Math.abs(f1 - f2);
        const dC = Math.abs(c1 - c2);

        if (!((dF === 2 && dC === 0) || (dF === 0 && dC === 2))) {
            return false;
        }

        // 4. Validación de celda intermedia (debe tener una ficha para 'saltar')
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

        // Actualización de estado:
        celdaDestino.estado = 1; // Destino ahora tiene ficha
        celdaOrigen.estado = 0; // Origen ahora está vacío
        celdaIntermedia.estado = 0; // Ficha saltada se elimina

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
        for (const celda of this.tablero.flat()) {
            if (celda.estado === 1) {
                const direcciones = [
                    { df: 2, dc: 0 }, { df: -2, dc: 0 },
                    { df: 0, dc: 2 }, { df: 0, dc: -2 }
                ];
                for (const dir of direcciones) {
                    if (this.esMovimientoValido(celda.fila, celda.col, celda.fila + dir.df, celda.col + dir.dc)) {
                        return true;
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
                return { terminado: true, mensaje: "¡¡VICTORIA!! 🏆 Dejaste una sola ficha.", tipo: 'success' };
            } else {
                return { terminado: true, mensaje: `Juego Terminado. Quedaron ${fichasRestantes} fichas.`, tipo: 'error' };
            }
        }
        return { terminado: false };
    }

    // --- LÓGICA DEL TIMER (como parte del estado del juego) ---

    iniciarTimer(callbackActualizarUI, callbackTiempoAgotado) {
        this.tiempoActual = this.tiempoLimiteSegundos;
        this.pararTimer();
        callbackActualizarUI(this.tiempoActual);

        this.timerInterval = setInterval(() => {
            this.tiempoActual--;
            callbackActualizarUI(this.tiempoActual);

            if (this.tiempoActual <= 0) {
                this.pararTimer();
                if (!this.juegoTerminado) {
                    this.juegoTerminado = true;
                    callbackTiempoAgotado();
                }
            }
        }, 1000);
    }

    pararTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    reiniciarTimer(callbackActualizarUI) {
        this.pararTimer();
        this.tiempoActual = this.tiempoLimiteSegundos;
        // La inicialización del Intervalo la hará el Controlador al llamar a init.
    }
}