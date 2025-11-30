

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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        globalProducts = await response.json();
        return globalProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        // Helpful alert for local development issues
        if (window.location.protocol === 'file:') {
            alert("Error: Cannot load data. \n\nBrowsers block loading JSON files directly from the hard drive (C:/...). \n\nPlease run this site using a Local Server (e.g., 'Live Server' in VS Code or 'python -m http.server').");
        }
        return [];
    }
}

// Render Product Card
function createProductCard(product, index = 0) {
    // Optimization Strategy:
    // 1. loading="lazy": Applied to items likely below the fold (index >= 4).
    //    First 4 items load 'eager' to optimize Largest Contentful Paint (LCP).
    // 2. decoding="async": Decodes images off the main thread to prevent scrolling jank.
    const isAboveFold = index < 4;
    const loadingAttr = isAboveFold ? 'eager' : 'lazy';
    
    const statusBadge = product.available 
        ? `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 text-green-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Available</div>`
        : `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-stone-900/90 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Booked</div>`;

    return `
        <div class="group relative block h-full">
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full hover-lift">
                <!-- Image Container: object-cover object-top to fill space without blank areas -->
                <div class="relative aspect-[3/4] bg-stone-100 cursor-pointer overflow-hidden" onclick="window.location.href='detail.html?id=${product.id}'">
                    <img 
                        loading="${loadingAttr}" 
                        decoding="async"
                        src="${product.image}" 
                        alt="${product.name}" 
                        class="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                    >
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    ${statusBadge}
                    
                    <!-- Quick View Button -->
                    <button onclick="openQuickView(event, '${product.id}')" class="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-brand-600 font-bold px-5 py-2 rounded-full shadow-lg hover:bg-brand-50 z-20 text-xs whitespace-nowrap border border-pink-100">
                        Quick View
                    </button>
                </div>
                
                <div class="p-2 md:p-5 flex flex-col flex-grow cursor-pointer" onclick="window.location.href='detail.html?id=${product.id}'">
                    <div class="text-[9px] md:text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1 truncate">${product.category}</div>
                    <h3 class="text-xs md:text-lg font-serif font-bold text-gray-900 mb-1 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.4em] md:min-h-[2.5em]">${product.name}</h3>
                    
                    <div class="mt-auto pt-2 md:pt-3 flex items-end justify-between border-t border-stone-100">
                        <div class="flex flex-col">
                            <p class="text-[9px] md:text-xs text-gray-400 line-through leading-tight">₹${product.originalPrice.toLocaleString()}</p>
                            <p class="text-sm md:text-base font-bold text-gray-900 leading-tight">₹${product.price.toLocaleString()}<span class="text-[8px] md:text-[10px] font-normal text-gray-500">/day</span></p>
                        </div>
                        <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0 ml-1">
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
    // Mobile Menu Toggle with Animation and Icons
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // SVG Paths
    const iconMenu = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />`;
    const iconClose = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;

    if (mobileBtn && mobileMenu) {
        // Toggle Menu Function
        const toggleMenu = () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            const svg = mobileBtn.querySelector('svg');
            
            if (isHidden) {
                // Open
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('mobile-menu-enter');
                if(svg) svg.innerHTML = iconClose;
                mobileBtn.classList.add('text-brand-600');
            } else {
                // Close
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('mobile-menu-enter');
                if(svg) svg.innerHTML = iconMenu;
                mobileBtn.classList.remove('text-brand-600');
            }
        };

        // Close Menu Function (for scroll)
        const closeMenu = () => {
             if (!mobileMenu.classList.contains('hidden')) {
                const svg = mobileBtn.querySelector('svg');
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('mobile-menu-enter');
                if(svg) svg.innerHTML = iconMenu;
                mobileBtn.classList.remove('text-brand-600');
             }
        };

        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close on Scroll
        window.addEventListener('scroll', () => {
            closeMenu();
        }, { passive: true });
    }

    // Robust Page Routing based on Element Existence
    // This prevents issues with URL paths (e.g. index.html vs root /)
    if (document.getElementById('featured-products')) {
        initHome();
    } else if (document.getElementById('products-grid')) {
        initCatalog();
    } else if (document.getElementById('product-detail')) {
        initDetail();
    }
});

// 1. Home Page
async function initHome() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = '<div class="col-span-full text-center py-12 text-pink-400 animate-pulse">Loading collection...</div>';
    
    const products = await fetchProducts();
    if (products.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">No products found.</div>';
        return;
    }

    const featured = products.slice(0, 3); // Top 3
    container.innerHTML = featured.map(createProductCard).join('');
}

// 2. Catalog Page
async function initCatalog() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '<div class="col-span-full text-center py-12 text-pink-400 animate-pulse">Loading collection...</div>';
    
    const products = await fetchProducts();
    if (products.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">Unable to load products.</div>';
        return;
    }

    const searchInput = document.getElementById('search');
    const categoryBtns = document.querySelectorAll('.category-btn');
    // Price range removed as per request

    let state = { category: 'All', search: '' };

    function render() {
        const filtered = products.filter(p => {
            return (state.category === 'All' || p.category === state.category) &&
                   (p.name.toLowerCase().includes(state.search.toLowerCase()));
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">No matching items found.</div>';
        } else {
            container.innerHTML = filtered.map(createProductCard).join('');
        }
    }

    // Styles for toggling
    const activeClasses = ['bg-gradient-to-r', 'from-brand-500', 'to-purple-600', 'text-white', 'shadow-md', 'shadow-pink-500/30', 'font-semibold'];
    const inactiveClasses = ['bg-white', 'border', 'border-stone-200', 'text-stone-600', 'hover:border-brand-300', 'hover:text-brand-600', 'hover:bg-pink-50', 'hover:shadow-md', 'font-medium'];

    // Event Listeners
    searchInput?.addEventListener('input', (e) => { state.search = e.target.value; render(); });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset all buttons to inactive state
            categoryBtns.forEach(b => {
                b.classList.remove(...activeClasses);
                b.classList.add(...inactiveClasses);
            });
            // Set active button
            btn.classList.remove(...inactiveClasses);
            btn.classList.add(...activeClasses);

            state.category = btn.dataset.category;
            render();
        });
    });

    render();
}

// 3. Detail Page
async function initDetail() {
    // Check if we are on the detail page by element ID, not URL, for robustness
    if(!document.getElementById('product-detail')) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        console.warn("Product Details: No ID parameter found in URL.");
        // Hide loader, show error
        document.getElementById('detail-loading').innerHTML = '<div class="text-center py-20 text-gray-500">No product selected. <a href="products.html" class="text-brand-600 underline">Browse Collection</a></div>';
        return;
    }

    const products = await fetchProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        console.warn(`Product Details: Product with ID ${id} not found.`);
        document.getElementById('detail-loading').innerHTML = '<div class="text-center py-20 text-gray-500">Product not found. <a href="products.html" class="text-brand-600 underline">Browse Collection</a></div>';
        return;
    }

    console.log("Loading Product:", product.name);

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
    } else {
        document.getElementById('availability-badge').classList.add('hidden');
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
        waBtn.innerHTML = `
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>Rent via WhatsApp</span>
        `;
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

    // Reveal Content and Hide Loader
    document.getElementById('detail-loading').classList.add('hidden');
    document.getElementById('detail-content').classList.remove('hidden');
    const backLink = document.getElementById('detail-back-link');
    if(backLink) {
        backLink.classList.remove('hidden');
        backLink.classList.add('inline-flex');
    }
}

// --- Rent Modal Logic ---

function openRentModal(product) {
    if (!product) return;
    currentRentProduct = product;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';

    // Fill Product Summary
    const summary = document.getElementById('rent-product-summary');
    if (summary) {
        summary.innerHTML = `
            <img src="${product.image}" class="w-16 h-16 rounded object-cover object-top border border-stone-200">
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
    // Re-enable scrolling
    document.body.style.overflow = '';

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
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';

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
        waBtn.onclick = (e) => {
            e.preventDefault();
            // Close Quick View first (optional, but cleaner UI if we want Rent Modal on top)
            // Since we set z-index high for modals, we can just open rent modal.
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
    // Re-enable scrolling
    document.body.style.overflow = '';

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