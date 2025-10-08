document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const usernameSpan = userProfile.querySelector('.username');

    // Revisar si hay usuario logueado en localStorage
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    if (usuarioLogueado) {
        // Ocultar botón registrarse
        registerBtn.classList.add('hidden');
        // Mostrar botón cerrar sesión
        logoutBtn.classList.remove('hidden');
        // Mostrar perfil y poner nombre del usuario
        userProfile.classList.remove('hidden');
        usernameSpan.textContent = usuarioLogueado;
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = 'formulario.html'; // vuelve al registro
    });
});