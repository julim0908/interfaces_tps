/**
 * Clase para manejar la activación/desactivación de la pantalla completa,
 * aplicando los estilos CSS necesarios.
 * * NOTA: Esta clase asume que los estilos CSS para .fullscreen-mode
 * están definidos correctamente en peg-solitaire.css.
 */
class FullscreenHandler {
    constructor() {
        // El elemento que pediremos al navegador que maximice (el contenedor del juego)
        this.targetElement = document.querySelector('.game-full');
        // El botón que activa la funcionalidad
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
        
        // Escucha el evento nativo del navegador (para salir con ESC)
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    }

    /**
     * Alterna entre el modo normal y el modo de pantalla completa.
     */
    toggleFullscreen() {
        // Toggle la clase CSS en el body para aplicar los estilos de fondo negro y centrado
        const isFullscreen = document.body.classList.contains(this.classToToggle);
        
        if (!isFullscreen) {
            document.body.classList.add(this.classToToggle);
            // Entrar en pantalla completa (API Nativa del Navegador)
            if (this.targetElement.requestFullscreen) {
                this.targetElement.requestFullscreen();
            } else if (this.targetElement.webkitRequestFullscreen) { // Safari
                this.targetElement.webkitRequestFullscreen();
            }

            // Cambia el ícono a 'Salir'
            if (this.fullscreenIcon) {
                this.fullscreenIcon.src = './img/salir-de-pantalla-completa.png'; 
            }
        } else {
            // Salir de pantalla completa (API Nativa del Navegador)
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            
            // La clase CSS se quitará en handleFullscreenChange para sincronizar con la API.
        }
    }

    /**
     * Sincroniza la clase CSS cuando el usuario entra o sale de forma nativa (tecla ESC).
     */
    handleFullscreenChange() {
        const isCurrentlyFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
        
        // 1. Caso: Saliendo del modo Fullscreen (naturalmente con ESC o con el botón)
        if (!isCurrentlyFullscreen && document.body.classList.contains(this.classToToggle)) {
            document.body.classList.remove(this.classToToggle);
            // Mostrar icono de ENTRAR
            if (this.fullscreenIcon) {
                this.fullscreenIcon.src = './img/pantalla-completa (1).png'; // ⬅️ Correcto
            }
        } 
        
        // 2. Caso: Entrando al modo Fullscreen (si no se hizo por el botón original, sino por otro método)
        // Y, más importante, para asegurarse de que el ícono de SALIR esté visible.
        else if (isCurrentlyFullscreen && !document.body.classList.contains(this.classToToggle)) {
             document.body.classList.add(this.classToToggle);
             // Mostrar icono de SALIR
             if (this.fullscreenIcon) {
                 // ¡CORRECCIÓN AQUÍ! Debe ser el icono de SALIR cuando está activo
                 this.fullscreenIcon.src = './img/salir-de-pantalla-completa.png'; 
             }
        }
    }
}

// Inicializa el handler cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    window.fullscreenHandlerInstance = new FullscreenHandler();
});