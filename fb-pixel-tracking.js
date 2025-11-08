/**
 * Facebook Pixel Event Tracking
 * Comprehensive tracking for purchases and conversions
 */

// Product mapping with prices and IDs
const PRODUCTS = {
    '4fa282f9-869b-4246-99c0-1398396274ec': {
        name: 'Ultimate Pregnancy Kit Bundle',
        value: 34.99,
        content_id: 'bundle',
        content_name: 'Ultimate Pregnancy Kit Bundle',
        content_category: 'Bundle'
    },
    '964ae0b7-b9e7-4034-8b7d-369c1cceadea': {
        name: 'Ultimate Pregnancy Planner',
        value: 24.99,
        content_id: 'planner',
        content_name: 'Ultimate Pregnancy Planner',
        content_category: 'Planner'
    },
    '6f6b3354-ac9a-490e-8d19-4d6e98182585': {
        name: 'Pregnancy Made Simple eBook',
        value: 19.99,
        content_id: 'ebook',
        content_name: 'Pregnancy Made Simple eBook',
        content_category: 'eBook'
    }
};

// Currency
const CURRENCY = 'USD';

/**
 * Track ViewContent event
 * Triggered when viewing product pages or product sections
 */
function trackViewContent(productId = null, productName = null) {
    const params = {
        content_name: productName || 'Pregnancy Kit Products',
        content_category: 'Digital Products',
        currency: CURRENCY
    };

    if (productId && PRODUCTS[productId]) {
        const product = PRODUCTS[productId];
        params.content_ids = [product.content_id];
        params.value = product.value;
        params.content_name = product.content_name;
        params.content_category = product.content_category;
    }

    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', params);
        console.log('Facebook Pixel: ViewContent tracked', params);
    }
}

/**
 * Track AddToCart event
 * Triggered when user clicks a buy button
 */
function trackAddToCart(productId, productName = null) {
    if (!productId) return;

    const product = PRODUCTS[productId] || {
        name: productName || 'Product',
        value: 0,
        content_id: productId,
        content_name: productName || 'Product',
        content_category: 'Digital Product'
    };

    const params = {
        content_ids: [product.content_id],
        content_name: product.content_name,
        content_category: product.content_category,
        value: product.value,
        currency: CURRENCY
    };

    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', params);
        console.log('Facebook Pixel: AddToCart tracked', params);
    }
}

/**
 * Track InitiateCheckout event
 * Triggered when user starts checkout process
 */
function trackInitiateCheckout(productId, productName = null) {
    if (!productId) return;

    const product = PRODUCTS[productId] || {
        name: productName || 'Product',
        value: 0,
        content_id: productId,
        content_name: productName || 'Product',
        content_category: 'Digital Product'
    };

    const params = {
        content_ids: [product.content_id],
        content_name: product.content_name,
        content_category: product.content_category,
        value: product.value,
        currency: CURRENCY,
        num_items: 1
    };

    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', params);
        console.log('Facebook Pixel: InitiateCheckout tracked', params);
    }
}

/**
 * Track Purchase event
 * Triggered when purchase is completed
 */
function trackPurchase(productId, orderId = null, productName = null) {
    if (!productId) return;

    const product = PRODUCTS[productId] || {
        name: productName || 'Product',
        value: 0,
        content_id: productId,
        content_name: productName || 'Product',
        content_category: 'Digital Product'
    };

    const params = {
        content_ids: [product.content_id],
        content_name: product.content_name,
        content_category: product.content_category,
        value: product.value,
        currency: CURRENCY,
        num_items: 1
    };

    if (orderId) {
        params.order_id = orderId;
    }

    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', params);
        console.log('Facebook Pixel: Purchase tracked', params);
    }
}

/**
 * Extract product ID from Lemon Squeezy URL
 */
function extractProductIdFromUrl(url) {
    if (!url) return null;
    
    // Match pattern: /buy/{product-id}
    const match = url.match(/\/buy\/([a-f0-9-]+)/i);
    if (match && match[1]) {
        return match[1];
    }
    
    return null;
}

/**
 * Track Lead event
 * Triggered when user shows intent to purchase
 */
function trackLead(productId = null) {
    const params = {
        content_category: 'Digital Products',
        currency: CURRENCY
    };

    if (productId && PRODUCTS[productId]) {
        const product = PRODUCTS[productId];
        params.content_ids = [product.content_id];
        params.content_name = product.content_name;
        params.value = product.value;
    }

    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', params);
        console.log('Facebook Pixel: Lead tracked', params);
    }
}

/**
 * Detect Lemon Squeezy purchase completion
 * Monitors for thank you page or success indicators
 */
let purchaseTracked = false; // Prevent duplicate tracking

function detectLemonSqueezyPurchase() {
    if (purchaseTracked) return false;

    // Method 1: Check URL for success indicators
    const currentUrl = window.location.href;
    const hostname = window.location.hostname.toLowerCase();
    const isLemonSqueezyDomain = hostname.includes('lemonsqueezy.com');
    
    const successPatterns = [
        /checkout\/success/i,
        /thank.?you/i,
        /order\/success/i,
        /payment\/success/i,
        /success/i,
        /confirmation/i,
        /complete/i,
        /my-orders/i  // Lemon Squeezy orders page
    ];

    // Special case: Lemon Squeezy checkout page (pregnancykit.lemonsqueezy.com/checkout)
    // This is the success page even though URL doesn't have "success" in it
    const isCheckoutSuccessPage = isLemonSqueezyDomain && 
                                   (currentUrl.includes('/checkout') || 
                                    currentUrl.includes('/my-orders'));

    // Check if current page is a success page
    const isSuccessPage = successPatterns.some(pattern => pattern.test(currentUrl)) || 
                         isCheckoutSuccessPage;
    
    if (isSuccessPage) {
        // Try to extract product ID from URL parameters or referrer
        const urlParams = new URLSearchParams(window.location.search);
        let productId = urlParams.get('product_id') || 
                       urlParams.get('variant_id') ||
                       urlParams.get('checkout[product_id]') ||
                       urlParams.get('checkout[variant_id]') ||
                       extractProductIdFromUrl(document.referrer) ||
                       extractProductIdFromUrl(currentUrl);
        
        // If we can't find product ID in URL, try sessionStorage
        if (!productId) {
            try {
                const storedTimestamp = sessionStorage.getItem('ls_product_timestamp');
                const storedProductId = sessionStorage.getItem('ls_product_id');
                
                if (storedTimestamp && storedProductId) {
                    const age = Date.now() - parseInt(storedTimestamp);
                    if (age < 3600000) { // 1 hour
                        productId = storedProductId;
                    }
                }
            } catch (e) {
                // Ignore errors
            }
        }
        
        if (productId) {
            const orderId = urlParams.get('order_id') || 
                           urlParams.get('order_number') ||
                           urlParams.get('checkout[order_id]');
            trackPurchase(productId, orderId);
            purchaseTracked = true;
            
            // Clean up stored data
            try {
                sessionStorage.removeItem('ls_product_id');
                sessionStorage.removeItem('ls_product_name');
                sessionStorage.removeItem('ls_product_timestamp');
            } catch (e) {
                // Ignore cleanup errors
            }
            
            return true;
        }
    }

    // Method 2: Listen for Lemon Squeezy postMessage events
    window.addEventListener('message', function(event) {
        if (purchaseTracked) return;
        
        // Lemon Squeezy sends events via postMessage
        if (event.data && typeof event.data === 'object') {
            // Check for various Lemon Squeezy checkout completion events
            const isCheckoutSuccess = 
                event.data.type === 'lemonsqueezy:checkout:success' || 
                event.data.event === 'CheckoutCompleted' ||
                event.data.type === 'checkout:success' ||
                event.data.type === 'lemonsqueezy:checkout:complete' ||
                (event.data.type && event.data.type.includes('success')) ||
                (event.data.event && event.data.event.includes('Complete'));
            
            if (isCheckoutSuccess) {
                const productId = event.data.product_id || 
                                event.data.variant_id ||
                                event.data.checkout?.product_id ||
                                event.data.checkout?.variant_id ||
                                extractProductIdFromUrl(event.data.url || window.location.href);
                
                const orderId = event.data.order_id || 
                               event.data.order_number ||
                               event.data.checkout?.order_id;
                
                if (productId) {
                    trackPurchase(productId, orderId);
                    purchaseTracked = true;
                }
            }
        }
    });

    // Method 3: Monitor for Lemon Squeezy checkout completion via URL hash
    // Lemon Squeezy sometimes uses URL hash for success state
    if (window.location.hash) {
        const hash = window.location.hash.toLowerCase();
        if (hash.includes('success') || hash.includes('complete') || hash.includes('thank')) {
            const productId = extractProductIdFromUrl(window.location.href) ||
                             extractProductIdFromUrl(document.referrer);
            if (productId && !purchaseTracked) {
                trackPurchase(productId);
                purchaseTracked = true;
                return true;
            }
        }
    }

    // Method 4: DOM-based detection for success indicators
    // Check for success text/content on Lemon Squeezy pages
    const checkLemonSqueezySuccessContent = () => {
        if (purchaseTracked) return false;

        const hostname = window.location.hostname.toLowerCase();
        const isLemonSqueezyDomain = hostname.includes('lemonsqueezy.com');
        
        if (!isLemonSqueezyDomain) return false;

        // Look for success text in page content
        const pageText = document.body?.innerText?.toLowerCase() || '';
        const successTexts = [
            'thanks for your order',
            'thank you for your order',
            'payment was successful',
            'order is complete',
            'order complete',
            'status: paid',
            'order #',
            'view order'
        ];

        const hasSuccessText = successTexts.some(text => pageText.includes(text));

        if (hasSuccessText) {
            // Try to extract product ID from various sources
            let productId = extractProductIdFromUrl(window.location.href) ||
                           extractProductIdFromUrl(document.referrer) ||
                           extractProductIdFromUrl(window.location.search);
            
            // If we can't find product ID in URL, try to get it from sessionStorage
            // (stored when user clicked buy button)
            if (!productId) {
                try {
                    const storedTimestamp = sessionStorage.getItem('ls_product_timestamp');
                    const storedProductId = sessionStorage.getItem('ls_product_id');
                    
                    // Only use stored product ID if it's less than 1 hour old
                    if (storedTimestamp && storedProductId) {
                        const age = Date.now() - parseInt(storedTimestamp);
                        if (age < 3600000) { // 1 hour in milliseconds
                            productId = storedProductId;
                        } else {
                            // Clean up expired data
                            sessionStorage.removeItem('ls_product_id');
                            sessionStorage.removeItem('ls_product_name');
                            sessionStorage.removeItem('ls_product_timestamp');
                        }
                    }
                } catch (e) {
                    console.log('Could not read product ID from sessionStorage:', e);
                }
            }
            
            // Also check for order number in URL or page content
            const orderMatch = window.location.pathname.match(/my-orders\/([a-f0-9-]+)/i) ||
                              pageText.match(/order\s*#?\s*(\d+)/i);
            const orderId = orderMatch ? orderMatch[1] : null;

            if (productId && !purchaseTracked) {
                trackPurchase(productId, orderId);
                purchaseTracked = true;
                
                // Clean up stored product ID after successful tracking
                try {
                    sessionStorage.removeItem('ls_product_id');
                    sessionStorage.removeItem('ls_product_name');
                    sessionStorage.removeItem('ls_product_timestamp');
                } catch (e) {
                    // Ignore cleanup errors
                }
                
                return true;
            }
        }

        return false;
    };

    // Check immediately
    if (checkLemonSqueezySuccessContent()) {
        return true;
    }

    // Method 5: Monitor for Lemon Squeezy iframe completion and DOM changes
    // Check if Lemon Squeezy checkout modal/iframe exists
    const checkLemonSqueezyCheckout = setInterval(() => {
        if (purchaseTracked) {
            clearInterval(checkLemonSqueezyCheckout);
            return;
        }

        // Check for success content
        if (checkLemonSqueezySuccessContent()) {
            clearInterval(checkLemonSqueezyCheckout);
            return;
        }

        // Look for success indicators in the DOM
        const successElements = document.querySelectorAll(
            '[class*="success"], [id*="success"], [class*="thank"], [id*="thank"], [class*="complete"], [id*="complete"], [class*="confirmation"], [id*="confirmation"]'
        );
        
        if (successElements.length > 0) {
            // Check if we're in a Lemon Squeezy context
            const lemonSqueezyIframe = document.querySelector('iframe[src*="lemonsqueezy"]');
            const isLemonSqueezyDomain = window.location.hostname.includes('lemonsqueezy');
            
            if (lemonSqueezyIframe || isLemonSqueezyDomain) {
                // Try to extract product info from page
                const productId = extractProductIdFromUrl(window.location.href) ||
                                 extractProductIdFromUrl(document.referrer) ||
                                 extractProductIdFromUrl(lemonSqueezyIframe?.src);
                
                if (productId && !purchaseTracked) {
                    trackPurchase(productId);
                    purchaseTracked = true;
                    clearInterval(checkLemonSqueezyCheckout);
                }
            }
        }
    }, 1000);

    // Stop checking after 60 seconds
    setTimeout(() => {
        clearInterval(checkLemonSqueezyCheckout);
    }, 60000);

    return isSuccessPage;
}

/**
 * Initialize tracking for all buy buttons
 */
function initializeButtonTracking() {
    // Track all Lemon Squeezy buy buttons
    document.querySelectorAll('a[href*="lemonsqueezy.com/buy"], .lemonsqueezy-button, [class*="lemonsqueezy"]').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href) return;

            const productId = extractProductIdFromUrl(href);
            const productName = this.textContent.trim() || 
                               this.querySelector('span')?.textContent.trim() ||
                               'Product';

            if (productId) {
                // Track AddToCart when clicking buy button
                trackAddToCart(productId, productName);
                
                // Track InitiateCheckout (user is starting checkout)
                trackInitiateCheckout(productId, productName);
                
                // Also track as Lead (showing purchase intent)
                trackLead(productId);
                
                // Store product ID for purchase tracking on Lemon Squeezy success page
                // This helps us track purchases even when we can't extract product ID from URL
                try {
                    sessionStorage.setItem('ls_product_id', productId);
                    sessionStorage.setItem('ls_product_name', productName);
                    // Store timestamp to expire after 1 hour
                    sessionStorage.setItem('ls_product_timestamp', Date.now().toString());
                } catch (e) {
                    console.log('Could not store product ID in sessionStorage:', e);
                }
            }
        });
    });

    // Track CTA buttons that scroll to checkout
    document.querySelectorAll('[onclick*="scrollToCheckout"], .cta-button, .cta-button-large, .cta-button-hero').forEach(button => {
        button.addEventListener('click', function() {
            // Track as Lead when user shows intent
            trackLead();
        });
    });
}

/**
 * Track product views on products page
 */
function initializeProductViewTracking() {
    // Track when viewing products page
    if (window.location.pathname.includes('products.html') || 
        window.location.pathname.includes('products')) {
        trackViewContent();
    }

    // Track individual product card views (when scrolled into view)
    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const productCard = entry.target;
                const productLink = productCard.querySelector('a[href*="amazon"]');
                if (productLink) {
                    const productName = productCard.querySelector('.product-name')?.textContent;
                    trackViewContent(null, productName);
                    productObserver.unobserve(productCard);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.product-card').forEach(card => {
        productObserver.observe(card);
    });
}

/**
 * Initialize all tracking
 */
function initializeFacebookPixelTracking() {
    // Wait for Facebook Pixel to load
    if (typeof fbq === 'undefined') {
        // Retry after a short delay
        setTimeout(initializeFacebookPixelTracking, 500);
        return;
    }

    // Initialize button tracking
    initializeButtonTracking();

    // Initialize product view tracking
    initializeProductViewTracking();

    // Detect purchase completion
    detectLemonSqueezyPurchase();

    // Track page views for specific sections
    if (window.location.hash) {
        const hash = window.location.hash;
        if (hash === '#bundle-checkout' || hash === '#checkout') {
            trackLead();
        }
    }

    console.log('Facebook Pixel tracking initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFacebookPixelTracking);
} else {
    initializeFacebookPixelTracking();
}

// Re-initialize tracking after navigation (for SPA-like behavior)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Reset purchase tracking flag on navigation
        purchaseTracked = false;
        setTimeout(() => {
            detectLemonSqueezyPurchase();
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });

// Also listen for popstate events (back/forward navigation)
window.addEventListener('popstate', () => {
    purchaseTracked = false;
    setTimeout(() => {
        detectLemonSqueezyPurchase();
    }, 500);
});

