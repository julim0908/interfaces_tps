const canvas = document.getElementById('tableroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const celda_tamanio = 70;
const margen = 15;
const color_hint = 'rgba(0, 255, 0, 0.7)';

const imagen_ficha = new Image();
imagen_ficha.src = '/TP4/img/pelotaPeg.png';
const imagen_ficha_vacia = new Image();
imagen_ficha_vacia.src = '/TP4/img/pelotaVacia.png';
const imagen_fondo_juego = new Image();
imagen_fondo_juego.src = '/TP4/img/fondoPeg.jpg';


/**
 * Clase VistaTablero: Responsable de dibujar el estado del Modelo en el Canvas.
 */
class VistaTablero {
    constructor(modelo) {
        this.modelo = modelo;
    }

    // UTILIDAD: Conversión de coordenadas lógicas a Canvas
    obtenerPosicionCanvas(celda) {
        const x = margen + celda.col * celda_tamanio;
        const y = margen + celda.fila * celda_tamanio;
        return { x, y };
    }

    // --- MÉTODOS DE DIBUJO ---

    dibujarTablero(fichaFlotantePos) {
        if (!ctx) return;
        
        // 1. DIBUJAR IMAGEN DE FONDO
        ctx.drawImage(imagen_fondo_juego, 0, 0, canvas.width, canvas.height);

        this.modelo.tablero.flat().forEach(celda => {
            if (celda.estado === -1) return;

            const { x, y } = this.obtenerPosicionCanvas(celda);

            // 2. Dibuja el hueco (el agujero)
            ctx.drawImage(imagen_ficha_vacia, x, y, celda_tamanio, celda_tamanio);

            // 3. Dibuja la ficha si existe Y NO es la que está siendo arrastrada
            const esFichaArrastrada = (this.modelo.fichaArrastrada && this.modelo.fichaArrastrada.fila === celda.fila && this.modelo.fichaArrastrada.col === celda.col);

            if (celda.estado === 1 && !esFichaArrastrada) {
                ctx.drawImage(imagen_ficha, x, y, celda_tamanio, celda_tamanio);
            }

            // 4. Dibuja HINTS ANIMADOS
            if (celda.isDestinoPosible) {
                const parpadeo = Math.sin(Date.now() / 300) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(0, 150, 0, 0.6)`;

                ctx.beginPath();
                ctx.arc(x + celda_tamanio / 2, y + celda_tamanio / 2, celda_tamanio / 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        // 5. Dibuja la ficha flotante (copia visual)
        this.dibujarFichaFlotante(fichaFlotantePos);
    }

    dibujarFichaFlotante(fichaFlotantePos) {
        if (!fichaFlotantePos || !ctx) return;

        // Dibuja la ficha arrastrada en la posición del mouse (centrada)
        ctx.drawImage(
            imagen_ficha,
            fichaFlotantePos.x - celda_tamanio / 2,
            fichaFlotantePos.y - celda_tamanio / 2,
            celda_tamanio,
            celda_tamanio
        );
    }

    // El loop de animación
    animar = (fichaFlotantePos) => {
        this.dibujarTablero(fichaFlotantePos);

        if (!this.modelo.juegoTerminado) {
            requestAnimationFrame(() => this.animar(fichaFlotantePos));
        }
    }

    // Método para cargar imágenes (coordinado por el Controlador)
    cargarImagenes() {
        const promesasCarga = [];
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
}


/**
 * Clase VistaUI: Responsable de actualizar elementos HTML fuera del Canvas.
 */
class VistaUI {

    mostrarMensaje(texto, tipo = 'info') {
        const mensajeDiv = document.getElementById('mensajeJuego');
        if (mensajeDiv) {
            mensajeDiv.textContent = texto;
            mensajeDiv.className = tipo;
        }
    }

    actualizarUI_Timer(tiempoActual) {
        const tiempoDiv = document.getElementById('tiempoRestante');
        if (tiempoDiv) {
            const minutos = Math.floor(tiempoActual / 60);
            const segundos = tiempoActual % 60;
            tiempoDiv.textContent =
                `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }
}