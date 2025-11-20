const owl = document.getElementById('owl');
        const gameContainer = document.getElementById('gameContainer');
        const scoreDisplay = document.getElementById('score');
        const finalScoreDisplay = document.getElementById('finalScore');
        const gameOverDiv = document.getElementById('gameOver');
        const startMessage = document.getElementById('startMessage');

        let owlY = 50; // Posición vertical en porcentaje
        let velocity = 0; // Velocidad vertical
        let score = 0;
        let gameStarted = false;
        let gameRunning = false;
        let gameLoop;

        const gravity = 0.5; // Gravedad
        const jumpStrength = -10; // Fuerza del salto (negativo = hacia arriba)
        const maxVelocity = 15; // Velocidad máxima de caída

        // Inicializar posición del búho
        owl.style.bottom = owlY + '%';

        // Función para hacer que el búho salte
        function jump() {
            if (!gameStarted) {
                startGame();
                return;
            }
            if (!gameRunning) return;
            
            velocity = jumpStrength;
            // Rotar ligeramente hacia arriba al saltar
            owl.style.transform = 'rotate(-15deg)';
        }

        // Función para iniciar el juego
        function startGame() {
            gameStarted = true;
            gameRunning = true;
            startMessage.style.display = 'none';
            gameLoop = setInterval(updateGame, 1000 / 60); // 60 FPS
        }

        // Función principal del juego
        function updateGame() {
            if (!gameRunning) return;

            // Aplicar gravedad
            velocity += gravity;
            
            // Limitar velocidad máxima
            if (velocity > maxVelocity) velocity = maxVelocity;
            
            // Actualizar posición
            owlY -= velocity;

            // Limitar posición dentro de la pantalla
            if (owlY > 82) { // Límite superior (100% - altura del búho aprox)
                owlY = 82;
                velocity = 0;
            }
            if (owlY < 0) { // Chocó con el suelo
                endGame();
                return;
            }

            // Aplicar posición
            owl.style.bottom = owlY + '%';

            // Rotar según la velocidad (simulando inclinación)
            let rotation = velocity * 3;
            if (rotation > 45) rotation = 45;
            if (rotation < -30) rotation = -30;
            owl.style.transform = `rotate(${rotation}deg)`;

            // Detectar colisiones
            checkCollisions();

            // Incrementar puntuación
            score += 0.1;
            scoreDisplay.textContent = Math.floor(score);
        }

        // Detectar colisiones básicas
        function checkCollisions() {
            const owlRect = owl.getBoundingClientRect();
            
            // Colisión con cristales
            const crystals = document.querySelectorAll('.crystal');
            crystals.forEach(crystal => {
                const crystalRect = crystal.getBoundingClientRect();
                if (isColliding(owlRect, crystalRect)) {
                    endGame();
                }
            });

            // Colisión con araña
            const spider = document.getElementById('spider');
            const spiderRect = spider.getBoundingClientRect();
            if (isColliding(owlRect, spiderRect)) {
                endGame();
            }
        }

        // Verificar si dos elementos colisionan
        function isColliding(rect1, rect2) {
            // Reducir el área de colisión un poco para hacerlo más justo
            const margin = 30;
            return !(
                rect1.right - margin < rect2.left + margin ||
                rect1.left + margin > rect2.right - margin ||
                rect1.bottom - margin < rect2.top + margin ||
                rect1.top + margin > rect2.bottom - margin
            );
        }

        // Terminar el juego
        function endGame() {
            gameRunning = false;
            clearInterval(gameLoop);
            finalScoreDisplay.textContent = Math.floor(score);
            gameOverDiv.style.display = 'block';
        }

        // Reiniciar el juego
        function resetGame() {
            owlY = 50;
            velocity = 0;
            score = 0;
            gameRunning = true;
            owl.style.bottom = owlY + '%';
            owl.style.transform = 'rotate(0deg)';
            scoreDisplay.textContent = '0';
            gameOverDiv.style.display = 'none';
            gameLoop = setInterval(updateGame, 1000 / 60);
        }

        // Event listeners
        gameContainer.addEventListener('click', jump);
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });