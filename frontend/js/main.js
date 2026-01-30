// Main Application Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize
    await loadFeaturedProducts();
    await loadCategories();
    updateCartCount();
    updateWishlistCount();
    setupEventListeners();
});

// Update Wishlist Count
async function updateWishlistCount() {
    const el = document.getElementById('wishlistCount');
    if (!el || !AuthManager.isLoggedIn()) {
        if (el) el.textContent = '0';
        return;
    }
    try {
        const res = await API.getWishlist();
        el.textContent = res.count || 0;
    } catch (err) { console.error(err); }
}

// Load Featured Products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const response = await API.getProducts({ limit: 4 });
        const products = response.data;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No products available</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" onclick="viewProduct(${product.id})" style="position: relative;">
                <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                    <i class="far fa-heart"></i>
                </button>
                <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${Utils.formatPrice(product.price)}</div>
                    <div class="product-rating">
                        <span class="stars">${Utils.generateStars(product.rating || 0)}</span>
                        <span class="reviews-count">(${product.reviews_count || 0} Reviews)</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Check which items are in wishlist
        if (AuthManager.isLoggedIn()) {
            const res = await API.getWishlist();
            const wishlistIds = res.data.map(i => i.product_id);
            container.querySelectorAll('.product-card').forEach((card, index) => {
                if (wishlistIds.includes(products[index].id)) {
                    const btn = card.querySelector('.wishlist-btn');
                    btn.classList.add('active');
                    btn.querySelector('i').className = 'fas fa-heart';
                    btn.querySelector('i').style.color = 'var(--primary-red)';
                }
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="text-center text-danger">Failed to load products</p>';
    }
}

async function toggleWishlist(productId, btn) {
    if (!AuthManager.isLoggedIn()) {
        Toast.error('Please login to use wishlist');
        return;
    }
    const isActive = btn.classList.contains('active');
    try {
        if (isActive) {
            await API.removeFromWishlist(productId);
            btn.classList.remove('active');
            btn.querySelector('i').className = 'far fa-heart';
            btn.querySelector('i').style.color = '';
            Toast.success('Removed from wishlist');
        } else {
            await API.addToWishlist(productId);
            btn.classList.add('active');
            btn.querySelector('i').className = 'fas fa-heart';
            btn.querySelector('i').style.color = 'var(--primary-red)';
            Toast.success('Added to wishlist');
        }
        updateWishlistCount();
    } catch (err) { Toast.error(err.message); }
}

// Load Categories
async function loadCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    try {
        const response = await API.getCategories();
        const categories = response.data;

        container.innerHTML = categories.map(category => `
            <div class="product-card" onclick="viewCategory(${category.id})" style="cursor: pointer;">
                <div style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-tag" style="font-size: 4rem; color: white;"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${category.name}</h3>
                    <p class="text-muted">${category.description || 'Browse products'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Add to Cart
async function addToCart(productId) {
    if (!AuthManager.isLoggedIn()) {
        Toast.error('Please login to add items to cart');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    try {
        await API.addToCart(productId, 1);
        Toast.success('Product added to cart!');
        updateCartCount();
    } catch (error) {
        Toast.error(error.message || 'Failed to add to cart');
    }
}

// Update Cart Count
async function updateCartCount() {
    const cartCountEl = document.getElementById('cartCount');

    if (!AuthManager.isLoggedIn()) {
        if (cartCountEl) cartCountEl.textContent = '0';
        return;
    }

    try {
        const response = await API.getCart();
        if (cartCountEl) cartCountEl.textContent = response.count || 0;
    } catch (error) {
        console.error('Error updating cart count:', error);
        if (cartCountEl) cartCountEl.textContent = '0';
    }
}

// View Product Details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// View Category
function viewCategory(categoryId) {
    window.location.href = `shop.html?category=${categoryId}`;
}

// Setup Event Listeners
function setupEventListeners() {
    // Cart Button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (!AuthManager.isLoggedIn()) {
                Toast.error('Please login to view cart');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            window.location.href = 'cart.html';
        });
    }

    // Search Button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const search = prompt('Search for products:');
            if (search) {
                window.location.href = `shop.html?search=${encodeURIComponent(search)}`;
            }
        });
    }


    // Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Hero Carousel (Simple implementation)
let currentSlide = 0;
const slides = [
    {
        title: 'Big Sale<br>Up to 50% Off',
        subtitle: 'Premium smartwatches with advanced features',
        image: 'images/hero-watch.png'
    },
    {
        title: 'New Arrivals<br>Latest Tech',
        subtitle: 'Discover the newest gadgets and accessories',
        image: 'images/hero-headphones.png'
    },
    {
        title: 'Free Shipping<br>On Orders $100+',
        subtitle: 'Shop now and save on delivery',
        image: 'images/hero-gaming.png'
    }
];

function updateHeroSlide() {
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.getElementById('heroImage');
    const dots = document.querySelectorAll('.dot');

    if (heroContent && heroImage) {
        const slide = slides[currentSlide];
        heroContent.querySelector('.hero-title').innerHTML = slide.title;
        heroContent.querySelector('.hero-subtitle').textContent = slide.subtitle;
        heroImage.src = slide.image;

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
}

// Auto-rotate carousel
setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateHeroSlide();
}, 5000);

// Manual carousel control
document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateHeroSlide();
    });
});
