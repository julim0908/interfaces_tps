class FullscreenHandler {
    constructor() {
        // el elemento que pediremos al navegador que maximice (el contenedor del juego)
        this.targetElement = document.querySelector('.game-full');
        // el botón que activa la funcionalidad
        this.button = document.getElementById('fullscreenButton');
        this.fullscreenIcon = this.button ? this.button.querySelector('.icon-fullscreen') : null;
        this.classToToggle = 'fullscreen-mode';

        if (!this.targetElement || !this.button) {
            console.error("FullscreenHandler: Elementos '.game-full' o 'fullscreenButton' no encontrados.");
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.button.addEventListener('click', this.toggleFullscreen.bind(this));
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    }

    toggleFullscreen() {
        // toggle la clase CSS en el body para aplicar los estilos de fondo negro y centrado
        const isFullscreen = document.body.classList.contains(this.classToToggle);
        
        if (!isFullscreen) {
            document.body.classList.add(this.classToToggle);
            if (this.targetElement.requestFullscreen) {
                this.targetElement.requestFullscreen();
            } else if (this.targetElement.webkitRequestFullscreen) { // Safari
                this.targetElement.webkitRequestFullscreen();
            }

            // cambia el ícono a salir de pantalla completa
            if (this.fullscreenIcon) {
                this.fullscreenIcon.src = './img/salir-de-pantalla-completa.png'; 
            }
        } else {
            // salir de pantalla completa
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    handleFullscreenChange() {
        const isCurrentlyFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

        if (!isCurrentlyFullscreen && document.body.classList.contains(this.classToToggle)) {
            document.body.classList.remove(this.classToToggle);
            // mostrar icono de ENTRAR
            if (this.fullscreenIcon) {
                this.fullscreenIcon.src = './img/pantalla-completa (1).png'; // ⬅️ Correcto
            }
        } 

        else if (isCurrentlyFullscreen && !document.body.classList.contains(this.classToToggle)) {
             document.body.classList.add(this.classToToggle)
             if (this.fullscreenIcon) {
                 this.fullscreenIcon.src = './img/salir-de-pantalla-completa.png'; 
             }
        }
    }
}

// inicializa el handler cuando ya este cargadi todo el html
document.addEventListener('DOMContentLoaded', () => {
    window.fullscreenHandlerInstance = new FullscreenHandler();
});