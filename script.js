document.addEventListener('DOMContentLoaded', () => {
    class CampusCarousel {
        constructor() {
            this.carousel = document.querySelector('#hubCarousel');
            this.track = this.carousel.querySelector('.carousel-track');
            this.cards = Array.from(this.carousel.querySelectorAll('.carousel-card'));
            this.prevBtn = this.carousel.querySelector('.prev-btn');
            this.nextBtn = this.carousel.querySelector('.next-btn');
            this.progressBar = this.carousel.querySelector('.progress-bar');
            this.currentIndex = 0;
            this.autoAdvanceInterval = null;
            this.isHovered = false;
            this.transitionDuration = 600; // Should match CSS transition duration
            this.slideDuration = 2000;

            this.init();
        }

        init() {
            this.setupEventListeners();
            this.arrangeCards();
            this.startAutoAdvance();
            this.updateProgressBar();
        }

        setupEventListeners() {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            this.carousel.addEventListener('mouseenter', () => {
                this.isHovered = true;
                this.pauseAutoAdvance();
            });
            
            this.carousel.addEventListener('mouseleave', () => {
                this.isHovered = false;
                this.startAutoAdvance();
            });
        }

        arrangeCards() {
            this.cards.forEach((card, index) => {
                card.classList.remove('active', 'prev', 'next');
                
                if(index === this.currentIndex) {
                    card.classList.add('active');
                } else if(index === this.getPrevIndex()) {
                    card.classList.add('prev');
                } else if(index === this.getNextIndex()) {
                    card.classList.add('next');
                }
            });
        }

        getPrevIndex() {
            return (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        }

        getNextIndex() {
            return (this.currentIndex + 1) % this.cards.length;
        }

        nextSlide() {
            this.currentIndex = this.getNextIndex();
            this.updateCarousel();
        }

        prevSlide() {
            this.currentIndex = this.getPrevIndex();
            this.updateCarousel();
        }

        updateCarousel() {
            this.arrangeCards();
            this.resetProgressBar();
            this.updateProgressBar();
            
            if(!this.isHovered) {
                this.restartAutoAdvance();
            }
        }

        startAutoAdvance() {
            if(!this.autoAdvanceInterval) {
                this.autoAdvanceInterval = setInterval(() => {
                    this.nextSlide();
                }, this.slideDuration);
            }
        }

        pauseAutoAdvance() {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }

        restartAutoAdvance() {
            this.pauseAutoAdvance();
            this.startAutoAdvance();
        }

        updateProgressBar() {
            this.progressBar.style.transition = `width ${this.slideDuration}ms linear`;
            this.progressBar.style.width = '100%';
        }

        resetProgressBar() {
            this.progressBar.style.transition = 'none';
            this.progressBar.style.width = '0%';
            void this.progressBar.offsetWidth; // Trigger reflow
            this.updateProgressBar();
        }
    }

    // Initialize the carousel
    new CampusCarousel();
});