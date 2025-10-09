const form = document.getElementById('registroForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    localStorage.setItem('usuarioLogueado', usuario);

    window.location.href = 'home.html';
});