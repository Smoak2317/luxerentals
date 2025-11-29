// Admin Logic
let adminProducts = []; // Holds the state of products in the admin panel

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
    
    // Simple client-side check for demo
    if (password === 'admin123') {
        sessionStorage.setItem('admin_auth', 'true');
        showPanel();
        initAdminData();
    } else {
        alert('Incorrect password');
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

function switchTab(tabName) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.classList.remove('bg-stone-800', 'text-white');
        btn.classList.add('text-stone-300');
    });
    document.getElementById(`tab-${tabName}`).classList.add('bg-stone-800', 'text-white');
    document.getElementById(`tab-${tabName}`).classList.remove('text-stone-300');

    if (tabName === 'products') renderProductTable();
}

// Data Initialization
async function initAdminData() {
    try {
        const res = await fetch('products.json');
        if (res.ok) {
            adminProducts = await res.json();
            // Update Dashboard Counters
            document.getElementById('dash-total-products').textContent = adminProducts.length;
            // Render Table
            renderProductTable();
        }
    } catch (e) {
        console.error("Failed to fetch products", e);
    }
}

// Render Table
function renderProductTable() {
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML = '';
    
    adminProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition border-b border-gray-100";
        tr.innerHTML = `
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <img src="${p.image}" class="w-10 h-10 rounded object-cover bg-gray-200 border border-gray-200">
                    <div>
                        <div class="font-bold text-gray-900 text-sm">${p.name}</div>
                        <div class="text-xs text-gray-400 font-mono">ID: ${p.id}</div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-gray-600 text-sm">${p.category}</td>
            <td class="p-4 font-medium text-sm">₹${p.price}</td>
            <td class="p-4">
                <button onclick="toggleAvailability('${p.id}')" class="px-3 py-1 text-xs font-bold rounded-full transition-colors ${p.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}">
                    ${p.available ? 'Available' : 'Booked'}
                </button>
            </td>
            <td class="p-4 text-right">
                <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Refresh icons
    if (window.lucide) lucide.createIcons();
}

// --- Product Actions ---

// 1. Toggle Availability
function toggleAvailability(id) {
    const product = adminProducts.find(p => p.id === id);
    if (product) {
        product.available = !product.available;
        renderProductTable();
        // Visual feedback could be added here
    }
}

// 2. Add Product
function openAddModal() {
    document.getElementById('add-modal').classList.remove('hidden');
}

function closeAddModal() {
    document.getElementById('add-modal').classList.add('hidden');
    // Clear inputs if needed
}

function addNewProduct() {
    const newProduct = {
        id: document.getElementById('new-id').value || `CH${Math.floor(Math.random() * 1000)}`,
        name: document.getElementById('new-name').value,
        category: document.getElementById('new-category').value,
        price: Number(document.getElementById('new-price').value) || 0,
        originalPrice: Number(document.getElementById('new-original').value) || 0,
        description: document.getElementById('new-desc').value,
        image: document.getElementById('new-image').value || 'https://via.placeholder.com/400',
        available: true,
        size: document.getElementById('new-size').value
    };

    if (!newProduct.name || !newProduct.price) {
        alert("Name and Price are required.");
        return;
    }

    adminProducts.push(newProduct);
    closeAddModal();
    renderProductTable();
    alert("Product added to list! Don't forget to 'Save Changes to JSON'.");
}

// 3. Delete Product
function deleteProduct(id) {
    if (confirm("Delete this product from the list?")) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        renderProductTable();
    }
}

// 4. Export / Save
function exportJSON() {
    const jsonString = JSON.stringify(adminProducts, null, 2);
    document.getElementById('json-export-output').value = jsonString;
    document.getElementById('export-modal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
}

function copyToClipboard() {
    const copyText = document.getElementById("json-export-output");
    copyText.select();
    document.execCommand("copy");
    alert("JSON code copied! Paste this into products.json");
}