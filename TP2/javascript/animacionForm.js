
(function() {
    const form = document.querySelector('.auth-form'); 
    
    // Si no existe el formulario, salimos.
    if (!form) return; 

    const authCard = document.querySelector('.auth-card');
    const welcomeMsg = document.getElementById('welcomeMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Obtener datos
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const usuario = document.getElementById('usuario').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const robotCheck = document.getElementById('robot-check').checked;

        // 2. Validación
        if (!robotCheck) {
            alert("Por favor confirma que no eres un robot.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        // 3. Éxito: Guardar y Animar
        
        // Guardar el nombre de usuario
        localStorage.setItem('usuarioLogueado', usuario);

        if (authCard) authCard.classList.add('form-exit');

        setTimeout(() => {
            if (authCard) authCard.style.display = 'none';
            if (welcomeMsg) welcomeMsg.classList.remove('hidden');

            // 4. Redirección final
            setTimeout(() => {
                // REDIRECCION A home.html
                window.location.href = "../html/home.html"; 
            }, 2000); // Espera 2 segundos después del mensaje de bienvenida

        }, 800); // Espera 0.8 segundos (duración de la animación)
    });
})();