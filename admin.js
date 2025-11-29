// Admin Logic
let adminProducts = []; // Holds the state of products in the admin panel
let adminInquiries = [];

// Check Auth on Load
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
        showPanel();
        initAdminData();
    }
    setupDragAndDrop();
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
            renderProductTable();
        }

        // Load Inquiries from LocalStorage
        const savedInquiries = localStorage.getItem('luxe_inquiries');
        if (savedInquiries) {
            adminInquiries = JSON.parse(savedInquiries);
            document.getElementById('dash-total-inquiries').textContent = adminInquiries.length;
        }
    } catch (e) {
        console.error("Failed to fetch products", e);
    }
}

// --- Render Tables ---

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
            <td class="p-4 text-right flex justify-end gap-2">
                <button onclick="editProduct('${p.id}')" class="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition">
                     <i data-lucide="edit" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
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
        tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-gray-400">No inquiries tracked yet.</td></tr>';
        return;
    }

    adminInquiries.forEach(inq => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition border-b border-gray-100";
        tr.innerHTML = `
            <td class="p-4 text-sm text-gray-600">${inq.date}</td>
            <td class="p-4 font-bold text-gray-900">${inq.customerName}</td>
            <td class="p-4 text-sm text-gray-600 font-mono">${inq.mobile}</td>
            <td class="p-4 text-sm text-pink-600 font-medium">${inq.productName} <span class="text-xs text-gray-400">(${inq.productId})</span></td>
             <td class="p-4 text-sm text-gray-600">${inq.requestedDate || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function clearInquiries() {
    if(confirm("Are you sure you want to clear all inquiry history?")) {
        adminInquiries = [];
        localStorage.removeItem('luxe_inquiries');
        renderInquiriesTable();
        document.getElementById('dash-total-inquiries').textContent = 0;
    }
}

// --- Product Actions ---

function toggleAvailability(id) {
    const product = adminProducts.find(p => p.id === id);
    if (product) {
        product.available = !product.available;
        renderProductTable();
    }
}

// Open Modal for ADD
function openAddModal() {
    document.getElementById('modal-title').textContent = "Add New Product";
    document.getElementById('save-btn').textContent = "Add Product";
    document.getElementById('edit-mode-id').value = "";
    
    // Clear inputs
    document.getElementById('new-id').value = "";
    document.getElementById('new-name').value = "";
    document.getElementById('new-category').value = "Bridal";
    document.getElementById('new-price').value = "";
    document.getElementById('new-original').value = "";
    document.getElementById('new-size').value = "";
    document.getElementById('new-desc').value = "";
    clearImage(); // Reset image input

    document.getElementById('add-modal').classList.remove('hidden');
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
    
    // Set Image Preview
    document.getElementById('new-image').value = product.image;
    document.getElementById('image-preview').src = product.image;
    document.getElementById('drop-zone').classList.add('hidden');
    document.getElementById('image-preview-container').classList.remove('hidden');

    document.getElementById('add-modal').classList.remove('hidden');
}

function closeAddModal() {
    document.getElementById('add-modal').classList.add('hidden');
}

// Save (Add or Update)
function saveProduct() {
    const editId = document.getElementById('edit-mode-id').value;
    const isEdit = !!editId;

    const data = {
        id: document.getElementById('new-id').value || `CH${Math.floor(Math.random() * 1000)}`,
        name: document.getElementById('new-name').value,
        category: document.getElementById('new-category').value,
        price: Number(document.getElementById('new-price').value) || 0,
        originalPrice: Number(document.getElementById('new-original').value) || 0,
        description: document.getElementById('new-desc').value,
        image: document.getElementById('new-image').value || 'https://via.placeholder.com/400',
        available: true, // Default to true if new
        size: document.getElementById('new-size').value
    };

    if (!data.name || !data.price) {
        alert("Name and Price are required.");
        return;
    }

    if (isEdit) {
        const index = adminProducts.findIndex(p => p.id === editId);
        if (index !== -1) {
            // Keep availability status from existing
            data.available = adminProducts[index].available;
            adminProducts[index] = data;
        }
    } else {
        adminProducts.push(data);
    }

    closeAddModal();
    renderProductTable();
    alert(isEdit ? "Product updated!" : "Product added!");
}

function deleteProduct(id) {
    if (confirm("Delete this product from the list?")) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        renderProductTable();
    }
}

// --- Drag and Drop Image Logic ---

function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-pink-500', 'bg-pink-50');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-pink-500', 'bg-pink-50');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-pink-500', 'bg-pink-50');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result;
        document.getElementById('new-image').value = base64Data;
        document.getElementById('image-preview').src = base64Data;
        
        // Show Preview, Hide Drop Zone
        document.getElementById('drop-zone').classList.add('hidden');
        document.getElementById('image-preview-container').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    document.getElementById('new-image').value = "";
    document.getElementById('file-input').value = ""; // Reset file input
    document.getElementById('drop-zone').classList.remove('hidden');
    document.getElementById('image-preview-container').classList.add('hidden');
}

// --- Export / Save ---
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