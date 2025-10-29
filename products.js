// Products Page JavaScript - Enhanced Link Previews and Interactions

class ProductPreviewLoader {
    constructor() {
        this.init();
    }

    init() {
        // Simulate loading product previews
        this.loadProductPreviews();
        
        // Add interaction enhancements
        this.enhanceProductCards();
        
        // Add smooth scrolling for category navigation
        this.addSmoothScrolling();
    }

    async loadProductPreviews() {
        // Load previews for all visible product cards
        const productCards = document.querySelectorAll('.product-card[data-loading="true"]');
        
        // Simulate staggered loading
        productCards.forEach((card, index) => {
            setTimeout(() => {
                this.loadProductPreview(card);
            }, index * 200); // Stagger by 200ms
        });
    }

    loadProductPreview(card) {
        const preview = card.querySelector('.product-preview');
        const placeholder = card.querySelector('.preview-placeholder');
        const productName = card.querySelector('.product-name').textContent;
        const productLink = card.querySelector('.product-link').href;
        
        // Simulate loading delay
        setTimeout(() => {
            // Create enhanced preview content
            const previewContent = this.createPreviewContent(productName, productLink);
            
            // Replace placeholder with loaded content
            placeholder.innerHTML = previewContent;
            
            // Remove loading state
            card.removeAttribute('data-loading');
            
            // Add loaded animation
            card.style.opacity = '0.8';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, 100);
            
        }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
    }

    createPreviewContent(productName, productLink) {
        // Extract product type for better preview
        const productType = this.getProductType(productName);
        const previewData = this.getPreviewData(productType);
        
         return `
             <div class="preview-loaded">
                 <div class="preview-icon-large">${previewData.icon}</div>
                 <div class="preview-info">
                     <div class="preview-brand">${previewData.brand}</div>
                 </div>
             </div>
         `;
    }

    getProductType(productName) {
        const name = productName.toLowerCase();
        // First trimester products
        if (name.includes('prenatal') || name.includes('vitamin')) return 'supplement';
        if (name.includes('water') || name.includes('bottle') && !name.includes('silicone')) return 'bottle';
        if (name.includes('tea') || name.includes('coffee')) return 'beverage';
        if (name.includes('ginger') || name.includes('candies')) return 'candy';
        if (name.includes('drops') || name.includes('b6')) return 'drops';
        if (name.includes('wristband') || name.includes('sea-band')) return 'wristband';
        if (name.includes('crackers')) return 'crackers';
        if (name.includes('bags') || name.includes('emesis')) return 'bags';
        if (name.includes('journal')) return 'journal';
        if (name.includes('prayer') || name.includes('devotional')) return 'devotional';
        if (name.includes('confetti') || name.includes('reveal')) return 'confetti';
        if (name.includes('frame') || name.includes('sonogram')) return 'frame';
        if (name.includes('folder') || name.includes('organizer') && !name.includes('fabric')) return 'organizer';
        
        // Second trimester products
        if (name.includes('leggings') || name.includes('maternity') && name.includes('secret')) return 'leggings';
        if (name.includes('nursing') || name.includes('bra')) return 'nursing_bra';
        if (name.includes('pillow') || name.includes('pregnancy pillow')) return 'pregnancy_pillow';
        if (name.includes('belt') || name.includes('support')) return 'support_belt';
        if (name.includes('compression') || name.includes('socks')) return 'compression_socks';
        if (name.includes('yoga') || name.includes('mat')) return 'yoga_mat';
        if (name.includes('resistance') || name.includes('bands')) return 'resistance_bands';
        if (name.includes('balance') || name.includes('ball')) return 'exercise_ball';
        if (name.includes('expecting') || name.includes('what to expect')) return 'pregnancy_book';
        if (name.includes('gown') || name.includes('dress')) return 'maternity_dress';
        if (name.includes('hangers') || name.includes('velvet')) return 'baby_hangers';
        if (name.includes('fabric') || name.includes('cubes')) return 'storage_cubes';
        if (name.includes('shower') || name.includes('decorations')) return 'baby_shower';
        if (name.includes('silicone') || name.includes('bottles')) return 'travel_bottles';
        
        // Third trimester products
        if (name.includes('bagsmart') || name.includes('duffel') || name.includes('hospital bag')) return 'hospital_bag';
        if (name.includes('toiletry') || name.includes('convenience kits')) return 'toiletry_kit';
        if (name.includes('ekouaer') || name.includes('nursing gown')) return 'nursing_gown';
        if (name.includes('always discreet') || name.includes('postpartum underwear')) return 'postpartum_underwear';
        if (name.includes('lansinoh') && name.includes('cream')) return 'nipple_cream';
        if (name.includes('lansinoh') && name.includes('pads')) return 'nursing_pads';
        if (name.includes('contigo') || name.includes('water bottle') && name.includes('straw')) return 'water_bottle_straw';
        if (name.includes('smead') || name.includes('expanding file')) return 'file_organizer';
        if (name.includes('thank-you') || name.includes('cards')) return 'thank_you_cards';
        if (name.includes('bassinet') || name.includes('airclub')) return 'bassinet';
        if (name.includes('brolex') || name.includes('bassinet sheets')) return 'bassinet_sheets';
        if (name.includes('changing pad') || name.includes('munchkin') && name.includes('pad')) return 'changing_pad';
        if (name.includes('diaper pail') || name.includes('munchkin') && name.includes('step')) return 'diaper_pail';
        if (name.includes('diaper caddy') || name.includes('parker baby')) return 'diaper_caddy';
        if (name.includes('car seat') || name.includes('graco') || name.includes('snugride')) return 'car_seat';
        if (name.includes('dreft') || name.includes('baby laundry')) return 'baby_detergent';
        if (name.includes('mesh') || name.includes('laundry bags')) return 'laundry_bags';
        if (name.includes('labels') || name.includes('nursery labels')) return 'nursery_labels';
        if (name.includes('meal prep') || name.includes('prepnaturals')) return 'meal_prep';
        if (name.includes('stasher') || name.includes('reusable') && name.includes('bags')) return 'reusable_bags';
        if (name.includes('attitude') || name.includes('cleaner')) return 'baby_safe_cleaner';
        if (name.includes('microfiber') || name.includes('cleaning cloths')) return 'cleaning_cloths';
        if (name.includes('tripod') || name.includes('sensyne')) return 'tripod';
        if (name.includes('diffuser') || name.includes('asakuki') || name.includes('aromatherapy')) return 'diffuser';
        
        if (name.includes('name') || name.includes('book')) return 'book';
        return 'general';
    }

    getPreviewData(type) {
         const previewData = {
             supplement: {
                 icon: '💊',
                 brand: 'THORNE'
             },
             bottle: {
                 icon: '💧',
                 brand: 'Nalgene'
             },
             beverage: {
                 icon: '🌿',
                 brand: 'Traditional Medicinals'
             },
             candy: {
                 icon: '🍬',
                 brand: 'The Ginger People'
             },
             drops: {
                 icon: '💊',
                 brand: 'Three Lollies'
             },
             wristband: {
                 icon: '⌚',
                 brand: 'Sea-Band'
             },
             crackers: {
                 icon: '🍪',
                 brand: 'Premium'
             },
             bags: {
                 icon: '🛍️',
                 brand: 'Medline'
             },
             journal: {
                 icon: '📖',
                 brand: 'Chronicle Books'
             },
             book: {
                 icon: '👶',
                 brand: 'Workman Publishing'
             },
             devotional: {
                 icon: '🙏',
                 brand: 'Revell'
             },
             confetti: {
                 icon: '🎊',
                 brand: 'Party Supplies'
             },
             frame: {
                 icon: '🖼️',
                 brand: 'Pearhead'
             },
             organizer: {
                 icon: '📁',
                 brand: 'Office Supplies'
             },
             // Second trimester product types
             leggings: {
                 icon: '👖',
                 brand: 'Motherhood Maternity'
             },
             nursing_bra: {
                 icon: '👙',
                 brand: 'HOFISH'
             },
             pregnancy_pillow: {
                 icon: '🛏️',
                 brand: 'Momcozy'
             },
             support_belt: {
                 icon: '🤱',
                 brand: 'AZMED'
             },
             compression_socks: {
                 icon: '🧦',
                 brand: 'CHARMKING'
             },
             yoga_mat: {
                 icon: '🧘',
                 brand: 'Gaiam'
             },
             resistance_bands: {
                 icon: '💪',
                 brand: 'Fit Simplify'
             },
             exercise_ball: {
                 icon: '⚽',
                 brand: 'Gaiam'
             },
             pregnancy_book: {
                 icon: '📚',
                 brand: 'Workman Publishing'
             },
             maternity_dress: {
                 icon: '👗',
                 brand: 'ChoiyuBella'
             },
             baby_hangers: {
                 icon: '👶',
                 brand: 'Amazon Basics'
             },
             storage_cubes: {
                 icon: '📦',
                 brand: 'Amazon Basics'
             },
             baby_shower: {
                 icon: '🎉',
                 brand: 'Aurasys'
             },
            travel_bottles: {
                icon: '🧴',
                brand: 'Gemice'
            },
            // Third trimester product types
            hospital_bag: {
                icon: '🎒',
                brand: 'BAGSMART'
            },
            toiletry_kit: {
                icon: '🧴',
                brand: 'Convenience Kits'
            },
            nursing_gown: {
                icon: '👗',
                brand: 'Ekouaer'
            },
            postpartum_underwear: {
                icon: '🩲',
                brand: 'Always Discreet'
            },
            nipple_cream: {
                icon: '🧴',
                brand: 'Lansinoh'
            },
            nursing_pads: {
                icon: '🤱',
                brand: 'Lansinoh'
            },
            water_bottle_straw: {
                icon: '💧',
                brand: 'Contigo'
            },
            file_organizer: {
                icon: '📁',
                brand: 'Smead'
            },
            thank_you_cards: {
                icon: '💌',
                brand: 'Thank You Cards'
            },
            bassinet: {
                icon: '🛏️',
                brand: 'AirClub'
            },
            bassinet_sheets: {
                icon: '🛏️',
                brand: 'BROLEX'
            },
            changing_pad: {
                icon: '👶',
                brand: 'Munchkin'
            },
            diaper_pail: {
                icon: '🗑️',
                brand: 'Munchkin'
            },
            diaper_caddy: {
                icon: '🧺',
                brand: 'Parker Baby'
            },
            car_seat: {
                icon: '🚗',
                brand: 'Graco'
            },
            baby_detergent: {
                icon: '🧺',
                brand: 'Dreft'
            },
            laundry_bags: {
                icon: '🧺',
                brand: 'Durable'
            },
            nursery_labels: {
                icon: '🏷️',
                brand: 'Talented Kitchen'
            },
            meal_prep: {
                icon: '🍱',
                brand: 'PrepNaturals'
            },
            reusable_bags: {
                icon: '🥪',
                brand: 'Stasher'
            },
            baby_safe_cleaner: {
                icon: '🧽',
                brand: 'ATTITUDE'
            },
            cleaning_cloths: {
                icon: '🧽',
                brand: 'Amazon Basics'
            },
            tripod: {
                icon: '📷',
                brand: 'Sensyne'
            },
            diffuser: {
                icon: '🌸',
                brand: 'ASAKUKI'
            },
            general: {
                icon: '🛍️',
                brand: 'Amazon'
            }
         };

        return previewData[type] || previewData.general;
    }

    enhanceProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Add click tracking only
            const productLink = card.querySelector('.product-link');
            if (productLink) {
                productLink.addEventListener('click', (e) => {
                    // Optional: Add analytics tracking here
                    console.log('Product clicked:', card.querySelector('.product-name').textContent);
                });
            }
        });
    }

    addSmoothScrolling() {
        // Add smooth scrolling for any internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Enhanced CSS for loaded previews
const enhancedStyles = `
    .preview-loaded {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 20px;
        position: relative;
    }

    .preview-icon-large {
        font-size: 3.5rem;
        margin-bottom: 12px;
        animation: bounceIn 0.6s ease;
    }

     .preview-info {
         display: flex;
         flex-direction: column;
         gap: 4px;
         margin-bottom: 10px;
     }

     .preview-brand {
         font-weight: 600;
         font-size: 0.9rem;
         color: var(--dark-brown);
     }

    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }

    .product-card:not([data-loading="true"]) .preview-placeholder {
        animation: none;
    }
`;

// Add enhanced styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedStyles;
document.head.appendChild(styleSheet);

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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductPreviewLoader();
    new MobileMenu();
});

// Add intersection observer for performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe product cards for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});
