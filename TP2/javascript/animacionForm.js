const form = document.querySelector('.auth-form');
const authCard = document.querySelector('.auth-card');
const welcomeMsg = document.getElementById('welcomeMessage');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const usuario = document.getElementById('usuario').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const robotCheck = document.getElementById('robot-check').checked;

  if (!robotCheck) {
    alert("Por favor confirma que no eres un robot.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  authCard.classList.add('form-exit');

  setTimeout(() => {
    authCard.style.display = 'none';
    welcomeMsg.classList.remove('hidden');

    setTimeout(() => {
      window.location.href = "home.html";
    }, 2000);

  }, 800);
});
