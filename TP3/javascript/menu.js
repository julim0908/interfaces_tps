(function() {
    let isOpen = false;
    let isRegistered = false; 

    // Selectores del DOM
    const menuToggle = document.getElementById('menuToggle');
    const menuIcon = document.getElementById('menuIcon');
    const overlay = document.getElementById('overlay');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const userProfile = document.getElementById('userProfile');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');


    function toggleMenu() {
        isOpen = !isOpen;
        
        if (isOpen) {
            sidebarMenu.classList.add('active');
            overlay.classList.add('active');
            menuIcon.textContent = '✕';
        } else {
            sidebarMenu.classList.remove('active');
            overlay.classList.remove('active');
            menuIcon.textContent = '☰';
        }
    }


    function handleRegister(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Intentando redirigir...');
        // Redirige al index para login/registro si el usuario no está registrado
        window.location.href = './index.html'; 
    }


    function handleLogout() {
        isRegistered = false;
        
        // 1. Limpia el estado de la sesión ANTES de cualquier redirección o actualización visual.
        localStorage.removeItem('usuarioLogueado'); 
        
        // 2. REDIRECCIÓN INMEDIATA
        // Usamos la ruta absoluta '/index.html' para asegurar que siempre apunta a la raíz.
        window.location.href = '/index.html'; 

        // Las siguientes funciones ya no son estrictamente necesarias 
        // porque la página va a recargarse en el index, pero no causan daño:
        updateUI();
        toggleMenu(); 
    }


    function updateUI() {
        const menuNav = document.querySelector('.menu-nav');
        
        if (isRegistered) {
            if (userProfile) userProfile.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (menuNav) menuNav.style.paddingTop = '0.5rem'; 
        } else {
            if (userProfile) userProfile.classList.add('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (menuNav) menuNav.style.paddingTop = '4rem'; 
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    if (localStorage.getItem('usuarioLogueado')) {
        isRegistered = true;
    }
    
    updateUI();

})();