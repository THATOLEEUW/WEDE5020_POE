// State Management via LocalStorage
function getCart() {
    return JSON.parse(localStorage.getItem('chillax_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('chillax_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('nav-cart-count');
    if (badge) badge.innerText = count;
}

function addToCart(name, price) {
    let cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart(cart);
    
    if (window.location.pathname.includes('menu.html')) {
        renderCartSidebar();
    }
    alert(`${name} added to cart!`);
}

// Mobile Nav Toggle
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenuBar = document.getElementById('nav-menu-bar');
    if (mobileBtn && navMenuBar) {
        mobileBtn.addEventListener('click', () => {
            navMenuBar.classList.toggle('active');
        });
    }

    // Carousel Setup (home.html)
    if (document.querySelector('.carousel-container')) {
        initCarousel();
    }

    // Menu Sidebar Setup (menu.html)
    if (document.getElementById('cart-items-container')) {
        renderCartSidebar();
    }

    // Checkout Setup (checkout.html)
    if (document.getElementById('checkout-summary-list')) {
        renderCheckoutSummary();
    }
});

// Carousel Functions
let slideIndex = 0;
let carouselTimer;

function initCarousel() {
    showSlide(slideIndex);
    startAutoSlide();
}

function changeSlide(n) {
    showSlide(slideIndex += n);
    resetAutoSlide();
}

function setSlide(n) {
    showSlide(slideIndex = n);
    resetAutoSlide();
}

function showSlide(n) {
    const slides = document.getElementsByClassName('carousel-slide');
    const dots = document.getElementsByClassName('dot');
    if (!slides.length) return;

    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    for (let i = 0; i < slides.length; i++) slides[i].classList.remove('active');
    for (let i = 0; i < dots.length; i++) dots[i].classList.remove('active');

    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
}

function startAutoSlide() {
    carouselTimer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(carouselTimer);
    startAutoSlide();
}

// Search Filter (menu.html)
function filterMenu() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const items = document.querySelectorAll('.menu-item-card');
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
}

// Render Menu Sidebar
function renderCartSidebar() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    if (!container || !totalEl) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color: #666;">Your cart is currently empty.</p>';
        totalEl.innerText = 'R0.00';
        return;
    }

    // Generate and display the HTML content for a shopping cart summary
    let html = '';
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>R${item.price}.00 x ${item.qty}</small>
                </div>
                <div><strong>R${subtotal}.00</strong></div>
            </div>`;
    });
    container.innerHTML = html;
    totalEl.innerText = `R${total}.00`;
}

// Render Checkout Page
function renderCheckoutSummary() {
    const cart = getCart();
    const summaryList = document.getElementById('checkout-summary-list');
    if (!summaryList) return;

    if (cart.length === 0) {
        summaryList.innerHTML = '<p style="color: #666;">No items in cart.</p>';
    } else {
        let html = '';
        cart.forEach(item => {
            html += `<p style="display: flex; justify-content: space-between;"><span>${item.qty}x ${item.name}</span><span>R${item.price * item.qty}.00</span></p>`;
        });
        summaryList.innerHTML = html;
    }
    calculateCheckoutTotal();
}

function calculateCheckoutTotal() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fulfillment = document.getElementById('fulfillment-type') ? document.getElementById('fulfillment-type').value : 'Collection';
    const deliveryFee = fulfillment === 'Delivery' ? 25 : 0;
    const grandTotal = subtotal + deliveryFee;

    if (document.getElementById('summary-subtotal')) document.getElementById('summary-subtotal').innerText = `R${subtotal}.00`;
    if (document.getElementById('summary-delivery')) document.getElementById('summary-delivery').innerText = `R${deliveryFee}.00`;
    if (document.getElementById('summary-total')) document.getElementById('summary-total').innerText = `R${grandTotal}.00`;
}

function submitWhatsAppOrder(event) {
    event.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const method = document.getElementById('fulfillment-type').value;
    const address = document.getElementById('cust-address').value;
    const notes = document.getElementById('cust-notes').value;

    let itemsText = '';
    let subtotal = 0;
    cart.forEach(item => {
        itemsText += `- ${item.qty}x ${item.name} (R${item.price * item.qty})\n`;
        subtotal += item.price * item.qty;
    });

    const deliveryFee = method === 'Delivery' ? 25 : 0;
    const total = subtotal + deliveryFee;

    const message = `*NEW ORDER - CHILLAX KLERKSDORP*\n\n` +
        `*Customer:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Method:* ${method}\n` +
        (method === 'Delivery' ? `*Address:* ${address}\n` : '') +
        `*Notes:* ${notes || 'None'}\n\n` +
        `*Order Items:*\n${itemsText}\n` +
        `*Subtotal:* R${subtotal}\n` +
        `*Delivery Fee:* R${deliveryFee}\n` +
        `*Total Due:* R${total}`;

    window.open(`https://wa.me/27820000000?text=${encodeURIComponent(message)}`, '_blank');
}

// Order Tracker (index.html)
function trackOrder() {
    const input = document.getElementById('track-input').value;
    const result = document.getElementById('track-result');
    if (input.trim() === '') {
        result.innerText = 'Please enter a valid order number.';
        return;
    }
    result.innerText = `Order #${input}: [Preparing] 🟢 - Expected ready in 20 mins.`;
}

// Store Status Toggle (admin.html)
let isStoreOpen = true;
function toggleStoreStatus() {
    isStoreOpen = !isStoreOpen;
    const badge = document.getElementById('store-status-badge');
    if (badge) {
        badge.className = isStoreOpen ? 'badge badge-open' : 'badge badge-closed';
        badge.innerText = isStoreOpen ? 'OPEN FOR ORDERS' : 'PAUSED / CLOSED';
    }
}
