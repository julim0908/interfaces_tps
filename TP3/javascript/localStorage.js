document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const usernameSpan = userProfile.querySelector('.username');

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    if (usuarioLogueado) {
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        userProfile.classList.remove('hidden');
        usernameSpan.textContent = usuarioLogueado;
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '../index.html';
    });
});