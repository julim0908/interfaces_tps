const wrapper = document.getElementById('carouselWrapper');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const cards = document.querySelectorAll('.game-card');
const cardsPerView = 4;
const cardWidth = 250; // Ancho exacto de cada card
const gap = 20; // Gap entre cards
const totalCards = cards.length;
const maxPosition = totalCards - cardsPerView;

let currentPosition = 0;

// Actualizar posición del carrusel
function updateCarousel() {
    const translateX = -currentPosition * (cardWidth + gap);
    wrapper.style.transform = `translateX(${translateX}px)`;
    updateButtons();
}

// Actualizar estado de los botones
function updateButtons() {
    prevBtn.disabled = currentPosition === 0;
    nextBtn.disabled = currentPosition >= maxPosition;
}

// Navegar hacia atrás
prevBtn.addEventListener('click', () => {
    if (currentPosition > 0) {
        currentPosition--;
        updateCarousel();
    }
});

// Navegar hacia adelante
nextBtn.addEventListener('click', () => {
    if (currentPosition < maxPosition) {
        currentPosition++;
        updateCarousel();
    }
});

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevBtn.click();
    } else if (e.key === 'ArrowRight') {
        nextBtn.click();
    }
});

// ============ SIDEBAR ============
let isOpen = false;
let isRegistered = false;

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
    console.log('Redirigir a formulario de registro');
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

// Inicializar
updateUI();
updateButtons();