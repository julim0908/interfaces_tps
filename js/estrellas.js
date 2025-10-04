document.addEventListener('DOMContentLoaded', function() {
    const estrellas = document.querySelectorAll('.star');
    let rating = 0;

    estrellas.forEach(function(estrella, index) {
        estrella.addEventListener('click', function() {
            const clicked = index + 1;

            if (rating === clicked) {
                rating = 0;
            } else {
                rating = clicked;
            }

            estrellas.forEach(function(e, i) {
                if (i < rating) {
                    e.src = '../iconos/logo_estrella_llena.svg';
                } else {
                    e.src = '../iconos/logo_estrella_vacia.svg';
                }
            });
        });
    });
});
