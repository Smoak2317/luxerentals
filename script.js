

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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>