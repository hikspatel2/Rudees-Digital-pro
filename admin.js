import imageCompression from 'browser-image-compression';




// DOM Elements
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const globalLoader = document.getElementById('global-loader');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentPortfolios = [];
let deleteTargetId = null;

// Auth Listener


function checkAuth() {
    const token = localStorage.getItem('admin_token');
    
    if (globalLoader) {
        globalLoader.classList.add('d-none');
        globalLoader.classList.add('hidden');
    }

    if (token) {
        document.getElementById('login-section').classList.add('d-none');
        document.getElementById('admin-dashboard').classList.remove('d-none');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadPortfolios();
        if(typeof loadReviews === 'function') loadReviews();
        if(typeof loadLeads === 'function') loadLeads();
        if(typeof loadWhatsappLeads === 'function') loadWhatsappLeads();
    } else {
        document.getElementById('login-section').classList.remove('d-none');
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('d-none');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }
}
window.addEventListener('DOMContentLoaded', checkAuth);



// Login

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    if(loginError) loginError.classList.add('hidden');
    
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });
        
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('admin_token', data.token);
            checkAuth();
        } else {
            if(loginError) {
                loginError.textContent = data.error || 'Login failed';
                loginError.classList.remove('hidden');
            } else {
                showToast(data.error || 'Login failed', 'danger');
            }
        }
    } catch (error) {
        if(loginError) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        } else {
            showToast(error.message, 'danger');
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In <i class="bi bi-box-arrow-in-right ms-1"></i>';
    }
});

// Logout

document.querySelectorAll('#logout-btn, .logout-btn-mobile').forEach(btn => btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (token) {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
    localStorage.removeItem('admin_token');
    checkAuth();
}));


// Portfolio Modal setup
const portfolioModal = new bootstrap.Modal(document.getElementById('portfolioModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const portfolioForm = document.getElementById('portfolio-form');
const btnSavePortfolio = document.getElementById('btn-save-portfolio');
let editingId = null;
let currentScreenshots = [];

function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

document.getElementById('btn-add-new').addEventListener('click', () => {
    portfolioForm.reset();
    editingId = null;
    document.getElementById('pf-id').value = '';
    document.getElementById('pf-banner-preview-container').classList.add('hidden');
    document.getElementById('pf-banner-url').value = '';
    document.getElementById('pf-screenshots-gallery').innerHTML = '';
    currentScreenshots = [];
    document.getElementById('portfolioModalTitle').textContent = 'Add New Portfolio';
    setTimeout(checkAndRestoreDraft, 100);
});

// Load Portfolios
async function loadPortfolios() {
    try {
        const res = await fetch("/api/portfolios");
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        currentPortfolios = await res.json();
        
        renderPortfolioTable();
        updateStats();
    } catch (error) {
        console.error("Error loading portfolios: ", error);
        showToast("Error loading portfolios", "danger");
    }
}

// Update Stats
function updateStats() {
    document.getElementById('stat-total').textContent = currentPortfolios.length;
    document.getElementById('stat-active').textContent = currentPortfolios.filter(p => p.status === 'active').length;
    document.getElementById('stat-inactive').textContent = currentPortfolios.filter(p => p.status !== 'active').length;
    document.getElementById('stat-featured').textContent = currentPortfolios.filter(p => p.featured).length;
}

// Render Table
function renderPortfolioTable() {
    const tbody = document.getElementById('portfolio-table-body');
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const filterCat = document.getElementById('filter-category').value;
    const filterStatus = document.getElementById('filter-status').value;
    
    tbody.innerHTML = '';
    
    let filtered = currentPortfolios.filter(p => {
        const matchSearch = (p.title || '').toLowerCase().includes(searchInput);
        const matchCat = filterCat ? p.category === filterCat : true;
        const matchStatus = filterStatus ? p.status === filterStatus : true;
        return matchSearch && matchCat && matchStatus;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No portfolio found</td></tr>';
        return;
    }
    
    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.displayOrder || 0}</td>
            <td>
                ${p.bannerImage ? `<img src="${p.bannerImage}" class="portfolio-img-preview">` : '<div class="portfolio-img-preview bg-secondary d-flex align-items-center justify-content-center text-white"><i class="bi bi-image"></i></div>'}
            </td>
            <td><strong>${p.title}</strong><br><small class="text-muted">${p.slug}</small></td>
            <td><span class="badge bg-info text-dark">${p.category}</span></td>
            <td>
                <span class="badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}">${p.status}</span>
            </td>
            <td>
                ${p.featured ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>'}
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-secondary me-1 btn-duplicate" data-id="${p.id}"><i class="bi bi-copy"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Attach events
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => editPortfolio(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.btn-duplicate').forEach(btn => {
        btn.addEventListener('click', (e) => duplicatePortfolio(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteTargetId = e.currentTarget.dataset.id;
            deleteModal.show();
        });
    });
}

// Search & Filter Events
document.getElementById('search-input').addEventListener('input', renderPortfolioTable);
document.getElementById('filter-category').addEventListener('change', renderPortfolioTable);
document.getElementById('filter-status').addEventListener('change', renderPortfolioTable);

// Save Portfolio
btnSavePortfolio.addEventListener('click', async () => {
    if (!portfolioForm.checkValidity()) {
        portfolioForm.reportValidity();
        return;
    }
    
    btnSavePortfolio.disabled = true;
    btnSavePortfolio.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
    
    const title = document.getElementById('pf-title').value;
    const portfolioData = {
        title: title,
        slug: generateSlug(title),
        shortDescription: document.getElementById('pf-shortDesc').value,
        fullDetails: document.getElementById('pf-details').value,
        category: document.getElementById('pf-category').value,
        clientName: document.getElementById('pf-client').value,
        completionDate: document.getElementById('pf-date').value,
        technologyStack: document.getElementById('pf-tech').value,
        websiteUrl: document.getElementById('pf-website').value,
        githubUrl: document.getElementById('pf-github').value,
        status: document.getElementById('pf-status').value,
        displayOrder: parseInt(document.getElementById('pf-order').value) || 0,
        featured: document.getElementById('pf-featured').checked,
        bannerImage: document.getElementById('pf-banner-url').value,
        screenshots: currentScreenshots,
        updatedAt: new Date().toISOString()
    };
    
    try {
        const token = localStorage.getItem('admin_token');
        if (editingId) {
            const res = await fetch("/api/portfolios/" + editingId, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
                body: JSON.stringify(portfolioData)
            });
            if (!res.ok) throw new Error(await res.text());
            showToast("Portfolio updated successfully!", "success");
        } else {
            const res = await fetch("/api/portfolios", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
                body: JSON.stringify(portfolioData)
            });
            if (!res.ok) throw new Error(await res.text());
            showToast("Portfolio added successfully!", "success");
        }
        
        clearDraft();
        portfolioModal.hide();
        loadPortfolios();
    } catch (error) {
        console.error("Error saving portfolio: ", error);
        showToast("Error saving portfolio: " + error.message, "danger");
    } finally {
        btnSavePortfolio.disabled = false;
        btnSavePortfolio.textContent = 'Save Portfolio';
    }
});

// Edit Portfolio
function editPortfolio(id) {
    const p = currentPortfolios.find(item => item.id == id);
    if (!p) return;
    
    editingId = p.id;
    document.getElementById('portfolioModalTitle').textContent = 'Edit Portfolio';
    
    document.getElementById('pf-id').value = p.id;
    document.getElementById('pf-title').value = p.title || '';
    document.getElementById('pf-shortDesc').value = p.shortDescription || '';
    document.getElementById('pf-details').value = p.fullDetails || '';
    document.getElementById('pf-category').value = p.category || 'Web Development';
    document.getElementById('pf-client').value = p.clientName || '';
    document.getElementById('pf-date').value = p.completionDate || '';
    document.getElementById('pf-tech').value = p.technologyStack || '';
    document.getElementById('pf-website').value = p.websiteUrl || '';
    document.getElementById('pf-github').value = p.githubUrl || '';
    document.getElementById('pf-status').value = p.status || 'active';
    document.getElementById('pf-order').value = p.displayOrder || 0;
    document.getElementById('pf-featured').checked = p.featured || false;
    
    const bannerContainer = document.getElementById('pf-banner-preview-container');
    const bannerUrl = document.getElementById('pf-banner-url');
    const bannerPreview = document.getElementById('pf-banner-preview');
    
    if (p.bannerImage) {
        bannerContainer.classList.remove('hidden');
        bannerUrl.value = p.bannerImage;
        bannerPreview.src = p.bannerImage;
    } else {
        bannerContainer.classList.add('hidden');
        bannerUrl.value = '';
    }
    
    currentScreenshots = p.screenshots || [];
    renderScreenshotsPreview();
    
    portfolioModal.show();
    setTimeout(checkAndRestoreDraft, 100);
}

// Duplicate Portfolio
async function duplicatePortfolio(id) {
    const p = currentPortfolios.find(item => item.id == id);
    if (!p) return;
    
    const dupData = { ...p, title: p.title + " (Copy)", slug: generateSlug(p.title + " (Copy)"), status: "inactive", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    delete dupData.id;
    
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch("/api/portfolios", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(dupData)
        });
        if (!res.ok) throw new Error("Failed to duplicate portfolio");
        showToast("Portfolio duplicated successfully!", "success");
        loadPortfolios();
    } catch (error) {
        showToast("Error duplicating: " + error.message, "danger");
    }
}

// Delete Portfolio
document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    if (!deleteTargetId) return;
    
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch("/api/portfolios/" + deleteTargetId, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) throw new Error("Failed to delete portfolio");
        showToast("Portfolio deleted successfully!", "success");
        deleteModal.hide();
        loadPortfolios();
    } catch (error) {
        showToast("Error deleting: " + error.message, "danger");
    }
});

// Upload Banner
document.getElementById('pf-banner-file').addEventListener('change', async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        showToast("File size exceeds 10MB limit.", "danger");
        return;
    }
    
    const progressBar = document.getElementById('pf-banner-progress');
    progressBar.classList.remove('hidden');
    
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        file = await imageCompression(file, options);
    } catch (error) {
        console.error("Compression error:", error);
    }
    
    try {
        const storageRef = ref(storage, 'portfolio/banner/' + Date.now() + '_' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed', 
            (snapshot) => {}, 
            (error) => {
                progressBar.classList.add('hidden');
                showToast("Upload error: " + error.message, "danger");
            }, 
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                document.getElementById('pf-banner-url').value = downloadURL;
                document.getElementById('pf-banner-preview').src = downloadURL;
                document.getElementById('pf-banner-preview-container').classList.remove('hidden');
                progressBar.classList.add('hidden');
                e.target.value = ''; // Reset input
            }
        );
    } catch (error) {
        progressBar.classList.add('hidden');
        showToast("Upload error: " + error.message, "danger");
    }
});

// Remove Banner
document.getElementById('pf-remove-banner').addEventListener('click', () => {
    document.getElementById('pf-banner-url').value = '';
    document.getElementById('pf-banner-preview-container').classList.add('hidden');
});

// Upload Screenshots
document.getElementById('pf-screenshots-file').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const progressBar = document.getElementById('pf-screenshots-progress');
    progressBar.classList.remove('hidden');
    
    let uploadedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.size > 10 * 1024 * 1024) continue;
        
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            };
            file = await imageCompression(file, options);
        } catch (error) {
            console.error("Compression error:", error);
        }
        
        try {
            const storageRef = ref(storage, 'portfolio/screenshots/' + Date.now() + '_' + file.name);
            const snapshot = await uploadBytesResumable(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            currentScreenshots.push(downloadURL);
            uploadedCount++;
        } catch (error) {
            console.error("Screenshot upload error", error);
        }
    }
    
    progressBar.classList.add('hidden');
    e.target.value = '';
    renderScreenshotsPreview();
    if (uploadedCount > 0) {
        showToast(`${uploadedCount} screenshot(s) uploaded`, "success");
        saveDraft();
    }
});

function renderScreenshotsPreview() {
    const gallery = document.getElementById('pf-screenshots-gallery');
    gallery.innerHTML = '';
    
    currentScreenshots.forEach((url, index) => {
        const div = document.createElement('div');
        div.className = 'position-relative m-1';
        div.innerHTML = `
            <img src="${url}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;" onclick="openLightbox('${url}')">
            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 p-0" style="width:20px;height:20px;font-size:10px" onclick="removeScreenshot(${index})"><i class="bi bi-x"></i></button>
        `;
        gallery.appendChild(div);
    });
}

window.removeScreenshot = function(index) {
    currentScreenshots.splice(index, 1);
    renderScreenshotsPreview();
    if (document.getElementById('portfolioModal').classList.contains('show')) saveDraft();
};

// Toast Notification
function showToast(message, type = 'primary') {
    const toastContainer = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Lightbox functionality
window.openLightbox = function(url) {
    document.getElementById('lightbox-image').src = url;
    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    lightboxModal.show();
};

document.getElementById('pf-banner-preview').addEventListener('click', function() {
    if (this.src) window.openLightbox(this.src);
});


// Seed Dummy Data
document.querySelectorAll('#btn-seed-data, .btn-seed-data-mobile').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to add dummy portfolio projects?')) return;
    
    const dummies = [
            {
                title: "E-Commerce Web App",
                shortDescription: "A full-featured e-commerce platform.",
                fullDetails: "Developed a modern, responsive e-commerce web application with cart, checkout, and payment gateway integration.",
                clientName: "TechStore Inc.",
                completionDate: "January 2024",
                technologyStack: "React, Node.js, Firebase",
                websiteUrl: "https://example.com",
                githubUrl: "https://github.com",
                status: "active",
                category: "Web Development",
                displayOrder: 1,
                featured: true,
                bannerImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                screenshots: ["https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80"],
                slug: "e-commerce-web-app"
            },
            {
                title: "Corporate Rebranding",
                shortDescription: "Complete brand identity overhaul.",
                fullDetails: "Created a new logo, color palette, and typography guidelines for a corporate client.",
                clientName: "Global Corp",
                completionDate: "March 2024",
                technologyStack: "Illustrator, Photoshop",
                websiteUrl: "",
                githubUrl: "",
                status: "active",
                category: "Branding",
                displayOrder: 2,
                featured: true,
                bannerImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
                screenshots: [],
                slug: "corporate-rebranding"
            },
            {
                title: "Social Media Campaign",
                shortDescription: "Viral marketing campaign for a new product.",
                fullDetails: "Managed a multi-platform digital marketing campaign resulting in a 200% increase in user engagement.",
                clientName: "StartUp Co",
                completionDate: "February 2024",
                technologyStack: "Facebook Ads, Google Analytics",
                websiteUrl: "",
                githubUrl: "",
                status: "active",
                category: "Digital Marketing",
                displayOrder: 3,
                featured: false,
                bannerImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
                screenshots: [],
                slug: "social-media-campaign"
            },
            {
                title: "Restaurant Menu Design",
                shortDescription: "Creative graphic design for a modern restaurant.",
                fullDetails: "Designed an elegant and appetizing food menu for a high-end restaurant.",
                clientName: "Fine Dining LLC",
                completionDate: "April 2024",
                technologyStack: "InDesign, Photoshop",
                websiteUrl: "",
                githubUrl: "",
                status: "active",
                category: "Graphic Design",
                displayOrder: 4,
                featured: false,
                bannerImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
                screenshots: [],
                slug: "restaurant-menu-design"
            }
    ];

    try {
        const btn = document.getElementById('btn-seed-data');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Seeding...';
        btn.disabled = true;

        for (const p of dummies) {
            const token = localStorage.getItem('admin_token');
            const res = await fetch("/api/portfolios", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
                body: JSON.stringify(p)
            });
            if (!res.ok) throw new Error(await res.text());
        }
        
        showToast('Dummy data seeded successfully', 'success');
        loadPortfolios();
        
        btn.innerHTML = oldText;
        btn.disabled = false;
    } catch (e) {
        console.error(e);
        showToast('Failed to seed data: ' + e.message, 'danger');
        document.getElementById('btn-seed-data').disabled = false;
        document.getElementById('btn-seed-data').innerHTML = 'Seed Data';
    }
}));

// --- Auto-Save Feature ---
const draftKeyPrefix = 'portfolio_draft_';

function getDraftKey() {
    return draftKeyPrefix + (editingId || 'new');
}

function saveDraft() {
    const draftData = {
        title: document.getElementById('pf-title').value,
        shortDesc: document.getElementById('pf-shortDesc').value,
        details: document.getElementById('pf-details').value,
        category: document.getElementById('pf-category').value,
        client: document.getElementById('pf-client').value,
        date: document.getElementById('pf-date').value,
        tech: document.getElementById('pf-tech').value,
        website: document.getElementById('pf-website').value,
        github: document.getElementById('pf-github').value,
        status: document.getElementById('pf-status').value,
        order: document.getElementById('pf-order').value,
        featured: document.getElementById('pf-featured').checked,
        bannerImage: document.getElementById('pf-banner-url').value,
        screenshots: currentScreenshots,
        timestamp: new Date().toLocaleTimeString()
    };
    localStorage.setItem(getDraftKey(), JSON.stringify(draftData));
    
    const indicator = document.getElementById('draft-indicator');
    const timeSpan = document.getElementById('draft-time');
    if (indicator && timeSpan) {
        timeSpan.textContent = 'Draft saved at ' + draftData.timestamp;
        indicator.classList.remove('d-none');
    }
}

function clearDraft() {
    localStorage.removeItem(getDraftKey());
    const indicator = document.getElementById('draft-indicator');
    if (indicator) {
        indicator.classList.add('d-none');
    }
}

function checkAndRestoreDraft() {
    const draftStr = localStorage.getItem(getDraftKey());
    const indicator = document.getElementById('draft-indicator');
    if (indicator) indicator.classList.add('d-none');

    if (draftStr) {
        if (confirm("An unsaved draft was found. Would you like to restore it?")) {
            try {
                const draftData = JSON.parse(draftStr);
                document.getElementById('pf-title').value = draftData.title || '';
                document.getElementById('pf-shortDesc').value = draftData.shortDesc || '';
                document.getElementById('pf-details').value = draftData.details || '';
                document.getElementById('pf-category').value = draftData.category || 'Web Development';
                document.getElementById('pf-client').value = draftData.client || '';
                document.getElementById('pf-date').value = draftData.date || '';
                document.getElementById('pf-tech').value = draftData.tech || '';
                document.getElementById('pf-website').value = draftData.website || '';
                document.getElementById('pf-github').value = draftData.github || '';
                document.getElementById('pf-status').value = draftData.status || 'active';
                document.getElementById('pf-order').value = draftData.order || 0;
                document.getElementById('pf-featured').checked = draftData.featured || false;
                
                document.getElementById('pf-banner-url').value = draftData.bannerImage || '';
                const bannerContainer = document.getElementById('pf-banner-preview-container');
                if (draftData.bannerImage) {
                    bannerContainer.classList.remove('hidden');
                    document.getElementById('pf-banner-preview').src = draftData.bannerImage;
                } else {
                    bannerContainer.classList.add('hidden');
                }
                
                currentScreenshots = draftData.screenshots || [];
                renderScreenshotsPreview();
                
                showToast("Draft restored.", "info");
            } catch(e) {
                console.error("Failed to parse draft", e);
            }
        } else {
            clearDraft();
        }
    }
}

let draftTimeout;
portfolioForm.addEventListener('input', () => {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(saveDraft, 1000);
});
portfolioForm.addEventListener('change', () => {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(saveDraft, 1000);
});



const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwdInput = document.getElementById('new-password');
        const btn = document.getElementById('change-pwd-btn');
        btn.disabled = true;
        btn.textContent = 'Updating...';
        
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ newPassword: pwdInput.value })
            });
            
            const data = await res.json();
            if (data.success) {
                showToast('Password updated successfully', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                if (modal) modal.hide();
                pwdInput.value = '';
            } else {
                showToast(data.error || 'Failed to update password', 'danger');
            }
        } catch (err) {
            showToast(err.message, 'danger');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Update Password';
        }
    });
}
