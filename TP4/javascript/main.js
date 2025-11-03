window.addEventListener('load', () => {
    // Inicializar MVC
    const model = new PegSolitaireModel();
    const view = new PegSolitaireView('gameCanvas');
    const controller = new PegSolitaireController(model, view);
});