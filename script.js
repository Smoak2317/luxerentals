


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

// Share Product Logic
async function shareProduct(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    const product = globalProducts.find(p => p.id === productId);
    if (!product) return;

    // Construct URL (handles if site is in a subdir or root)
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const url = `${baseUrl}/detail.html?id=${productId}`;

    const shareData = {
        title: product.name,
        text: `Check out this ${product.name} at Luxe Rentals!`,
        url: url
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(url);
            showToast("Link copied to clipboard!");
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
}

// Toast Notification
function showToast(msg) {
    const div = document.createElement('div');
    div.className = "fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-stone-900/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl z-[2000] transition-all duration-300 backdrop-blur-sm flex items-center gap-2 opacity-0 translate-y-4";
    div.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ${msg}`;
    document.body.appendChild(div);
    
    // Animate in
    requestAnimationFrame(() => {
        div.classList.remove('opacity-0', 'translate-y-4');
    });

    // Remove after delay
    setTimeout(() => { 
        div.classList.add('opacity-0', 'translate-y-4'); 
        setTimeout(() => div.remove(), 300); 
    }, 2000);
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

// Render Product Card - Updated for Compact Scale
function createProductCard(product, index = 0) {
    const isAboveFold = index < 4;
    const loadingAttr = isAboveFold ? 'eager' : 'lazy';
    // Support new images array or fallback
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    
    // Status Badge (Top Right)
    const statusBadge = product.available 
        ? `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 text-green-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Available</div>`
        : `<div class="absolute top-2 right-2 md:top-3 md:right-3 bg-stone-900/90 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10 uppercase tracking-wide">Booked</div>`;

    // Tags (Top Left)
    let tagsHtml = '';
    if (product.tags && product.tags.length > 0) {
        tagsHtml = `<div class="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-10">` + 
        product.tags.map(tag => {
            let color = tag === 'New Arrival' ? 'bg-blue-600' : 'bg-purple-600';
            if (tag === 'Most Rented') color = 'bg-orange-500';
            return `<span class="${color} text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm uppercase tracking-wide">${tag}</span>`;
        }).join('') + `</div>`;
    }

    return `
        <div class="group relative block h-full">
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full hover-lift">
                <!-- Image Container -->
                <div class="relative aspect-[3/4] bg-stone-100 cursor-pointer overflow-hidden" onclick="window.location.href='detail.html?id=${product.id}'">
                    <img 
                        loading="${loadingAttr}" 
                        decoding="async"
                        src="${mainImage}" 
                        alt="${product.name}" 
                        class="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                    >
                    <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors duration-300"></div>
                    ${statusBadge}
                    ${tagsHtml}
                    
                    <!-- Share Button (Bottom Right) -->
                    <button onclick="shareProduct(event, '${product.id}')" class="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white/90 p-2 rounded-full shadow-md text-gray-500 hover:text-brand-600 hover:bg-white transition-all z-20 backdrop-blur-[2px] hover:scale-110 active:scale-95" title="Share">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    </button>

                    <!-- Quick View Button -->
                    <button onclick="openQuickView(event, '${product.id}')" class="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-brand-600 font-bold px-5 py-2 rounded-full shadow-lg hover:bg-brand-50 z-20 text-xs whitespace-nowrap border border-pink-100">
                        Quick View
                    </button>
                    <!-- Mobile Rent Button -->
                    <button onclick="event.stopPropagation(); openRentModal({id:'${product.id}', name:'${product.name.replace(/'/g, "\\'")}', price:${product.price}, images:['${mainImage}'], category:'${product.category}'})" class="md:hidden absolute bottom-2 left-2 bg-white/90 p-2 rounded-full shadow-md text-green-600 hover:text-green-700 transition-all z-20 backdrop-blur-[2px]">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </button>
                </div>
                
                <!-- Content - Reduced Padding & Font Sizes -->
                <div class="p-2 md:p-4 flex flex-col flex-grow cursor-pointer" onclick="window.location.href='detail.html?id=${product.id}'">
                    <div class="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-1 truncate">${product.category}</div>
                    <h3 class="text-xs md:text-base font-serif font-bold text-gray-900 mb-1 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.4em] md:min-h-[2.5em]">${product.name}</h3>
                    
                    <div class="mt-auto pt-2 flex items-center justify-between border-t border-stone-100">
                        <div class="text-xs font-bold text-brand-600 uppercase tracking-wide">
                            Ask for Rent
                        </div>
                        <div class="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0 ml-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
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
    
    // SVG Paths
    const iconMenu = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />`;
    const iconClose = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;

    if (mobileBtn && mobileMenu) {
        const toggleMenu = () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            const svg = mobileBtn.querySelector('svg');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('mobile-menu-enter');
                if(svg) svg.innerHTML = iconClose;
                mobileBtn.classList.add('text-brand-600');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('mobile-menu-enter');
                if(svg) svg.innerHTML = iconMenu;
                mobileBtn.classList.remove('text-brand-600');
            }
        };

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

        window.addEventListener('scroll', () => {
            closeMenu();
        }, { passive: true });
    }

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

// 2. Catalog Page (Pagination Implementation)
async function initCatalog() {
    const container = document.getElementById('products-grid');
    const paginationContainer = document.getElementById('pagination-container');
    if (!container) return;

    container.innerHTML = '<div class="col-span-full text-center py-12 text-pink-400 animate-pulse">Loading collection...</div>';
    
    const products = await fetchProducts();
    if (products.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">Unable to load products.</div>';
        return;
    }

    const searchInput = document.getElementById('search');
    const categoryBtns = document.querySelectorAll('.category-btn');

    let state = { category: 'All', search: '' };
    let currentPage = 1;
    const itemsPerPage = 12; // 12 items per page

    function render() {
        // 1. Filter
        const filtered = products.filter(p => {
            return (state.category === 'All' || p.category === state.category) &&
                   (p.name.toLowerCase().includes(state.search.toLowerCase()));
        });

        // 2. Paginate
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Ensure current page is valid
        if (currentPage > totalPages) currentPage = 1;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        // 3. Render Grid
        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">No matching items found.</div>';
            paginationContainer.innerHTML = '';
        } else {
            container.innerHTML = paginatedItems.map(createProductCard).join('');
            renderPagination(totalPages);
        }
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let buttons = '';
        
        // Prev Button
        buttons += `
            <button onclick="changePage(${currentPage - 1})" 
                class="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-pink-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                ${currentPage === 1 ? 'disabled' : ''}>
                Prev
            </button>
        `;

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                buttons += `<button class="px-3 py-1 rounded bg-brand-600 text-white font-bold text-sm shadow-md">${i}</button>`;
            } else {
                buttons += `<button onclick="changePage(${i})" class="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-pink-50 hover:text-brand-600 transition-colors text-sm">${i}</button>`;
            }
        }

        // Next Button
        buttons += `
            <button onclick="changePage(${currentPage + 1})" 
                class="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-pink-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        paginationContainer.innerHTML = buttons;
    }

    // Expose changePage to global scope so onclick works
    window.changePage = (newPage) => {
        currentPage = newPage;
        render();
        // Smooth scroll to top of grid
        const gridTop = document.getElementById('products-grid').offsetTop - 120;
        window.scrollTo({ top: gridTop, behavior: 'smooth' });
    };

    const activeClasses = ['bg-gradient-to-r', 'from-brand-500', 'to-purple-600', 'text-white', 'shadow-md', 'shadow-pink-500/30', 'font-semibold'];
    const inactiveClasses = ['bg-white', 'border', 'border-stone-200', 'text-stone-600', 'hover:border-brand-300', 'hover:text-brand-600', 'hover:bg-pink-50', 'hover:shadow-md', 'font-medium'];

    searchInput?.addEventListener('input', (e) => { 
        state.search = e.target.value; 
        currentPage = 1; // Reset to page 1 on search
        render(); 
    });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove(...activeClasses);
                b.classList.add(...inactiveClasses);
            });
            btn.classList.remove(...inactiveClasses);
            btn.classList.add(...activeClasses);

            state.category = btn.dataset.category;
            currentPage = 1; // Reset to page 1 on filter
            render();
        });
    });

    render();
}

// 3. Detail Page - Updated for Gallery & Share
async function initDetail() {
    if(!document.getElementById('product-detail')) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        document.getElementById('detail-loading').innerHTML = '<div class="text-center py-20 text-gray-500">No product selected. <a href="products.html" class="text-brand-600 underline">Browse Collection</a></div>';
        return;
    }

    const products = await fetchProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        document.getElementById('detail-loading').innerHTML = '<div class="text-center py-20 text-gray-500">Product not found. <a href="products.html" class="text-brand-600 underline">Browse Collection</a></div>';
        return;
    }

    document.title = `${product.name} | Luxe Rentals`;
    
    // --- Image Gallery Logic ---
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const mainImgEl = document.getElementById('main-image');
    mainImgEl.src = images[0];
    
    // Render Thumbnails
    const thumbsContainer = document.getElementById('thumbnails-container');
    if (thumbsContainer) {
        if (images.length > 1) {
            thumbsContainer.innerHTML = images.map((img, idx) => `
                <div class="aspect-square rounded-lg bg-stone-100 overflow-hidden cursor-pointer border-2 ${idx === 0 ? 'border-brand-500 ring-1 ring-brand-200' : 'border-transparent'} hover:border-brand-300 transition-all" onclick="changeMainImage('${img}', this)">
                    <img src="${img}" class="w-full h-full object-cover" alt="Detail ${idx + 1}">
                </div>
            `).join('');
            thumbsContainer.classList.remove('hidden');
        } else {
            thumbsContainer.innerHTML = ''; // Clear if only 1 image
            thumbsContainer.classList.add('hidden');
        }
    }
    
    // Global function for onclick in template string
    window.changeMainImage = (src, thumbEl) => {
        // Update Main Image
        const main = document.getElementById('main-image');
        main.style.opacity = '0.5';
        setTimeout(() => {
            main.src = src;
            main.style.opacity = '1';
        }, 150);
        
        // Update Active Thumbnail styling
        const allThumbs = document.getElementById('thumbnails-container').children;
        for (let t of allThumbs) {
            t.classList.remove('border-brand-500', 'ring-1', 'ring-brand-200');
            t.classList.add('border-transparent');
        }
        thumbEl.classList.remove('border-transparent');
        thumbEl.classList.add('border-brand-500', 'ring-1', 'ring-brand-200');
    };

    // --- Info Population ---
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-desc').textContent = product.description;
    
    // Remove price update logic
    // document.getElementById('product-price').textContent = `₹${product.price.toLocaleString()}`;
    // document.getElementById('product-mrp').textContent = `MRP ₹${product.originalPrice.toLocaleString()}`;
    
    document.getElementById('product-size').textContent = product.size;

    if (!product.available) {
        document.getElementById('availability-badge').classList.remove('hidden');
    } else {
        document.getElementById('availability-badge').classList.add('hidden');
    }

    // --- Buttons: Rent & Share ---
    const waBtn = document.getElementById('whatsapp-btn');
    const shareBtn = document.getElementById('share-btn');
    
    if (product.available) {
        waBtn.onclick = (e) => {
            e.preventDefault();
            openRentModal(product);
        };
        waBtn.className = "flex-grow flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all shadow-md hover:shadow-xl shadow-green-500/10 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700";
        waBtn.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>Ask for Rent on WhatsApp</span>
        `;
    } else {
        waBtn.classList.add('bg-gray-300', 'cursor-not-allowed', 'flex-grow');
        waBtn.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
        waBtn.innerHTML = '<span>Unavailable</span>';
        waBtn.onclick = (e) => e.preventDefault();
    }
    
    // Attach Share Event
    if (shareBtn) {
        shareBtn.onclick = (e) => shareProduct(e, product.id);
    }

    const similarContainer = document.getElementById('similar-products-grid');
    if (similarContainer) {
        const similar = products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        similarContainer.innerHTML = similar.map(p => createProductCard(p, 10)).join('');
    }

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
    
    document.body.style.overflow = 'hidden';

    const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;

    // Set Summary - Price removed
    const summary = document.getElementById('rent-product-summary');
    if (summary) {
        summary.innerHTML = `
            <img src="${mainImage}" class="w-12 h-12 rounded object-cover object-top border border-stone-200">
            <div>
                <div class="text-[10px] font-bold text-brand-600 uppercase">${product.category}</div>
                <div class="font-bold text-gray-900 leading-tight line-clamp-1 text-sm">${product.name}</div>
            </div>
        `;
    }

    // Reset Form Fields
    const nameInput = document.getElementById('rent-name');
    if (nameInput) nameInput.value = '';

    const mobileInput = document.getElementById('rent-mobile');
    if (mobileInput) mobileInput.value = '';

    const daysInput = document.getElementById('rent-days');
    if (daysInput) daysInput.value = '1';

    // Set Date Min to Today
    const dateInput = document.getElementById('rent-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = ''; // Reset date
    }

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

    const name = document.getElementById('rent-name').value.trim();
    const mobile = document.getElementById('rent-mobile').value.trim();
    const date = document.getElementById('rent-date').value;
    const days = document.getElementById('rent-days').value;

    if (!name || !mobile || !date || !days) {
        alert("Please fill in all details to proceed.");
        return;
    }

    // 1. Mobile Number Validation: Exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    // 2. Duration Validation: 1 to 10 days
    const duration = parseInt(days);
    if (isNaN(duration) || duration < 1) {
        alert("Duration must be at least 1 day.");
        return;
    }
    if (duration > 10) {
        alert("Maximum rental duration is 10 days.");
        return;
    }

    // 3. Date Validation: Not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0); // normalize today to midnight
    if (selectedDate < today) {
        alert("Please select a valid future date.");
        return;
    }

    const inquiry = {
        date: new Date().toLocaleString(),
        productId: currentRentProduct.id,
        productName: currentRentProduct.name,
        customerName: name,
        mobile: mobile,
        requestedDate: date,
        duration: duration
    };

    const existingInquiries = JSON.parse(localStorage.getItem('luxe_inquiries') || '[]');
    existingInquiries.unshift(inquiry);
    localStorage.setItem('luxe_inquiries', JSON.stringify(existingInquiries));

    const productLink = new URL(`detail.html?id=${currentRentProduct.id}`, window.location.href).href;
    
    // Updated Message without Price
    const message = 
`👋 *Hello, I'm interested in renting this outfit!*

👗 *OUTFIT DETAILS*
• *Name:* ${currentRentProduct.name}
• *Code:* ${currentRentProduct.id}
🔗 *View Item:* ${productLink}

👤 *MY DETAILS*
• *Name:* ${name}
• *Mobile:* ${mobile}
📅 *Event Date:* ${date}
⏱️ *Duration:* ${duration} Days

✨ *Please let me know the rent price and availability.*`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    const btn = document.getElementById('confirm-rent-btn');
    handleAction(btn, url, true);
    
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
    
    document.body.style.overflow = 'hidden';

    // Image logic
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    document.getElementById('qv-image').src = mainImage;
    
    document.getElementById('qv-name').textContent = product.name;
    document.getElementById('qv-category').textContent = product.category;
    document.getElementById('qv-desc').textContent = product.description;
    
    // Price removed from Quick View
    // document.getElementById('qv-price').textContent = `₹${product.price.toLocaleString()}`;
    
    const waBtn = document.getElementById('qv-whatsapp-btn');
    const detailBtn = document.getElementById('qv-detail-link');

    // Reset Classes
    waBtn.className = "w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all hover-lift";

    if (product.available) {
        waBtn.onclick = (e) => {
            e.preventDefault();
            openRentModal(product);
        };
        waBtn.innerHTML = 'Ask for Rent on WhatsApp';
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

    const modal = document.getElementById('quick-view-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-backdrop').classList.remove('opacity-0');
        document.getElementById('modal-panel').classList.remove('opacity-0', 'scale-95');
    }, 10);
}

function closeQuickView() {
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
