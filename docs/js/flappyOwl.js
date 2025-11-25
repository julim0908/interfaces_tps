const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

const images = {};
const imageSources = {
  layer7: "img/7.png",
  layer6: "img/6.png",
  layer5: "img/5.png",
  layer4: "img/4.png",
  layer3: "img/3.png",
  layer2: "img/2.png",
  layer1: "img/1.png",
  owlSprite: "img/buho.png",
  explosionSprite: "img/explosion2.png",
  cristal: "img/cristalMagico.png",
  spider: "img/araña (2).png",
};

let imagesLoaded = 0;
const totalImages = Object.keys(imageSources).length;

function loadImages() {
  for (const name in imageSources) {
    images[name] = new Image();
    images[name].onload = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        setupGame();
      }
    };
    images[name].onerror = () => {
      console.error(`No se pudo cargar: ${imageSources[name]}`);
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        setupGame();
      }
    };
    images[name].src = imageSources[name];
  }
}

let owlY = 300;
let velocity = 0;
let score = 0;
let highScore = localStorage.getItem("flappyOwlRecord")
  ? parseInt(localStorage.getItem("flappyOwlRecord"))
  : 0;
let gameRunning = false;
let gameStarted = false;
let frameCount = 0;

const gravity = 0.5;
const jumpStrength = -7;

const OWL_WIDTH = 225;
const OWL_HEIGHT = 162;
const OWL_X = 150;

const OWL_HITBOX_WIDTH = 60;
const OWL_HITBOX_HEIGHT = 33;
const OWL_HITBOX_OFFSET_X = 70;
const OWL_HITBOX_OFFSET_Y = 55;

const PIPE_WIDTH = 85;
const obstacleSpeed = 4;
let obstacleTimer = 0;
const obstacleInterval = 90;
let obstacles = [];

const OWL_SPRITE_WIDTH = 150;
const OWL_SPRITE_HEIGHT = 108;
const OWL_SPRITE_FRAMES = 6;
let owlFrame = 0;
const OWL_FLAP_FRAME_RATE = 4;
let owlFrameCounter = 0;

const SPIDER_SIZE = 70;
const SPIDER_CHANCE = 0.4;

const EXPLOSION_WIDTH = 96;
const EXPLOSION_HEIGHT = 96;
const EXPLOSION_FRAMES = 8;
const EXPLOSION_FRAME_RATE = 8;
let isExploding = false;
let explosionX = 0;
let explosionY = 0;
let explosionFrame = 0;
let explosionFrameCounter = 0;

let parallaxOffsets = [];

let showStartScreen = true;
let showGameOver = false;

const startScreenOverlay = document.getElementById("startScreenOverlay");
const startButton = document.getElementById("startButton");

/* -------------------- CRISTALES BONUS -------------------- */
let crystals = [];
const CRYSTAL_SIZE = 80;
const CRYSTAL_CHANCE = 0.002;
let crystalFloatOffset = 0;
let crystalFloatDirection = 1;

/* -------------------- PUNTOS FLOTANTES -------------------- */
let floatingScores = [];

class FloatingScore {
  constructor(x, y, points) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.alpha = 1.0;
    this.velocity = -2;
    this.lifetime = 0;
    this.maxLifetime = 60;
  }

  update() {
    this.y += this.velocity;
    this.lifetime++;
    this.alpha = 1 - this.lifetime / this.maxLifetime;
    return this.lifetime >= this.maxLifetime;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#00FFD4";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(`+${this.points}`, this.x, this.y);
    ctx.fillText(`+${this.points}`, this.x, this.y);
    ctx.restore();
  }
}

class Button {
  constructor(text, x, y, width, height, onClick, color = "#4CAF50") {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.onClick = onClick;
    this.hovered = false;
    this.color = color;
  }

  draw(ctx) {
    let color1, color2, strokeColor;

    if (this.color === "#4CAF50") {
      color1 = this.hovered ? "#5cb85c" : "#4CAF50";
      color2 = this.hovered ? "#4cae4c" : "#45a049";
      strokeColor = "#2e7d32";
    } else if (this.color === "#f44336") {
      color1 = this.hovered ? "#e57373" : "#f44336";
      color2 = this.hovered ? "#d32f2f" : "#e53935";
      strokeColor = "#b71c1c";
    } else {
      color1 = this.hovered ? "#cccccc" : "#aaaaaa";
      color2 = this.hovered ? "#999999" : "#888888";
      strokeColor = "#555555";
    }

    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "#ffffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }

  isPointInside(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}
let buttons = [];

function setupGame() {
  parallaxOffsets = [0, 0, 0, 0, 0, 0, 0];
  owlY = 300;
  showStartScreen = true;
  showGameOver = false;
  gameRunning = false;
  gameStarted = false;
  isExploding = false;

  if (startScreenOverlay) {
    startScreenOverlay.classList.remove("hidden");
  }
  canvas.classList.add("start-screen-blur");
  canvas.classList.remove("game-active");

  buttons = [];
  draw();
}

function startGame() {
  if (gameStarted && gameRunning) return;

  if (startScreenOverlay) {
    startScreenOverlay.classList.add("hidden");
  }
  canvas.classList.add("game-active");
  canvas.classList.remove("start-screen-blur");

  gameStarted = true;
  gameRunning = true;
  score = 0;
  owlY = 300;
  velocity = 0;
  obstacles = [];
  crystals = [];
  floatingScores = [];
  frameCount = 0;
  owlFrame = 0;
  owlFrameCounter = 0;
  isExploding = false;
  explosionFrame = 0;
  explosionFrameCounter = 0;
  parallaxOffsets = [0, 0, 0, 0, 0, 0];
  showStartScreen = false;
  showGameOver = false;
  buttons = [];

  requestAnimationFrame(gameLoop);
}

function resetGame() {
  startGame();
}

function returnToStartScreen() {
  gameRunning = false;
  gameStarted = false;
  showGameOver = false;
  showStartScreen = true;
  setupGame();
}

function gameLoop() {
  if (gameRunning) {
    updateGame();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function updateGame() {
  if (!gameRunning) return;

  frameCount++;
  owlFrameCounter++;

  velocity += gravity;
  owlY += velocity;

  if (owlY <= 0) {
    owlY = 0;
    velocity = 0;
  }

  if (owlY + OWL_HEIGHT >= CANVAS_HEIGHT) {
    endGame();
    return;
  }

  if (owlFrameCounter >= OWL_FLAP_FRAME_RATE) {
    owlFrame = (owlFrame + 1) % OWL_SPRITE_FRAMES;
    owlFrameCounter = 0;
  }

  obstacleTimer++;
  if (obstacleTimer > obstacleInterval) {
    createObstacle();
    obstacleTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obstacleSpeed;

    if (checkCollision(OWL_X, owlY, OWL_WIDTH, OWL_HEIGHT, obs)) {
      endGame();
      return;
    }

    if (obs.hasSpider) {
      const spiderX = obs.x + PIPE_WIDTH / 2 - SPIDER_SIZE / 2;
      const spiderY = obs.topHeight;

      if (checkSpiderCollision(OWL_X, owlY, { x: spiderX, y: spiderY })) {
        endGame();
        return;
      }
    }

    if (!obs.scored && obs.x + PIPE_WIDTH < OWL_X) {
      obs.scored = true;
      score++;
    }

    if (obs.x < -PIPE_WIDTH) {
      obstacles.splice(i, 1);
    }
  }

  /* --------- GENERACIÓN DE CRISTALES --------- */
  if (Math.random() < CRYSTAL_CHANCE) {
    crystals.push({
      x: CANVAS_WIDTH,
      y: Math.random() * (CANVAS_HEIGHT - 200) + 80,
      collected: false,
    });
  }

  /* --------- MOVER CRISTALES --------- */
  for (let i = crystals.length - 1; i >= 0; i--) {
    const c = crystals[i];
    c.x -= obstacleSpeed;

    if (c.x < -CRYSTAL_SIZE) {
      crystals.splice(i, 1);
      continue;
    }

    if (checkCrystalCollision(OWL_X, owlY, c)) {
      c.collected = true;
      score += 2;

      floatingScores.push(new FloatingScore(c.x + CRYSTAL_SIZE / 2, c.y, 2));

      crystals.splice(i, 1);
    }
  }

  /* --------- ACTUALIZAR PUNTOS FLOTANTES --------- */
  for (let i = floatingScores.length - 1; i >= 0; i--) {
    if (floatingScores[i].update()) {
      floatingScores.splice(i, 1);
    }
  }

  const parallaxSpeeds = [0.1, 0.2, 0.4, 0.6, 1.0, 1.2, 1.4];
  for (let i = 0; i < parallaxOffsets.length; i++) {
    parallaxOffsets[i] =
      (parallaxOffsets[i] + parallaxSpeeds[i]) % CANVAS_WIDTH;
  }
}

function createObstacle() {
  const gap = 200;
  const minHeight = 100;
  const maxHeight = CANVAS_HEIGHT - gap - 100;
  const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

  const hasSpider = Math.random() < SPIDER_CHANCE;

  obstacles.push({
    x: CANVAS_WIDTH,
    topHeight: topHeight,
    gap: gap,
    scored: false,
    hasSpider: hasSpider,
    spiderOnTop: true,
  });
}

function endGame() {
  if (showGameOver || isExploding) return;

  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyOwlRecord", highScore);
  }

  const canvas = document.getElementById("gameCanvas");
  canvas.classList.add("explosion-shake");

  setTimeout(() => {
    canvas.classList.remove("explosion-shake");
  }, 500);

  isExploding = true;
  explosionX = OWL_X + OWL_WIDTH / 2;
  explosionY = owlY + OWL_HEIGHT / 2;
  explosionFrame = 0;
  explosionFrameCounter = 0;

  animateExplosion();
}

function animateExplosion() {
  if (explosionFrame < EXPLOSION_FRAMES) {
    if (explosionFrameCounter >= EXPLOSION_FRAME_RATE) {
      explosionFrame++;
      explosionFrameCounter = 0;
    } else {
      explosionFrameCounter++;
    }

    draw();
    requestAnimationFrame(animateExplosion);
  } else {
    isExploding = false;
    showGameOver = true;
    draw();
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (!showStartScreen) {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, "#0f1729");
    bgGradient.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (images.layer7 && images.layer7.complete) {
      const offset = parallaxOffsets[0];
      ctx.drawImage(images.layer7, -offset, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(
        images.layer7,
        CANVAS_WIDTH - offset,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
    }

    if (images.layer6 && images.layer6.complete) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      const moonSize = 120;
      const moonX = CANVAS_WIDTH / 2 - moonSize / 2;
      const moonY = 80;
      ctx.drawImage(images.layer6, moonX, moonY, moonSize, moonSize);
      ctx.restore();
    }

    const remainingLayers = [
      { img: images.layer5, index: 1 },
      { img: images.layer4, index: 2 },
      { img: images.layer3, index: 3 },
      { img: images.layer2, index: 4 },
      { img: images.layer1, index: 5 },
    ];

    remainingLayers.forEach((layer) => {
      if (!layer.img || !layer.img.complete) return;
      const offset = parallaxOffsets[layer.index];
      ctx.drawImage(layer.img, -offset, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(
        layer.img,
        CANVAS_WIDTH - offset,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
    });

    /* -------- DIBUJAR CRISTALES -------- */
    crystalFloatOffset += crystalFloatDirection * 0.3;
    if (crystalFloatOffset > 5 || crystalFloatOffset < -5) {
      crystalFloatDirection *= -1;
    }

    crystals.forEach((c) => {
      drawCrystal(c.x, c.y + crystalFloatOffset);
    });

    /* -------- DIBUJAR PUNTOS FLOTANTES -------- */
    floatingScores.forEach((fs) => {
      fs.draw(ctx);
    });

    obstacles.forEach((obs) => {
      drawPipe(obs.x, 0, obs.topHeight, "top");
      drawPipe(
        obs.x,
        obs.topHeight + obs.gap,
        CANVAS_HEIGHT - obs.topHeight - obs.gap,
        "bottom"
      );

      if (obs.hasSpider) {
        const spiderX = obs.x + PIPE_WIDTH / 2 - SPIDER_SIZE / 2;
        const spiderY = obs.topHeight;
        drawSpider(spiderX, spiderY);
      }
    });
  }

  if (!isExploding && !showStartScreen) {
    drawOwl();
  } else if (isExploding) {
    drawExplosion();
  }

  drawUI();
}

function drawPipe(x, y, height, type) {
  if (height <= 0) return;

  ctx.save();

  const gradient = ctx.createLinearGradient(x, y, x + PIPE_WIDTH, y);
  gradient.addColorStop(0, "#3a2518");
  gradient.addColorStop(0.5, "#4a3320");
  gradient.addColorStop(1, "#3a2518");

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 3;

  ctx.fillRect(x, y, PIPE_WIDTH, height);
  ctx.strokeRect(x, y, PIPE_WIDTH, height);

  const capHeight = 20;
  ctx.fillStyle = "#5a4332";

  if (type === "top") {
    ctx.fillRect(x - 8, y + height - capHeight, PIPE_WIDTH + 16, capHeight);
    ctx.strokeRect(x - 8, y + height - capHeight, PIPE_WIDTH + 16, capHeight);
  } else {
    ctx.fillRect(x - 8, y, PIPE_WIDTH + 16, capHeight);
    ctx.strokeRect(x - 8, y, PIPE_WIDTH + 16, capHeight);
  }

  ctx.restore();
}

function drawSpider(x, y) {
  if (images.spider && images.spider.complete) {
    ctx.save();
    const sway = Math.sin(frameCount * 0.1) * 2;
    ctx.drawImage(images.spider, x + sway, y, SPIDER_SIZE, SPIDER_SIZE);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 15;
    const centerX = x + SPIDER_SIZE / 2;
    const centerY = y + SPIDER_SIZE / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, SPIDER_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY - SPIDER_SIZE / 4,
      SPIDER_SIZE / 5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 - Math.PI / 4;
      const legLength = SPIDER_SIZE / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * legLength,
        centerY + Math.sin(angle) * legLength
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX - Math.cos(angle) * legLength,
        centerY + Math.sin(angle) * legLength
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawCrystal(x, y) {
  if (images.cristal && images.cristal.complete) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(images.cristal, x, y, CRYSTAL_SIZE, CRYSTAL_SIZE);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#00eaff";
    ctx.beginPath();
    ctx.arc(
      x + CRYSTAL_SIZE / 2,
      y + CRYSTAL_SIZE / 2,
      CRYSTAL_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}

function drawOwl() {
  if (!images.owlSprite || !images.owlSprite.complete) {
    ctx.save();
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(OWL_X, owlY, OWL_WIDTH, OWL_HEIGHT);
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(
      OWL_X + OWL_WIDTH / 2,
      owlY + OWL_HEIGHT / 3,
      OWL_WIDTH / 8,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🦉", OWL_X + OWL_WIDTH / 2, owlY + OWL_HEIGHT / 2);
    ctx.restore();
    return;
  }

  ctx.save();

  const centerX = OWL_X + OWL_WIDTH / 2;
  const centerY = owlY + OWL_HEIGHT / 2;

  ctx.translate(centerX, centerY);

  let rotation = velocity * 2.5;
  rotation = Math.max(-30, Math.min(30, rotation));
  ctx.rotate((rotation * Math.PI) / 180);

  ctx.imageSmoothingEnabled = false;

  const SCALE = 1.6;
  const drawWidth = OWL_SPRITE_WIDTH * SCALE;
  const drawHeight = OWL_SPRITE_HEIGHT * SCALE;

  ctx.drawImage(
    images.owlSprite,
    owlFrame * OWL_SPRITE_WIDTH,
    0,
    OWL_SPRITE_WIDTH,
    OWL_SPRITE_HEIGHT,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}

function drawExplosion() {
  if (!images.explosionSprite || !images.explosionSprite.complete) return;
  if (!isExploding) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const EXPLOSION_SCALE = 2;
  const drawWidth = EXPLOSION_WIDTH * EXPLOSION_SCALE;
  const drawHeight = EXPLOSION_HEIGHT * EXPLOSION_SCALE;

  const drawX = explosionX - drawWidth / 2;
  const drawY = explosionY - drawHeight / 2;

  ctx.drawImage(
    images.explosionSprite,
    explosionFrame * EXPLOSION_WIDTH,
    0,
    EXPLOSION_WIDTH,
    EXPLOSION_HEIGHT,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}

function drawUI() {
  if (gameRunning) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = "#ffffffff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Puntos: ${score}`, 30, 55);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`Récord: ${highScore}`, 30, 100);
    ctx.restore();
  }

  if (showGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.shadowColor = "rgba(47, 4, 58, 0.83)";
    ctx.shadowBlur = 15;

    ctx.fillStyle = "#ffffffff";
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡Perdiste!", CANVAS_WIDTH / 2, 220);
    ctx.restore();

    ctx.fillStyle = "#ffffffff";
    ctx.font = "bold 45px Arial";
    ctx.fillText(`Puntuación: ${score}`, CANVAS_WIDTH / 2, 300);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 35px Arial";
    if (score >= highScore && score > 0) {
      ctx.fillText(`¡NUEVO RÉCORD! ${highScore}`, CANVAS_WIDTH / 2, 360);
    } else {
      ctx.fillText(`Récord: ${highScore}`, CANVAS_WIDTH / 2, 360);
    }

    const buttonWidth = 240;
    const buttonHeight = 50;
    const buttonGap = 20;
    const totalButtonWidth = buttonWidth * 2 + buttonGap;
    const startX = (CANVAS_WIDTH - totalButtonWidth) / 2;

    buttons = [
      new Button(
        "JUGAR DE NUEVO",
        startX,
        440,
        buttonWidth,
        buttonHeight,
        resetGame
      ),
      new Button(
        "VOLVER AL INICIO",
        startX + buttonWidth + buttonGap,
        440,
        buttonWidth,
        buttonHeight,
        returnToStartScreen,
        "#808080"
      ),
    ];
    buttons.forEach((btn) => btn.draw(ctx));
  }
}

function checkCollision(owlX, owlY, owlW, owlH, obstacle) {
  const owlRect = {
    x: owlX + OWL_HITBOX_OFFSET_X,
    y: owlY + OWL_HITBOX_OFFSET_Y,
    width: OWL_HITBOX_WIDTH,
    height: OWL_HITBOX_HEIGHT,
  };

  const topPipeRect = {
    x: obstacle.x,
    y: 0,
    width: PIPE_WIDTH,
    height: obstacle.topHeight,
  };

  const bottomPipeRect = {
    x: obstacle.x,
    y: obstacle.topHeight + obstacle.gap,
    width: PIPE_WIDTH,
    height: CANVAS_HEIGHT - (obstacle.topHeight + obstacle.gap),
  };

  const isOverlapping = (r1, r2) => {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  };

  return (
    isOverlapping(owlRect, topPipeRect) ||
    isOverlapping(owlRect, bottomPipeRect)
  );
}

function checkSpiderCollision(owlX, owlY, spider) {
  const owlRect = {
    x: owlX + OWL_HITBOX_OFFSET_X,
    y: owlY + OWL_HITBOX_OFFSET_Y,
    width: OWL_HITBOX_WIDTH,
    height: OWL_HITBOX_HEIGHT,
  };

  const spiderRect = {
    x: spider.x,
    y: spider.y,
    width: SPIDER_SIZE,
    height: SPIDER_SIZE,
  };

  return (
    owlRect.x < spiderRect.x + spiderRect.width &&
    owlRect.x + owlRect.width > spiderRect.x &&
    owlRect.y < spiderRect.y + spiderRect.height &&
    owlRect.y + owlRect.height > spiderRect.y
  );
}

function checkCrystalCollision(owlX, owlY, crystal) {
  const owlRect = {
    x: owlX + OWL_HITBOX_OFFSET_X,
    y: owlY + OWL_HITBOX_OFFSET_Y,
    width: OWL_HITBOX_WIDTH,
    height: OWL_HITBOX_HEIGHT,
  };

  const crystalRect = {
    x: crystal.x,
    y: crystal.y,
    width: CRYSTAL_SIZE,
    height: CRYSTAL_SIZE,
  };

  return (
    owlRect.x < crystalRect.x + crystalRect.width &&
    owlRect.x + owlRect.width > crystalRect.x &&
    owlRect.y < crystalRect.y + crystalRect.height &&
    owlRect.y + owlRect.height > crystalRect.y
  );
}

function jump() {
  if (showStartScreen) {
    startGame();
    return;
  }
  if (!gameRunning) return;

  velocity = jumpStrength;
}

if (startButton) {
  startButton.addEventListener("click", startGame);
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  let buttonClicked = false;
  buttons.forEach((btn) => {
    if (btn.isPointInside(x, y)) {
      btn.onClick();
      buttonClicked = true;
    }
  });

  if (!buttonClicked && showStartScreen) {
    startGame();
  } else if (!buttonClicked && gameRunning) {
    jump();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  let needsRedraw = false;
  buttons.forEach((btn) => {
    const wasHovered = btn.hovered;
    btn.hovered = btn.isPointInside(x, y);
    if (wasHovered !== btn.hovered) {
      needsRedraw = true;
    }
  });
  if (
    needsRedraw &&
    (!gameRunning || showStartScreen || showGameOver || isExploding)
  ) {
    draw();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
});
loadImages();
