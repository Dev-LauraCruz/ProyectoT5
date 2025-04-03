document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slider-inner');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 segundos
    
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Iniciar el carrusel automático
    let slideTimer = setInterval(nextSlide, slideInterval);
    
    // Pausar al interactuar
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', function() {
        clearInterval(slideTimer);
    });
    
    slider.addEventListener('mouseleave', function() {
        slideTimer = setInterval(nextSlide, slideInterval);
    });
    
    // Controles opcionales (puedes agregar botones después)
    // document.querySelector('.next-btn').addEventListener('click', nextSlide);
    // document.querySelector('.prev-btn').addEventListener('click', function() {
    //     slides[currentSlide].classList.remove('active');
    //     currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    //     slides[currentSlide].classList.add('active');
    // });
});