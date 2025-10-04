let isOpen = false;
let isRegistered = false;

// Elementos del DOM
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


function handleRegister() {
    // Aquí va tu lógica de redirección al formulario
    console.log('Redirigir a formulario de registro');
    // window.location.href = '/registro';
    
    // Simulamos el registro para la demo
    isRegistered = true;
    updateUI();
    toggleMenu();
}


function handleLogout() {
    isRegistered = false;
    updateUI();
    toggleMenu();
}


function updateUI() {
    const menuNav = document.querySelector('.menu-nav');
    
    if (isRegistered) {
        userProfile.classList.remove('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        menuNav.style.paddingTop = '0.5rem'; 
    } else {
        userProfile.classList.add('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        menuNav.style.paddingTop = '4rem'; 
    }
}


menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
registerBtn.addEventListener('click', handleRegister);
logoutBtn.addEventListener('click', handleLogout);


updateUI();