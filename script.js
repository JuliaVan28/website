// Smooth scrolling for navigation links and CTAs
const OFFSET_DESKTOP = 90;
const OFFSET_MOBILE = 72;

const getHeaderOffset = () => {
    return window.innerWidth <= 640 ? OFFSET_MOBILE : OFFSET_DESKTOP;
};

const smoothScrollTo = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) {
        return;
    }

    const offset = getHeaderOffset();
    const elementY = target.getBoundingClientRect().top + window.pageYOffset;
    const position = elementY - offset;

    window.scrollTo({
        top: position,
        behavior: 'smooth'
    });
};

document.querySelectorAll('a[href^="#"], [data-scroll-target]').forEach(trigger => {
    trigger.addEventListener('click', (event) => {
        const targetId = trigger.getAttribute('href') || trigger.dataset.scrollTarget;
        if (!targetId || targetId === '#') {
            return;
        }

        event.preventDefault();
        smoothScrollTo(targetId);
    });
});

// Header scroll effect removed to prevent flickering with video

// Scroll to checkout utility exposed globally for inline handlers
function scrollToCheckout() {
    smoothScrollTo('#checkout');
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
};

const animateIn = (element, delayMultiplier = 0) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(28px)';
    element.style.transition = `opacity 0.65s ease ${delayMultiplier * 0.12}s, transform 0.65s ease ${delayMultiplier * 0.12}s`;
    observer.observe(element);
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const cards = document.querySelectorAll('.bundle-card, .testimonial-card, .stat-item');

    timelineItems.forEach((item, index) => animateIn(item, index));
    cards.forEach((card, index) => animateIn(card, index % 3));
});

// Adaptive pulse animation for CTA buttons
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulseEffect {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 18px 36px rgba(245, 203, 204, 0.4);
        }
        50% {
            transform: scale(1.025);
            box-shadow: 0 22px 42px rgba(245, 203, 204, 0.5);
        }
    }
`;
document.head.appendChild(pulseStyle);

const applyPulseToCTAs = () => {
    document.querySelectorAll('.cta-button, .cta-button-large, .cta-button-final').forEach((button, index) => {
        button.style.animation = `pulseEffect 3s ease ${index * 0.2}s infinite`;
    });
};

let pulseApplied = false;

const handlePulseTrigger = () => {
    if (pulseApplied) {
        return;
    }

    const heroHeight = document.querySelector('.hero')?.offsetHeight || 500;

    if (window.pageYOffset > heroHeight * 0.6) {
        applyPulseToCTAs();
        pulseApplied = true;
        window.removeEventListener('scroll', handlePulseTrigger);
    }
};

window.addEventListener('scroll', handlePulseTrigger, { passive: true });

// Carousel functionality
class Carousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        this.dots = document.querySelectorAll('.carousel-dot');
        this.videos = document.querySelectorAll('.carousel-video');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        
        this.init();
    }
    
    init() {
        // Generate dots dynamically
        this.generateDots();
        
        // Event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Auto-play video when it comes into view
        this.handleVideoAutoplay();
        
        // Touch/swipe support
        this.addTouchSupport();
        
        // Keyboard navigation
        this.addKeyboardSupport();
    }
    
    generateDots() {
        const dotsContainer = document.getElementById('carouselDots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < this.totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dotsContainer.appendChild(dot);
            }
            // Update dots reference
            this.dots = document.querySelectorAll('.carousel-dot');
        }
    }
    
    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        const slideWidth = 100 / this.totalSlides; // Dynamic slide width
        const translateX = -slideIndex * slideWidth;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update active class on slides (critical for opacity visibility)
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === slideIndex);
        });
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
        });
        
        // Handle video autoplay
        this.handleVideoAutoplay();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(this.currentSlide);
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(this.currentSlide);
    }
    
    handleVideoAutoplay() {
        // Pause all videos first
        this.videos.forEach(video => {
            video.pause();
            video.currentTime = 0; // Reset to beginning
        });
        
        // Play video on current slide if it exists
        const currentSlideVideo = this.slides[this.currentSlide].querySelector('.carousel-video');
        
        if (currentSlideVideo) {
            // Add error handling for video loading issues
            currentSlideVideo.addEventListener('error', (e) => {
                console.error('Video loading error:', {
                    videoIndex: currentSlideVideo.getAttribute('data-video-index'),
                    error: e,
                    sources: Array.from(currentSlideVideo.querySelectorAll('source')).map(s => ({
                        src: s.src,
                        type: s.type
                    }))
                });
            }, { once: true });
            
            // Ensure video is loaded and ready
            if (currentSlideVideo.readyState >= 2) {
                // Video has enough data to play
                currentSlideVideo.play().catch((error) => {
                    console.log('Video autoplay prevented:', error);
                });
            } else {
                // Wait for video to load enough data
                const playWhenReady = () => {
                    currentSlideVideo.play().catch((error) => {
                        console.log('Video autoplay prevented:', error);
                    });
                };
                
                if (currentSlideVideo.readyState >= 1) {
                    // Video has metadata, try playing
                    playWhenReady();
                } else {
                    // Wait for video to load enough data
                    currentSlideVideo.addEventListener('loadeddata', playWhenReady, { once: true });
                    currentSlideVideo.addEventListener('canplay', playWhenReady, { once: true });
                    
                    // Load the video if not already loading
                    if (currentSlideVideo.readyState === 0) {
                        currentSlideVideo.load();
                    }
                }
            }
        }
    }
    
    addTouchSupport() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
        }, { passive: true });
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
}

// Mobile Menu Toggle
class MobileMenu {
    constructor() {
        this.toggle = document.getElementById('mobileMenuToggle');
        this.nav = document.getElementById('mainNav');
        this.init();
    }
    
    init() {
        if (this.toggle && this.nav) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
            
            // Close menu when clicking on a link
            this.nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.toggle.contains(e.target) && !this.nav.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }
    
    toggleMenu() {
        this.toggle.classList.toggle('active');
        this.nav.classList.toggle('active');
    }
    
    closeMenu() {
        this.toggle.classList.remove('active');
        this.nav.classList.remove('active');
    }
}

// FAQ Functionality
class FAQ {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }
    
    init() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleFAQ(item));
        });
    }
    
    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        this.faqItems.forEach(faqItem => {
            if (faqItem !== item) {
                faqItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
    new MobileMenu();
    new FAQ();
    
    const timelineItems = document.querySelectorAll('.timeline-item');
    const cards = document.querySelectorAll('.bundle-card, .testimonial-card, .stat-item');

    timelineItems.forEach((item, index) => animateIn(item, index));
    cards.forEach((card, index) => animateIn(card, index % 3));
});

// Accessibility: ensure keyboard focus outline is visible on buttons post-animation
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('blur', () => {
        button.style.removeProperty('outline');
    });
});

