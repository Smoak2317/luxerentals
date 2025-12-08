

// Admin Logic
let adminProducts = []; // Holds the state of products in the admin panel
let adminInquiries = [];

// Check Auth on Load
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
        showPanel();
        initAdminData();
    }
});

// Login Handler
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    // Updated Password
    if (password === 'Smoakluxe.@56964') {
        sessionStorage.setItem('admin_auth', 'true');
        showPanel();
        initAdminData();
        showAdminToast("Welcome back, Admin!", "success");
    } else {
        alert('Incorrect Access Key');
    }
});

function showPanel() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

function logoutAdmin() {
    sessionStorage.removeItem('admin_auth');
    window.location.reload();
}

// Styling for active tabs with animation reset
function switchTab(tabName) {
    // Hide all
    document.querySelectorAll('[id^="view-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('animate-fade-in'); // Reset animation class
    });

    const newView = document.getElementById(`view-${tabName}`);
    newView.classList.remove('hidden');
    
    // Trigger reflow to restart animation
    void newView.offsetWidth; 
    newView.classList.add('animate-fade-in');

    const activeClasses = ['bg-gradient-to-r', 'from-brand-500', 'to-purple-600', 'text-white', 'shadow-lg', 'shadow-pink-500/20'];
    const inactiveClasses = ['text-gray-600', 'hover:bg-brand-50', 'hover:text-brand-600'];

    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.classList.remove(...activeClasses);
        btn.classList.add(...inactiveClasses);
        // Reset icons
        const icon = btn.querySelector('i');
        if(icon) icon.classList.add('text-gray-400'); // Reset icon color if needed
        const bg = btn.querySelector('span.absolute');
        if(bg) bg.classList.remove('opacity-100');
    });

    const activeBtn = document.getElementById(`tab-${tabName}`);
    activeBtn.classList.remove(...inactiveClasses);
    activeBtn.classList.add(...activeClasses);
    
    if (tabName === 'products') renderProductTable();
    if (tabName === 'inquiries') renderInquiriesTable();
}

// Data Initialization
async function initAdminData() {
    try {
        // Load Products
        const res = await fetch('products.json');
        if (res.ok) {
            adminProducts = await res.json();
            document.getElementById('dash-total-products').textContent = adminProducts.length;
            
            // Auto-load dashboard state
            switchTab('dashboard');
        }

        // Load Inquiries from LocalStorage
        const savedInquiries = localStorage.getItem('luxe_inquiries');
        if (savedInquiries) {
            adminInquiries = JSON.parse(savedInquiries);
            document.getElementById('dash-total-inquiries').textContent = adminInquiries.length;
            renderTopRentals(); // Render top stats
        }
    } catch (e) {
        console.error("Failed to fetch products", e);
        showAdminToast("Failed to load product data", "error");
    }
}

// --- Render Tables ---

function renderProductTable() {
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML = '';
    
    adminProducts.forEach(p => {
        // Handle images array or fallback
        const mainImage = p.images && p.images.length > 0 ? p.images[0] : p.image;
        
        const tr = document.createElement('tr');
        tr.id = `row-${p.id}`;
        tr.className = "hover:bg-brand-50/30 transition-all group duration-300";
        tr.innerHTML = `
            <td class="p-5">
                <div class="flex items-center gap-4">
                    <a href="detail.html?id=${p.id}" target="_blank" class="relative group/img cursor-pointer" title="View on Live Site">
                        <img src="${mainImage}" class="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shadow-sm group-hover/img:ring-2 ring-brand-400 transition-all" onerror="this.src='https://via.placeholder.com/100?text=No+Img'">
                        <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                             <i data-lucide="external-link" class="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md"></i>
                        </div>
                    </a>
                    <div>
                        <a href="detail.html?id=${p.id}" target="_blank" class="font-bold text-gray-900 text-sm group-hover:text-brand-700 transition-colors hover:underline block">${p.name}</a>
                        <div class="text-xs text-gray-400 font-mono mt-0.5">ID: ${p.id}</div>
                    </div>
                </div>
            </td>
            <td class="p-5 text-gray-600 text-sm font-medium">${p.category}</td>
            <td class="p-5 font-bold text-sm text-gray-900">₹${p.price.toLocaleString()}</td>
            <td class="p-5">
                <button onclick="toggleAvailability('${p.id}')" class="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all border ${p.available ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'}">
                    ${p.available ? 'Available' : 'Booked'}
                </button>
            </td>
            <td class="p-5 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <button onclick="editProduct('${p.id}')" class="text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition active:scale-95" title="Edit">
                         <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteProduct('${p.id}')" class="text-red-400 hover:bg-red-50 p-2 rounded-lg transition active:scale-95" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (window.lucide) lucide.createIcons();
}

function renderInquiriesTable() {
    const tbody = document.getElementById('admin-inquiry-list');
    tbody.innerHTML = '';

    if (adminInquiries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400 italic">No inquiries tracked yet.</td></tr>';
        return;
    }

    adminInquiries.forEach(inq => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-brand-50/30 transition border-b border-gray-50";
        tr.innerHTML = `
            <td class="p-5 text-sm text-gray-500">${inq.date}</td>
            <td class="p-5 font-bold text-gray-900">${inq.customerName}</td>
            <td class="p-5 text-sm text-gray-600 font-mono">${inq.mobile}</td>
            <td class="p-5 text-sm text-brand-600 font-medium">${inq.productName} <span class="text-xs text-gray-400 ml-1">(${inq.productId})</span></td>
             <td class="p-5 text-sm text-gray-600 font-medium">${inq.requestedDate || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTopRentals() {
    const list = document.getElementById('dash-top-rentals');
    if (!list) return;
    list.innerHTML = '';

    if (adminInquiries.length === 0) {
        list.innerHTML = '<li class="text-sm text-gray-400 italic p-2">No rental data available yet.</li>';
        return;
    }

    // Count occurrences
    const counts = {};
    adminInquiries.forEach(inq => {
        const key = inq.productName;
        counts[key] = (counts[key] || 0) + 1;
    });

    // Sort by count descending
    const sorted = Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Take top 5

    sorted.forEach(([name, count], index) => {
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors";
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold shadow-sm">${index + 1}</span>
                <span class="text-sm font-medium text-gray-700 truncate max-w-[140px] md:max-w-[200px]">${name}</span>
            </div>
            <div class="text-xs font-bold bg-white px-2 py-1 rounded-md border border-stone-200 text-gray-600 shadow-sm">
                ${count} requests
            </div>
        `;
        list.appendChild(li);
    });
}

function clearInquiries() {
    if(confirm("Are you sure you want to clear all inquiry history?")) {
        adminInquiries = [];
        localStorage.removeItem('luxe_inquiries');
        renderInquiriesTable();
        document.getElementById('dash-total-inquiries').textContent = 0;
        renderTopRentals();
        showAdminToast("History Cleared", "info");
    }
}

// --- Product Actions ---

function toggleAvailability(id) {
    const product = adminProducts.find(p => p.id === id);
    if (product) {
        product.available = !product.available;
        renderProductTable();
        showAdminToast(product.available ? "Marked as Available" : "Marked as Booked", "info");
    }
}

// Open Modal for ADD - Smooth Transition
function openAddModal() {
    const modal = document.getElementById('add-modal');
    const panel = document.getElementById('add-modal-panel');
    
    // Reset fields
    document.getElementById('modal-title').textContent = "Add New Product";
    document.getElementById('save-btn').textContent = "Add Product";
    document.getElementById('edit-mode-id').value = "";
    
    document.getElementById('new-id').value = "";
    document.getElementById('new-name').value = "";
    document.getElementById('new-category').value = "Bridal";
    document.getElementById('new-price').value = "";
    document.getElementById('new-original').value = "";
    document.getElementById('new-size').value = "";
    document.getElementById('new-desc').value = "";
    document.getElementById('new-images').value = "";
    document.getElementById('tag-most-rented').checked = false;
    document.getElementById('tag-new-arrival').checked = false;

    // Show modal
    modal.classList.remove('hidden');
    // Animate in
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
    });
}

// Open Modal for EDIT
function editProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-title').textContent = "Edit Product";
    document.getElementById('save-btn').textContent = "Update Product";
    document.getElementById('edit-mode-id').value = id;

    // Populate fields
    document.getElementById('new-id').value = product.id;
    document.getElementById('new-name').value = product.name;
    document.getElementById('new-category').value = product.category;
    document.getElementById('new-price').value = product.price;
    document.getElementById('new-original').value = product.originalPrice;
    document.getElementById('new-size').value = product.size;
    document.getElementById('new-desc').value = product.description;
    
    // Set Image URLs (Join array with newlines)
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    document.getElementById('new-images').value = images.join('\n');
    
    // Set Tags
    const tags = product.tags || [];
    document.getElementById('tag-most-rented').checked = tags.includes('Most Rented');
    document.getElementById('tag-new-arrival').checked = tags.includes('New Arrival');

    const modal = document.getElementById('add-modal');
    const panel = document.getElementById('add-modal-panel');
    
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
    });
}

function closeAddModal() {
    const modal = document.getElementById('add-modal');
    const panel = document.getElementById('add-modal-panel');
    
    modal.classList.add('opacity-0');
    panel.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Save (Add or Update)
function saveProduct() {
    const btn = document.getElementById('save-btn');
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    // Delay slightly to show processing state
    setTimeout(() => {
        const editId = document.getElementById('edit-mode-id').value;
        const isEdit = !!editId;

        // Get Images from Textarea (Split by newline and filter empty)
        const imagesInput = document.getElementById('new-images').value.trim();
        const imagesList = imagesInput.split('\n').map(url => url.trim()).filter(url => url.length > 0);
        
        // Get Tags
        const tags = [];
        if (document.getElementById('tag-most-rented').checked) tags.push('Most Rented');
        if (document.getElementById('tag-new-arrival').checked) tags.push('New Arrival');

        const data = {
            id: document.getElementById('new-id').value || `CH${Math.floor(Math.random() * 1000)}`,
            name: document.getElementById('new-name').value,
            category: document.getElementById('new-category').value,
            price: Number(document.getElementById('new-price').value) || 0,
            originalPrice: Number(document.getElementById('new-original').value) || 0,
            description: document.getElementById('new-desc').value,
            images: imagesList.length > 0 ? imagesList : ['https://via.placeholder.com/400'], // Save as Array
            available: true, 
            size: document.getElementById('new-size').value,
            tags: tags
        };

        if (!data.name || !data.price) {
            alert("Name and Price are required.");
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        if (isEdit) {
            const index = adminProducts.findIndex(p => p.id === editId);
            if (index !== -1) {
                // Keep availability status from existing
                data.available = adminProducts[index].available;
                adminProducts[index] = data;
                showAdminToast("Product Updated Successfully", "success");
            }
        } else {
            adminProducts.push(data);
            showAdminToast("Product Added Successfully", "success");
        }

        btn.textContent = originalText;
        btn.disabled = false;
        closeAddModal();
        renderProductTable();
        document.getElementById('dash-total-products').textContent = adminProducts.length;
    }, 600);
}

function deleteProduct(id) {
    if (confirm("Delete this product from the list?")) {
        const row = document.getElementById(`row-${id}`);
        if(row) {
            // Animate out
            row.style.transition = 'all 0.5s';
            row.style.transform = 'translateX(20px)';
            row.style.opacity = '0';
            
            setTimeout(() => {
                adminProducts = adminProducts.filter(p => p.id !== id);
                renderProductTable();
                document.getElementById('dash-total-products').textContent = adminProducts.length;
                showAdminToast("Product Deleted", "error");
            }, 500);
        }
    }
}

// --- Export / Save ---
function exportJSON() {
    const jsonString = JSON.stringify(adminProducts, null, 2);
    document.getElementById('json-export-output').value = jsonString;
    
    const modal = document.getElementById('export-modal');
    const panel = document.getElementById('export-modal-panel');
    
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
    });
}

function closeExportModal() {
    const modal = document.getElementById('export-modal');
    const panel = document.getElementById('export-modal-panel');
    
    modal.classList.add('opacity-0');
    panel.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function copyToClipboard() {
    const copyText = document.getElementById("json-export-output");
    copyText.select();
    document.execCommand("copy");
    showAdminToast("JSON Code Copied to Clipboard!", "success");
}

// --- Toast System ---
function showAdminToast(message, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    
    let icon = '';
    let bgColor = 'bg-stone-800';
    let textColor = 'text-white';

    if (type === 'success') {
        icon = '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    } else if (type === 'error') {
        icon = '<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    } else {
        icon = '<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl ${bgColor} ${textColor} transform transition-all duration-500 translate-y-10 opacity-0 backdrop-blur-md`;
    toast.innerHTML = `${icon} <span class="font-medium text-sm">${message}</span>`;

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}