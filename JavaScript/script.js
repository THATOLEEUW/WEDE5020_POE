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

    //  Check if the store is currently open
    const savedStoreState = localStorage.getItem('isStoreOpen');
    // If 'isStoreOpen' is explicitly saved as 'false', block orders
    if (savedStoreState === 'false') {
        alert('Sorry! Chillax Klerksdorp is currently paused or closed for new orders.');
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const methodInput = document.getElementById('fulfillment-type');
    const addressInput = document.getElementById('cust-address');
    const notesInput = document.getElementById('cust-notes');

    const name = nameInput.value;
    const phone = phoneInput.value;
    const method = methodInput.value;
    const address = addressInput.value;
    const notes = notesInput.value;

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

    // Open WhatsApp with order details
    window.open(`https://wa.me/27820000000?text=${encodeURIComponent(message)}`, '_blank');

    // Clear cart and reset form inputs
    saveCart([]);
    nameInput.value = '';
    phoneInput.value = '';
    if (addressInput) addressInput.value = '';
    if (notesInput) notesInput.value = '';

    // Update the checkout summary UI
    if (document.getElementById('checkout-summary-list')) {
        renderCheckoutSummary();
    }
}

// Order Tracker (index.html)
function trackOrder() {
    const statusIcon = "\u{1F7E2}";
    const input = document.getElementById('track-input').value;
    const result = document.getElementById('track-result');
    if (input.trim() === '') {
        result.innerText = 'Please enter a valid order number.';
        return;
    }
    result.innerText = `Order #${input}: [Preparing] ${statusIcon} - Expected ready in 20 mins.`;
}

// Enquiry Form Submission (contact.html)
const form = document.getElementById('enquiryForm');
const fullName = document.getElementById('fullName');
const emailAddress = document.getElementById('emailAddress');
const messageText = document.getElementById('messageText');

const nameMessage = document.getElementById('nameMessage');
const emailMessage = document.getElementById('emailMessage');
const textAreaMessage = document.getElementById('textAreaMessage');
const formSuccessMessage = document.getElementById('formSuccessMessage');

form.addEventListener('submit', function(event) {
  // Stop the form from submitting automatically
  event.preventDefault();

  // Reset all previous messages
  nameMessage.textContent = '';
  emailMessage.textContent = '';
  textAreaMessage.textContent = '';
  formSuccessMessage.textContent = '';

  let isValid = true;
  const nameValue = fullName.value.trim();
  const alphabeticPattern = /^[A-Za-z\s]+$/;
  
  //  Validate Full Name
  if (nameValue === '') {
    nameMessage.textContent = 'Error: Please enter your full name.';
    isValid = false;
  } else if (!alphabeticPattern.test(nameValue)) {
    nameMessage.textContent = 'Error: Please enter a valid full name (letters and spaces only).';
    isValid = false;
  }

  //  Validate Email Address
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailAddress.value.trim() === '') {
    emailMessage.textContent = 'Error: Email address cannot be left blank.';
    isValid = false;
  } else if (!emailPattern.test(emailAddress.value.trim())) {
    emailMessage.textContent = 'Error: Please enter a valid email format (e.g., name@example.com).';
    isValid = false;
  }

  //  Validate Message Textarea
  if (messageText.value.trim() === '') {
    textAreaMessage.textContent = 'Error: Please include a message for your inquiry.';
    isValid = false;
  }

  // If everything passes validation, show success message
  if (isValid) {
    formSuccessMessage.textContent = 'Thank you for your inquiry! We will contact you shortly.';
    formSuccessMessage.className = 'success-message';
    
    // Clear the form inputs after successful submission
    form.reset();
  }
});

// Admin Item Stock Toggle (admin.html)
function toggleItemStock(buttonElement) {
    // Find the table row (<tr>) that contains the clicked button
    const row = buttonElement.closest('tr');
    
    // Find the status badge inside that specific row
    const badge = row.querySelector('.item-status');
    
    if (badge) {
        // Check current text and flip it
        if (badge.innerText.trim() === 'In Stock') {
            badge.innerText = 'Out of Stock';
            badge.className = 'badge badge-closed item-status';
        } else {
            badge.innerText = 'In Stock';
            badge.className = 'badge badge-open item-status';
        }
    }
}

// Store Status Toggle (admin.html)
function toggleStoreStatus() {
    // Get current state from localStorage (default to true if not set)
    let isStoreOpen = localStorage.getItem('isStoreOpen') !== 'false';
    
    // Flip the state
    isStoreOpen = !isStoreOpen;

    // Save the new state to localStorage
    localStorage.setItem('isStoreOpen', isStoreOpen);

    // Update the badge display on the admin page
    updateStoreStatusBadge(isStoreOpen);
}

function updateStoreStatusBadge(isOpen) {
    const badge = document.getElementById('store-status-badge');
    if (badge) {
        badge.className = isOpen ? 'badge badge-open' : 'badge badge-closed';
        badge.innerText = isOpen ? 'OPEN FOR ORDERS' : 'PAUSED / CLOSED';
    }
}

// Runs when the admin page loads to show the correct status badge
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('store-status-badge')) {
        const savedStoreState = localStorage.getItem('isStoreOpen');
        const isOpen = savedStoreState !== 'false'; // defaults to true if null
        updateStoreStatusBadge(isOpen);
    }
});