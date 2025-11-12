/**
 * Facebook Pixel Event Tracking
 * Production-ready tracking for purchases and conversions
 * 
 * Events tracked:
 * - PageView (automatic via base Pixel code)
 * - InitiateCheckout (when user clicks Lemon Squeezy buy buttons)
 * - Purchase (when purchase is completed on Lemon Squeezy)
 */

// Product mapping with prices and IDs
const PRODUCTS = {
    '4fa282f9-869b-4246-99c0-1398396274ec': {
        name: 'Ultimate Pregnancy Kit Bundle',
        value: 19.99,
        content_id: 'bundle',
        content_name: 'Ultimate Pregnancy Kit Bundle',
        content_category: 'Bundle'
    },
    '964ae0b7-b9e7-4034-8b7d-369c1cceadea': {
        name: 'Ultimate Pregnancy Planner',
        value: 14.99,
        content_id: 'planner',
        content_name: 'Ultimate Pregnancy Planner',
        content_category: 'Planner'
    },
    '6f6b3354-ac9a-490e-8d19-4d6e98182585': {
        name: 'Pregnancy Made Simple eBook',
        value: 9.99,
        content_id: 'ebook',
        content_name: 'Pregnancy Made Simple eBook',
        content_category: 'eBook'
    }
};

// Currency
const CURRENCY = 'USD';

/**
 * Track InitiateCheckout event
 * Triggered when user clicks a Lemon Squeezy buy button
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
    } else {
        // Retry if fbq is not yet loaded
        console.warn('Facebook Pixel not loaded, retrying Purchase event...');
        setTimeout(() => {
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Purchase', params);
                console.log('Facebook Pixel: Purchase tracked (retry)', params);
            }
        }, 1000);
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
    
    // Also check for product ID in query parameters
    try {
        const urlObj = new URL(url);
        const productId = urlObj.searchParams.get('product_id') || 
                         urlObj.searchParams.get('variant_id') ||
                         urlObj.searchParams.get('checkout[product_id]') ||
                         urlObj.searchParams.get('checkout[variant_id]');
        if (productId) return productId;
    } catch (e) {
        // Not a valid URL, continue
    }
    
    return null;
}

/**
 * Store product ID with multiple fallback methods
 */
function storeProductId(productId, productName) {
    if (!productId) return;
    
    const timestamp = Date.now().toString();
    
    // Try sessionStorage first (preferred for same-session tracking)
    try {
        sessionStorage.setItem('ls_product_id', productId);
        sessionStorage.setItem('ls_product_name', productName);
        sessionStorage.setItem('ls_product_timestamp', timestamp);
    } catch (e) {
        // Fallback to localStorage if sessionStorage fails
        try {
            localStorage.setItem('ls_product_id', productId);
            localStorage.setItem('ls_product_name', productName);
            localStorage.setItem('ls_product_timestamp', timestamp);
        } catch (e2) {
            // Both failed, ignore
        }
    }
}

/**
 * Retrieve stored product ID with fallback
 */
function getStoredProductId() {
    let storedTimestamp = null;
    let storedProductId = null;
    
    // Try sessionStorage first
    try {
        storedTimestamp = sessionStorage.getItem('ls_product_timestamp');
        storedProductId = sessionStorage.getItem('ls_product_id');
    } catch (e) {
        // Fallback to localStorage
        try {
            storedTimestamp = localStorage.getItem('ls_product_timestamp');
            storedProductId = localStorage.getItem('ls_product_id');
        } catch (e2) {
            return null;
        }
    }
    
    if (storedTimestamp && storedProductId) {
        const age = Date.now() - parseInt(storedTimestamp);
        if (age < 3600000) { // 1 hour
            return storedProductId;
        } else {
            // Clean up expired data
            try {
                sessionStorage.removeItem('ls_product_id');
                sessionStorage.removeItem('ls_product_name');
                sessionStorage.removeItem('ls_product_timestamp');
                localStorage.removeItem('ls_product_id');
                localStorage.removeItem('ls_product_name');
                localStorage.removeItem('ls_product_timestamp');
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }
    
    return null;
}

/**
 * Clean up stored product ID
 */
function cleanupStoredProductId() {
    try {
        sessionStorage.removeItem('ls_product_id');
        sessionStorage.removeItem('ls_product_name');
        sessionStorage.removeItem('ls_product_timestamp');
        localStorage.removeItem('ls_product_id');
        localStorage.removeItem('ls_product_name');
        localStorage.removeItem('ls_product_timestamp');
    } catch (e) {
        // Ignore cleanup errors
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
        
        // If we can't find product ID in URL, try stored product ID
        if (!productId) {
            productId = getStoredProductId();
        }
        
        if (productId) {
            const orderId = urlParams.get('order_id') || 
                           urlParams.get('order_number') ||
                           urlParams.get('checkout[order_id]');
            trackPurchase(productId, orderId);
            purchaseTracked = true;
            
            // Clean up stored data
            cleanupStoredProductId();
            
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
            'view order',
            'woohoo',
            'receipt is on its way',
            'download',
            'your order',
            'order summary'
        ];

        const hasSuccessText = successTexts.some(text => pageText.includes(text));

        if (hasSuccessText) {
            // Try to extract product ID from various sources
            let productId = extractProductIdFromUrl(window.location.href) ||
                           extractProductIdFromUrl(document.referrer) ||
                           extractProductIdFromUrl(window.location.search);
            
            // If we can't find product ID in URL, try to get it from storage
            if (!productId) {
                productId = getStoredProductId();
            }
            
            // Also check for order number in URL or page content
            // Try multiple patterns for order ID extraction
            let orderId = null;
            
            // Pattern 1: From URL path (my-orders/{order-id})
            const urlOrderMatch = window.location.pathname.match(/my-orders\/([a-f0-9-]+)/i);
            if (urlOrderMatch) {
                orderId = urlOrderMatch[1];
            }
            
            // Pattern 2: From URL parameters
            if (!orderId) {
                const urlParams = new URLSearchParams(window.location.search);
                orderId = urlParams.get('order_id') || 
                         urlParams.get('order_number') ||
                         urlParams.get('checkout[order_id]');
            }
            
            // Pattern 3: From page text (Order #12345 or Order 12345)
            if (!orderId) {
                const textOrderMatch = pageText.match(/order\s*#?\s*(\d+)/i) ||
                                      pageText.match(/order\s*id[:\s]+([a-f0-9-]+)/i);
                if (textOrderMatch) {
                    orderId = textOrderMatch[1];
                }
            }

            if (productId && !purchaseTracked) {
                trackPurchase(productId, orderId);
                purchaseTracked = true;
                
                // Clean up stored product ID after successful tracking
                cleanupStoredProductId();
                
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
            '[class*="success"], [id*="success"], [class*="thank"], [id*="thank"], [class*="complete"], [id*="complete"], [class*="confirmation"], [id*="confirmation"], [class*="paid"], [id*="paid"]'
        );
        
        if (successElements.length > 0) {
            // Check if we're in a Lemon Squeezy context
            const lemonSqueezyIframe = document.querySelector('iframe[src*="lemonsqueezy"]');
            const isLemonSqueezyDomain = window.location.hostname.includes('lemonsqueezy');
            
            if (lemonSqueezyIframe || isLemonSqueezyDomain) {
                // Try to extract product info from page
                let productId = extractProductIdFromUrl(window.location.href) ||
                               extractProductIdFromUrl(document.referrer) ||
                               extractProductIdFromUrl(lemonSqueezyIframe?.src);
                
                // Fallback to stored product ID
                if (!productId) {
                    productId = getStoredProductId();
                }
                
                if (productId && !purchaseTracked) {
                    trackPurchase(productId);
                    purchaseTracked = true;
                    cleanupStoredProductId();
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
 * Initialize tracking for Lemon Squeezy buy buttons only
 */
function initializeButtonTracking() {
    // Track only Lemon Squeezy buy buttons (buttons that open checkout)
    document.querySelectorAll('a[href*="lemonsqueezy.com/buy"]').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href) return;

            const productId = extractProductIdFromUrl(href);
            const productName = this.textContent.trim() || 
                               this.querySelector('span')?.textContent.trim() ||
                               'Product';

            if (productId) {
                // Track InitiateCheckout (user is starting checkout)
                trackInitiateCheckout(productId, productName);
                
                // Store product ID for purchase tracking on Lemon Squeezy success page
                storeProductId(productId, productName);
            }
        });
    });
}

/**
 * Track scroll depth as custom event
 * Tracks user engagement by monitoring how far users scroll down the page
 */
function initializeScrollDepthTracking() {
    if (typeof fbq === 'undefined') return;

    const scrollMilestones = [25, 50, 75, 100]; // Percentage milestones
    const trackedMilestones = new Set(); // Track which milestones have been fired
    let maxScroll = 0; // Track maximum scroll depth reached

    const trackScrollDepth = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate scroll percentage
        const scrollableHeight = documentHeight - windowHeight;
        const scrollPercentage = scrollableHeight > 0 
            ? Math.round((scrollTop / scrollableHeight) * 100) 
            : 0;

        // Update max scroll
        maxScroll = Math.max(maxScroll, scrollPercentage);

        // Track milestones
        scrollMilestones.forEach(milestone => {
            if (scrollPercentage >= milestone && !trackedMilestones.has(milestone)) {
                trackedMilestones.add(milestone);
                
                const params = {
                    content_name: `Scroll Depth ${milestone}%`,
                    scroll_depth: milestone,
                    scroll_percentage: scrollPercentage,
                    page_url: window.location.href,
                    page_path: window.location.pathname
                };

                // Track as custom event
                fbq('trackCustom', 'ScrollDepth', params);
                console.log(`Facebook Pixel: Scroll Depth ${milestone}% tracked`, params);
            }
        });
    };

    // Throttle scroll events for better performance
    let scrollTimeout;
    const handleScroll = () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(trackScrollDepth, 100);
    };

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track initial scroll position
    trackScrollDepth();

    // Track on page unload (final scroll depth)
    window.addEventListener('beforeunload', () => {
        if (maxScroll > 0 && typeof fbq !== 'undefined') {
            const params = {
                content_name: 'Max Scroll Depth',
                max_scroll_depth: maxScroll,
                page_url: window.location.href,
                page_path: window.location.pathname
            };
            fbq('trackCustom', 'MaxScrollDepth', params);
        }
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

    // Detect purchase completion
    detectLemonSqueezyPurchase();

    // Initialize scroll depth tracking
    initializeScrollDepthTracking();

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
