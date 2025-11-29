
// Configuration
const WHATSAPP_NUMBER = "7201800959";
const PRODUCTS_URL = 'products.json';
let globalProducts = []; // Cache products for Quick View
let currentRentProduct = null; // Store product for rent modal

// --- Utils ---

// Handle Button Click with Spinner
function handleAction(btn, url, openInNewTab = false) {
    if (btn.querySelector('.btn-spinner')) return; // Already loading

    const originalText = btn.innerHTML;
    const width = btn.offsetWidth;
    btn.style.width = `${width}px`; // Fix width to prevent jumping
    btn.innerHTML = `<span class="btn-spinner"></span> Processing...`;
    btn.classList.add('cursor-wait', 'opacity-90');

    setTimeout(() => {
        if (openInNewTab) {
            window.open(url, '_blank');
            // Reset button after a short delay since the page didn't unload
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('cursor-wait', 'opacity-90');
                btn.style.width = '';
            }, 1000);
        } else {
            window.location.href = url;
        }
    }, 600); // 600ms simulated delay for effect
}

// Fetch Products
async function fetchProducts() {
    try {
        if (globalProducts.length > 0) return globalProducts;
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) throw new Error('Failed to load products');
        globalProducts = await response.json();
        return globalProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Render Product Card
function createProductCard(product, index = 0) {
    // Lazy load images if they are not in the top 4 (approx above the fold)
    const loadingAttr = index > 3 ? 'lazy' : 'eager';
    
    const statusBadge = product.available 
        ? `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 text-green-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Available</div>`
        : `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-stone-900/90 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Booked</div>`;

    return `
        <div class="group relative block h-full">
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full hover-lift">
                <!-- Image Container: object-contain with padding -->
                <div class="relative aspect-[3/4] bg-stone-50 cursor-pointer overflow-hidden" onclick="window.location.href='detail.html?id=${product.id}'">
                    <img loading="${loadingAttr}" src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-2 md:p-3 transform group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    ${statusBadge}
                    
                    <!-- Quick View Button (Hidden on mobile usually, distinct on desktop) -->
                    <button onclick="openQuickView(event, '${product.id}')" class="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-brand-600 font-bold px-5 py-2 rounded-full shadow-lg hover:bg-brand-50 z-20 text-xs whitespace-nowrap border border-pink-100">
                        Quick View
                    </button>
                </div>
                
                <div class="p-3 md:p-5 flex flex-col flex-grow cursor-pointer" onclick="window.location.href='detail.html?id=${product.id}'">
                    <div class="text-[9px] md:text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">${product.category}</div>
                    <h3 class="text-sm md:text-lg font-serif font-bold text-gray-900 mb-1 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">${product.name}</h3>
                    
                    <div class="mt-auto pt-2 md:pt-3 flex items-end justify-between border-t border-stone-100">
                        <div>
                            <p class="text-[10px] md:text-xs text-gray-400 line-through">₹${product.originalPrice.toLocaleString()}</p>
                            <p class="text-sm md:text-base font-bold text-gray-900">₹${product.price.toLocaleString()}<span class="text-[9px] md:text-[10px] font-normal text-gray-500">/day</span></p>
                        </div>
                        <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Page Initializers ---

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === 'index.html' || page === '') initHome();
    else if (page === 'products.html') initCatalog();
    else if (page === 'detail.html') initDetail();
});

// 1. Home Page
async function initHome() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = '<div class="loading col-span-full text-center py-12 text-pink-400">Loading collection...</div>';
    
    const products = await fetchProducts();
    const featured = products.slice(0, 3); // Top 3
    container.innerHTML = featured.map(createProductCard).join('');
}

// 2. Catalog Page
async function initCatalog() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '<div class="loading col-span-full text-center py-12 text-pink-400">Loading collection...</div>';
    
    const products = await fetchProducts();
    const searchInput = document.getElementById('search');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    let state = { category: 'All', search: '', maxPrice: 5000 };

    function render() {
        const filtered = products.filter(p => {
            return (state.category === 'All' || p.category === state.category) &&
                   (p.name.toLowerCase().includes(state.search.toLowerCase())) &&
                   (p.price <= state.maxPrice);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">No matching items found.</div>';
        } else {
            // .map auto-passes index to createProductCard
            container.innerHTML = filtered.map(createProductCard).join('');
        }
    }

    // Event Listeners
    searchInput?.addEventListener('input', (e) => { state.search = e.target.value; render(); });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-brand-600', 'text-white');
                b.classList.add('bg-white', 'text-gray-600');
            });
            btn.classList.remove('bg-white', 'text-gray-600');
            btn.classList.add('bg-brand-600', 'text-white');
            state.category = btn.dataset.category;
            render();
        });
    });

    priceRange?.addEventListener('input', (e) => {
        state.maxPrice = Number(e.target.value);
        priceValue.textContent = `₹${state.maxPrice}`;
        render();
    });

    render();
}

// 3. Detail Page
async function initDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const products = await fetchProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        document.getElementById('product-detail').innerHTML = '<div class="text-center py-20">Product not found.</div>';
        return;
    }

    // Populate Data
    document.title = `${product.name} | Luxe Rentals`;
    document.getElementById('main-image').src = product.image;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-desc').textContent = product.description;
    document.getElementById('product-price').textContent = `₹${product.price.toLocaleString()}`;
    document.getElementById('product-mrp').textContent = `MRP ₹${product.originalPrice.toLocaleString()}`;
    document.getElementById('product-size').textContent = product.size;

    if (!product.available) {
        document.getElementById('availability-badge').classList.remove('hidden');
    }

    // Setup WhatsApp Button to open Rent Modal
    const waBtn = document.getElementById('whatsapp-btn');
    if (product.available) {
        waBtn.onclick = (e) => {
            e.preventDefault();
            openRentModal(product);
        };
        // Apply Green Gradient
        waBtn.className = "w-full flex items-center justify-center gap-3 px-8 py-5 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-2xl shadow-green-500/20 transform hover:-translate-y-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover-lift";
    } else {
        waBtn.classList.add('bg-gray-300', 'cursor-not-allowed');
        waBtn.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
        waBtn.innerHTML = '<span>Unavailable</span>';
        waBtn.onclick = (e) => e.preventDefault();
    }

    // Similar Products
    const similarContainer = document.getElementById('similar-products-grid');
    if (similarContainer) {
        const similar = products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        // Pass a high index (10) to force lazy loading for footer items
        similarContainer.innerHTML = similar.map(p => createProductCard(p, 10)).join('');
    }
}

// --- Rent Modal Logic ---

function openRentModal(product) {
    if (!product) return;
    currentRentProduct = product;

    // Fill Product Summary
    const summary = document.getElementById('rent-product-summary');
    if (summary) {
        summary.innerHTML = `
            <img src="${product.image}" class="w-16 h-16 rounded object-cover border border-stone-200">
            <div>
                <div class="text-xs font-bold text-brand-600 uppercase">${product.category}</div>
                <div class="font-bold text-gray-900 leading-tight line-clamp-1">${product.name}</div>
                <div class="text-sm text-gray-600">₹${product.price.toLocaleString()}/day</div>
            </div>
        `;
    }

    // Show Modal
    const modal = document.getElementById('rent-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('rent-modal-backdrop').classList.remove('opacity-0');
            document.getElementById('rent-modal-panel').classList.remove('opacity-0', 'scale-95');
        }, 10);
    }
}

function closeRentModal() {
    const modal = document.getElementById('rent-modal');
    if (modal) {
        document.getElementById('rent-modal-backdrop').classList.add('opacity-0');
        document.getElementById('rent-modal-panel').classList.add('opacity-0', 'scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function confirmRent() {
    if (!currentRentProduct) return;

    const name = document.getElementById('rent-name').value;
    const mobile = document.getElementById('rent-mobile').value;
    const date = document.getElementById('rent-date').value;

    if (!name || !mobile || !date) {
        alert("Please fill in all details to proceed.");
        return;
    }

    // --- TRACKING LOGIC ---
    const inquiry = {
        date: new Date().toLocaleString(),
        productId: currentRentProduct.id,
        productName: currentRentProduct.name,
        customerName: name,
        mobile: mobile,
        requestedDate: date
    };

    // Save to LocalStorage for Admin Panel
    const existingInquiries = JSON.parse(localStorage.getItem('luxe_inquiries') || '[]');
    existingInquiries.unshift(inquiry);
    localStorage.setItem('luxe_inquiries', JSON.stringify(existingInquiries));
    // ---------------------

    // Construct detailed message
    const productLink = window.location.origin + window.location.pathname.replace('index.html', '').replace('products.html', '') + `detail.html?id=${currentRentProduct.id}`;
    
    const message = 
`*New Rental Inquiry*
---------------------
*Product:* ${currentRentProduct.name}
*ID:* ${currentRentProduct.id}
*Price:* ₹${currentRentProduct.price.toLocaleString()}/day
*Link:* ${productLink}

*Customer Details*
*Name:* ${name}
*Mobile:* ${mobile}
*Requested Date:* ${date}

Is this available?`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    const btn = document.getElementById('confirm-rent-btn');
    handleAction(btn, url, true);
    
    // Close modal after delay
    setTimeout(() => {
        closeRentModal();
    }, 2000);
}


// --- Quick View Modal Logic ---

function openQuickView(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    const product = globalProducts.find(p => p.id === productId);
    if (!product) return;

    // Populate
    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-name').textContent = product.name;
    document.getElementById('qv-category').textContent = product.category;
    document.getElementById('qv-desc').textContent = product.description;
    document.getElementById('qv-price').textContent = `₹${product.price.toLocaleString()}`;
    
    // Setup Buttons
    const waBtn = document.getElementById('qv-whatsapp-btn');
    const detailBtn = document.getElementById('qv-detail-link');

    // Reset Classes for Green Gradient
    waBtn.className = "w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 text-base font-bold text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all hover-lift";

    if (product.available) {
        // Change logic: Open Modal instead of direct link
        waBtn.onclick = (e) => {
            e.preventDefault();
            // Close Quick View first if needed, or just open Rent Modal on top (z-index handles it)
            // But let's close QV to be clean or keep it open. Rent modal z-index is 70, QV is 60.
            openRentModal(product);
        };
        waBtn.innerHTML = 'Rent via WhatsApp';
        waBtn.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        waBtn.classList.add('opacity-50', 'pointer-events-none');
        waBtn.classList.remove('bg-gradient-to-r');
        waBtn.classList.add('bg-gray-400');
        waBtn.innerHTML = 'Unavailable';
    }

    detailBtn.onclick = (e) => {
        e.preventDefault();
        handleAction(detailBtn, `detail.html?id=${product.id}`, false);
    };

    // Show Modal
    const modal = document.getElementById('quick-view-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-backdrop').classList.remove('opacity-0');
        document.getElementById('modal-panel').classList.remove('opacity-0', 'scale-95');
    }, 10);
}

function closeQuickView() {
    const backdrop = document.getElementById('modal-backdrop');
    const panel = document.getElementById('modal-panel');
    backdrop.classList.add('opacity-0');
    panel.classList.add('opacity-0', 'scale-95');
    setTimeout(() => document.getElementById('quick-view-modal').classList.add('hidden'), 300);
}

document.getElementById('quick-view-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeQuickView();
});
document.getElementById('rent-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'rent-modal-backdrop') closeRentModal();
});
