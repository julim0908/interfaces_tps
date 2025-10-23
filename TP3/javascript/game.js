// ==================== CLASE NIVEL ====================
class Nivel {
    constructor(numero, nombre, filtro, tiempoLimite) {
        this.numero = numero;
        this.nombre = nombre;
        this.filtro = filtro;
        this.tiempoLimite = tiempoLimite;
    }
}

// ==================== CLASE PIEZA ====================
class Pieza {
    constructor(id, col, row, canvas) {
        this.id = id;
        this.col = col;
        this.row = row;
        this.rotacion = Math.floor(Math.random() * 4) * 90;
        this.rotacionCorrecta = 0;
        this.canvas = canvas;
        this.estaFija = false;
    }

    rotar(direccion) {
        if (this.estaFija) return false;

        if (direccion === 'derecha') {
            this.rotacion = (this.rotacion + 90) % 360;
        } else {
            this.rotacion = (this.rotacion - 90 + 360) % 360;
        }
        return true;
    }

    fijar() {
        this.rotacion = this.rotacionCorrecta;
        this.estaFija = true;
    }

    estaCorrecta() {
        return this.rotacion === this.rotacionCorrecta;
    }
}

// ==================== CLASE FILTRO ====================
class Filtro {
    static aplicarGrisEscala(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
        return imageData;
    }

    static aplicarBrillo(imageData) {
        const data = imageData.data;
        const factor = 0.3;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * (1 + factor));
            data[i + 1] = Math.min(255, data[i + 1] * (1 + factor));
            data[i + 2] = Math.min(255, data[i + 2] * (1 + factor));
        }
        return imageData;
    }

    static aplicarInvertir(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        return imageData;
    }

    static aplicar(ctx, imageData, tipo, indice = 0) {
        switch(tipo) {
            case 'grayscale':
                return this.aplicarGrisEscala(imageData);
            case 'brightness':
                return this.aplicarBrillo(imageData);
            case 'invert':
                return this.aplicarInvertir(imageData);
            case 'mixed':
                const filtros = ['grayscale', 'brightness', 'invert', 'none'];
                const filtroSeleccionado = filtros[indice % filtros.length];
                if (filtroSeleccionado !== 'none') {
                    return this.aplicar(ctx, imageData, filtroSeleccionado, indice);
                }
                break;
        }
        return imageData;
    }
}

// ==================== CLASE TEMPORIZADOR ====================
class Temporizador {
    constructor() {
        this.segundos = 0;
        this.intervalo = null;
        this.limiteSegundos = null;
        this.enEjecucion = false;
    }

    iniciar(callback, limiteSegundos = null) {
        this.segundos = 0;
        this.limiteSegundos = limiteSegundos;
        this.detener();
        this.enEjecucion = true;

        this.intervalo = setInterval(() => {
            this.segundos++;
            callback(this.segundos);

            if (this.limiteSegundos && this.segundos >= this.limiteSegundos) {
                this.detener();
            }
        }, 1000);
    }

    detener() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
            this.enEjecucion = false;
        }
    }

    agregarSegundos(cantidad) {
        this.segundos += cantidad;
    }

    obtenerTiempo() {
        return this.segundos;
    }

    static formatear(segundos) {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ==================== CLASE CARGADOR DE IMAGENES ====================
class CargadorImagenes {
    constructor(rutas) {
        this.rutas = rutas;
        this.imagenes = [];
    }

    cargar(callback) {
        let cargadas = 0;
        this.rutas.forEach((ruta, index) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.imagenes[index] = img;
                cargadas++;
                if (cargadas === this.rutas.length) {
                    callback(this.imagenes);
                }
            };
            
            img.onerror = () => {
                console.error(`Error al cargar imagen: ${ruta}`);
                cargadas++;
            };
            
            img.src = ruta;
        });
    }

    obtenerImagenAleatoria() {
        const indice = Math.floor(Math.random() * this.imagenes.length);
        return { imagen: this.imagenes[indice], indice: indice };
    }

    obtenerImagen(indice) {
        return this.imagenes[indice];
    }

    obtenerTodas() {
        return this.imagenes;
    }
}

// ==================== CLASE PUZZLE ====================
class Puzzle {
    constructor(imagen, tamanoGrilla, filtro) {
        this.imagen = imagen;
        this.tamanoGrilla = tamanoGrilla;
        this.filtro = filtro;
        this.piezas = [];
        this.columnas = tamanoGrilla === 4 ? 2 : tamanoGrilla === 6 ? 3 : 4;
        this.filas = tamanoGrilla / this.columnas;
        this.anchoPieza = imagen.width / this.columnas;
        this.altoPieza = imagen.height / this.filas;
        this.ayudaUsada = false;
    }

    generar() {
        this.piezas = [];
        for (let i = 0; i < this.tamanoGrilla; i++) {
            const col = i % this.columnas;
            const row = Math.floor(i / this.columnas);

            const canvasPieza = document.createElement('canvas');
            canvasPieza.width = this.anchoPieza;
            canvasPieza.height = this.altoPieza;
            const ctx = canvasPieza.getContext('2d');

            ctx.drawImage(
                this.imagen,
                col * this.anchoPieza, row * this.altoPieza,
                this.anchoPieza, this.altoPieza,
                0, 0,
                this.anchoPieza, this.altoPieza
            );

            let imageData = ctx.getImageData(0, 0, this.anchoPieza, this.altoPieza);
            imageData = Filtro.aplicar(ctx, imageData, this.filtro, i);
            ctx.putImageData(imageData, 0, 0);

            const pieza = new Pieza(i, col, row, canvasPieza);
            this.piezas.push(pieza);
        }
    }

    obtenerPiezaEnPosicion(x, y, tamanoMaximo, padding) {
        const tamanoPieza = Math.floor((tamanoMaximo - (this.columnas + 1) * padding) / this.columnas);
        for (let pieza of this.piezas) {
            const px = pieza.col * tamanoPieza + (pieza.col + 1) * padding;
            const py = pieza.row * tamanoPieza + (pieza.row + 1) * padding;
            if (x >= px && x <= px + tamanoPieza && y >= py && y <= py + tamanoPieza) {
                return pieza;
            }
        }
        return null;
    }

    usarAyuda() {
        if (this.ayudaUsada) return false;
        const piezasNoFijas = this.piezas.filter(p => !p.estaFija && !p.estaCorrecta());
        if (piezasNoFijas.length > 0) {
            const piezaAleatoria = piezasNoFijas[Math.floor(Math.random() * piezasNoFijas.length)];
            piezaAleatoria.fijar();
            this.ayudaUsada = true;
            return true;
        }
        return false;
    }

    estaCompleto() {
        return this.piezas.every(pieza => pieza.estaCorrecta());
    }
}

// ==================== CLASE RENDERIZADOR CANVAS ====================
class RenderizadorCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    limpiar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    establecerDimensiones(ancho, alto) {
        this.canvas.width = ancho;
        this.canvas.height = alto;
    }

    dibujarImagen(imagen, x, y, ancho, alto) {
        this.ctx.drawImage(imagen, x, y, ancho, alto);
    }

    dibujarImagenRotada(imagen, x, y, ancho, alto, rotacion) {
        this.ctx.save();
        this.ctx.translate(x + ancho / 2, y + alto / 2);
        this.ctx.rotate((rotacion * Math.PI) / 180);
        this.ctx.drawImage(imagen, -ancho / 2, -alto / 2, ancho, alto);
        this.ctx.restore();
    }
    
    dibujarRectangulo(x, y, ancho, alto, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, ancho, alto);
    }

    dibujarBorde(x, y, ancho, alto, color, grosor) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = grosor;
        this.ctx.strokeRect(x, y, ancho, alto);
    }

    establecerSombra(color, difuminado, offsetX, offsetY) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = difuminado;
        this.ctx.shadowOffsetX = offsetX;
        this.ctx.shadowOffsetY = offsetY;
    }
    
    limpiarSombra() {
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    establecerOpacidad(opacidad) {
        this.ctx.globalAlpha = opacidad;
    }
}

// ==================== CLASE JUEGO BLOCKA ====================
class JuegoBlocka {
    constructor() {
        this.rutasImagenes = [
            '/img/messi.jpg', '/img/r9.jpg', '/img/cr7.jpg',
            '/img/msn.jpg', '/img/suarez.jpg', '/img/maradona.jpg',
            '/img/messironaldinho.jpg', '/img/ney.jpg'
        ];

        this.niveles = [
            new Nivel(1, 'Nivel 1: Escala de Grises', 'grayscale', null),
            new Nivel(2, 'Nivel 2: Brillo', 'brightness', null),
            new Nivel(3, 'Nivel 3: Negativo (60s)', 'invert', 60),
            new Nivel(4, 'Nivel 4: Mixto (30s)', 'mixed', 30)
        ];

        this.nivelActual = 0;
        this.tamanoGrilla = 4;
        this.pantallaActual = 'menu';
        this.imagenSeleccionada = null;
        this.indiceImagenSeleccionada = -1;

        this.cargadorImagenes = new CargadorImagenes(this.rutasImagenes);
        this.temporizador = new Temporizador();
        this.puzzle = null;

        this.elementos = this.obtenerElementosDOM();
        this.renderizadores = this.crearRenderizadores();
    }

    obtenerElementosDOM() {
        return {
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
    }

    crearRenderizadores() {
        return {
            menu: new RenderizadorCanvas(document.getElementById('menuCanvas')),
            animacion: new RenderizadorCanvas(document.getElementById('animationCanvas')),
            juego: new RenderizadorCanvas(document.getElementById('gameCanvas')),
            completado: new RenderizadorCanvas(document.getElementById('completedCanvas'))
        };
    }

    iniciar() {
        this.configurarEventListeners();
        this.cargadorImagenes.cargar(() => {
            this.dibujarGaleriaMenu();
        });
    }

    configurarEventListeners() {
        this.elementos.btnStart.addEventListener('click', () => this.iniciarJuego());
        this.elementos.btnHome.addEventListener('click', () => this.irAlMenu());
        this.elementos.btnHelp.addEventListener('click', () => this.usarAyuda());
        this.elementos.btnMenuCompleted.addEventListener('click', () => this.irAlMenu());
        this.elementos.btnNextLevel.addEventListener('click', () => this.siguienteNivel());
        
        this.elementos.gridSizeSelect.addEventListener('change', (e) => {
            this.tamanoGrilla = parseInt(e.target.value);
        });
        
        this.renderizadores.juego.canvas.addEventListener('click', (e) => this.manejarClick(e));
        this.renderizadores.juego.canvas.addEventListener('contextmenu', (e) => this.manejarClickDerecho(e));
    }

    dibujarGaleriaMenu() {
        const cols = 4;
        const rows = 2;
        const padding = 10;
        const imgSize = 250;
        const renderer = this.renderizadores.menu;

        renderer.establecerDimensiones(
            cols * imgSize + (cols + 1) * padding,
            rows * imgSize + (rows + 1) * padding
        );
        renderer.limpiar();

        this.cargadorImagenes.obtenerTodas().forEach((img, index) => {
            if (!img) return;
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * imgSize + (col + 1) * padding;
            const y = row * imgSize + (row + 1) * padding;

            renderer.establecerSombra('rgba(0, 0, 0, 0.3)', 10, 0, 5);
            renderer.dibujarImagen(img, x, y, imgSize, imgSize);
            renderer.limpiarSombra();
        });
    }

    mostrarPantalla(nombre) {
        this.elementos.menuScreen.classList.add('hidden');
        this.elementos.gameScreen.classList.add('hidden');
        this.elementos.completedScreen.classList.add('hidden');

        if (nombre === 'menu') {
            this.elementos.menuScreen.classList.remove('hidden');
        } else if (nombre === 'juego') {
            this.elementos.gameScreen.classList.remove('hidden');
        } else if (nombre === 'completado') {
            this.elementos.completedScreen.classList.remove('hidden');
        }
        this.pantallaActual = nombre;
    }

    irAlMenu() {
        this.temporizador.detener();
        this.nivelActual = 0;
        this.imagenSeleccionada = null;
        this.puzzle = null;
        this.mostrarPantalla('menu');
    }

    iniciarJuego() {
        this.nivelActual = 0;
        this.mostrarAnimacionSeleccion();
    }

    siguienteNivel() {
        if (this.nivelActual < this.niveles.length - 1) {
            this.nivelActual++;
            this.mostrarAnimacionSeleccion();
        } else {
            this.irAlMenu();
        }
    }

    mostrarAnimacionSeleccion() {
        const { imagen, indice } = this.cargadorImagenes.obtenerImagenAleatoria();
        this.imagenSeleccionada = imagen;
        this.indiceImagenSeleccionada = indice;

        this.elementos.imageAnimation.classList.remove('hidden');
        this.dibujarGaleriaAnimacion(false);

        setTimeout(() => this.dibujarGaleriaAnimacion(true), 500);
        setTimeout(() => {
            this.elementos.imageAnimation.classList.add('hidden');
            this.inicializarNivel();
        }, 2000);
    }

    dibujarGaleriaAnimacion(resaltar) {
        const cols = 4;
        const rows = 2;
        const imgSize = 80;
        const padding = 8;
        const renderer = this.renderizadores.animacion;
        
        renderer.establecerDimensiones(
            cols * imgSize + (cols + 1) * padding,
            rows * imgSize + (rows + 1) * padding
        );
        renderer.limpiar();

        this.cargadorImagenes.obtenerTodas().forEach((img, index) => {
            if (!img) return;
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * imgSize + (col + 1) * padding;
            const y = row * imgSize + (row + 1) * padding;
            const esSeleccionada = index === this.indiceImagenSeleccionada;

            if (resaltar && esSeleccionada) {
                renderer.dibujarBorde(x - 2, y - 2, imgSize + 4, imgSize + 4, '#9D4EDD', 4);
                renderer.establecerOpacidad(1);
            } else {
                renderer.establecerOpacidad(resaltar ? 0.5 : 0.8);
            }
            renderer.dibujarImagen(img, x, y, imgSize, imgSize);
            renderer.establecerOpacidad(1);
        });
    }

    inicializarNivel() {
        if (!this.imagenSeleccionada) {
            console.error('No hay imagen seleccionada');
            return;
        }

        const nivel = this.niveles[this.nivelActual];
        this.puzzle = new Puzzle(this.imagenSeleccionada, this.tamanoGrilla, nivel.filtro);
        this.puzzle.generar();

        this.actualizarInfoNivel();
        this.mostrarPantalla('juego');
        this.dibujarPuzzle();

        const onTick = (segundos) => {
            this.elementos.timer.textContent = Temporizador.formatear(segundos);
            if (nivel.tiempoLimite && segundos >= nivel.tiempoLimite) {
                alert('¡Tiempo agotado! Intenta nuevamente.');
                this.irAlMenu();
            }
        };

        this.temporizador.iniciar(onTick, nivel.tiempoLimite);
    }

    dibujarPuzzle() {
        const padding = 10;
        const maxSize = 600;
        const cols = this.puzzle.columnas;
        const rows = this.puzzle.filas;
        const tamanoPieza = Math.floor((maxSize - (cols + 1) * padding) / cols);
        const renderer = this.renderizadores.juego;

        renderer.establecerDimensiones(
            cols * tamanoPieza + (cols + 1) * padding,
            rows * tamanoPieza + (rows + 1) * padding
        );
        renderer.limpiar();
        renderer.dibujarRectangulo(0, 0, renderer.canvas.width, renderer.canvas.height, 'rgba(31, 41, 55, 0.3)');

        this.puzzle.piezas.forEach((pieza) => {
            const x = pieza.col * tamanoPieza + (pieza.col + 1) * padding;
            const y = pieza.row * tamanoPieza + (pieza.row + 1) * padding;

            renderer.dibujarImagenRotada(pieza.canvas, x, y, tamanoPieza, tamanoPieza, pieza.rotacion);
            const colorBorde = pieza.estaFija ? '#32CD32' : 'rgba(255, 255, 255, 0.3)';
            const grosorBorde = pieza.estaFija ? 4 : 2;
            renderer.dibujarBorde(x, y, tamanoPieza, tamanoPieza, colorBorde, grosorBorde);
        });
    }

    manejarClick(e) {
        const pieza = this.puzzle.obtenerPiezaEnPosicion(e.offsetX, e.offsetY, 600, 10);
        if (pieza && pieza.rotar('izquierda')) {
            this.dibujarPuzzle();
            this.verificarVictoria();
        }
    }

    manejarClickDerecho(e) {
        e.preventDefault();
        const pieza = this.puzzle.obtenerPiezaEnPosicion(e.offsetX, e.offsetY, 600, 10);
        if (pieza && pieza.rotar('derecha')) {
            this.dibujarPuzzle();
            this.verificarVictoria();
        }
    }

    usarAyuda() {
        if (this.puzzle && this.puzzle.usarAyuda()) {
            this.temporizador.agregarSegundos(5);
            this.elementos.btnHelp.disabled = true;
            this.elementos.btnHelp.textContent = 'Ayuda usada';
            this.dibujarPuzzle();
            this.verificarVictoria();
        }
    }

    verificarVictoria() {
        if (this.puzzle.estaCompleto()) {
            this.temporizador.detener();
            this.mostrarPantallaCompletado();
        }
    }

    mostrarPantallaCompletado() {
        const tiempo = this.temporizador.obtenerTiempo();
        this.elementos.completedTime.textContent = `Tiempo: ${Temporizador.formatear(tiempo)}`;
        const renderer = this.renderizadores.completado;

        renderer.establecerDimensiones(400, 400);
        renderer.dibujarImagen(this.imagenSeleccionada, 0, 0, 400, 400);

        this.elementos.btnNextLevel.style.display = this.nivelActual < this.niveles.length - 1 ? 'flex' : 'none';
        this.mostrarPantalla('completado');
    }

    actualizarInfoNivel() {
        const nivel = this.niveles[this.nivelActual];
        this.elementos.levelName.textContent = nivel.nombre;
        this.elementos.timeLimit.textContent = nivel.tiempoLimite ? `/ ${Temporizador.formatear(nivel.tiempoLimite)}` : '';
        this.elementos.btnHelp.disabled = false;
        this.elementos.btnHelp.textContent = 'Ayudita (+5s)';
    }
}

// ==================== INICIALIZAR JUEGO ====================
window.addEventListener('DOMContentLoaded', () => {
    const juego = new JuegoBlocka();
    juego.iniciar();
});