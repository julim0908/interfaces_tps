const form = document.getElementById('registroForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Guardar datos del usuario (podés guardar solo el usuario si querés)
    const usuario = document.getElementById('usuario').value;
    localStorage.setItem('usuarioLogueado', usuario);

    // Redirigir al home
    window.location.href = 'home.html';
});