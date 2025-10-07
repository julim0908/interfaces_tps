const wrapper = document.getElementById("carouselWrapper")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")

const cards = document.querySelectorAll(".game-card")
const cardsPerView = 4
const cardWidth = 250
const gap = 20
const totalCards = cards.length
const maxPosition = totalCards - cardsPerView

let currentPosition = 0

// Actualizar posición del carrusel
function updateCarousel() {
  const translateX = -currentPosition * (cardWidth + gap)
  wrapper.style.transform = `translateX(${translateX}px)`
  updateButtons()
}

// Actualizar estado de los botones
function updateButtons() {
  prevBtn.disabled = currentPosition === 0
  nextBtn.disabled = currentPosition >= maxPosition
}

// Navegar hacia atrás
prevBtn.addEventListener("click", () => {
  if (currentPosition > 0) {
    currentPosition--
    updateCarousel()
  }
})

// Navegar hacia adelante
nextBtn.addEventListener("click", () => {
  if (currentPosition < maxPosition) {
    currentPosition++
    updateCarousel()
  }
})

// Navegación con teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    prevBtn.click()
  } else if (e.key === "ArrowRight") {
    nextBtn.click()
  }
})

function initCarousel(wrapperId, prevBtnId, nextBtnId, cardsPerView, cardWidth) {
  const wrapper = document.getElementById(wrapperId)
  const prevBtn = document.getElementById(prevBtnId)
  const nextBtn = document.getElementById(nextBtnId)

  if (!wrapper || !prevBtn || !nextBtn) return

  const cards = wrapper.querySelectorAll(".game-card, .game-card-large")
  const gap = 20
  const totalCards = cards.length
  const maxPosition = totalCards - cardsPerView

  let currentPosition = 0

  function updateCarousel() {
    const translateX = -currentPosition * (cardWidth + gap)
    wrapper.style.transform = `translateX(${translateX}px)`
    updateButtons()
  }

  function updateButtons() {
    prevBtn.disabled = currentPosition === 0
    nextBtn.disabled = currentPosition >= maxPosition
  }

  prevBtn.addEventListener("click", () => {
    if (currentPosition > 0) {
      currentPosition--
      updateCarousel()
    }
  })

  nextBtn.addEventListener("click", () => {
    if (currentPosition < maxPosition) {
      currentPosition++
      updateCarousel()
    }
  })

  updateButtons()
}

// Carrusel de 3 cards grandes
initCarousel("carouselWrapper3", "prevBtn3", "nextBtn3", 3, 320)

// Carruseles de 4 cards normales
initCarousel("carouselWrapper", "prevBtn", "nextBtn", 4, 250)
initCarousel("carouselWrapper2", "prevBtn2", "nextBtn2", 4, 250)
initCarousel("carouselWrapper4", "prevBtn4", "nextBtn4", 4, 250)
initCarousel("carouselWrapper5", "prevBtn5", "nextBtn5", 4, 250)
initCarousel("carouselWrapper6", "prevBtn6", "nextBtn6", 4, 250)
initCarousel("carouselWrapper7", "prevBtn7", "nextBtn7", 4, 250)
