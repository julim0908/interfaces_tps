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

// Inicializa TODOS los carruseles
initCarousel("carouselWrapper", "prevBtn", "nextBtn", 4, 250)      // Carrusel 2
initCarousel("carouselWrapper2", "prevBtn2", "nextBtn2", 4, 250)   // Carrusel 3
initCarousel("carouselWrapper3", "prevBtn3", "nextBtn3", 3, 320)   // Destacados
initCarousel("carouselWrapper4", "prevBtn4", "nextBtn4", 4, 250)   // Carrusel 4
initCarousel("carouselWrapper5", "prevBtn5", "nextBtn5", 4, 250)   // Carrusel 5
initCarousel("carouselWrapper6", "prevBtn6", "nextBtn6", 4, 250)   // Carrusel 6
initCarousel("carouselWrapper7", "prevBtn7", "nextBtn7", 4, 250)   // Carrusel 7
