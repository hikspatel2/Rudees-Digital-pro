
// Query dynamically inside functions

// Append Modal HTML to body
const modalHtml = `
<div id="pf-frontend-modal" class="fixed inset-0 z-[9999] hidden items-center justify-center p-4 sm:p-6">
    <div id="pf-modal-backdrop" class="fixed inset-0 bg-gray-900/80 transition-opacity opacity-0"></div>
    <div id="pf-modal-content" class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col transform scale-95 opacity-0 transition-all duration-300">
        <!-- Header Image -->
        <div class="relative w-full h-64 sm:h-80 bg-gray-100 shrink-0">
            <img id="pf-modal-banner" src="" class="w-full h-full object-cover">
            <button id="pf-modal-close" class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-colors z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>
        
        <!-- Content -->
        <div class="p-6 sm:p-8 shrink-0">
            <div class="flex flex-wrap gap-2 mb-3">
                <span id="pf-modal-category" class="px-3 py-1 bg-brand-100 text-brand-700 text-sm font-semibold rounded-full">Category</span>
            </div>
            <h2 id="pf-modal-title" class="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">Project Title</h2>
            
            <div class="grid sm:grid-cols-3 gap-6 mb-8 border-y border-gray-100 py-6">
                <div class="hidden" id="pf-modal-client-container">
                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Client</h4>
                    <p id="pf-modal-client" class="text-gray-900 font-medium">-</p>
                </div>
                <div class="hidden" id="pf-modal-date-container">
                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h4>
                    <p id="pf-modal-date" class="text-gray-900 font-medium">-</p>
                </div>
                <div class="hidden" id="pf-modal-tech-container">
                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tech Stack</h4>
                    <p id="pf-modal-tech" class="text-gray-900 font-medium">-</p>
                </div>
            </div>

            <div id="pf-modal-details" class="prose prose-orange max-w-none text-gray-600 mb-8">
                <!-- Rich text details -->
            </div>
            
            <div id="pf-modal-links" class="flex flex-wrap gap-4 mb-8">
                <a href="#" id="pf-modal-website" target="_blank" class="hidden inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors">
                    Visit Website <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                </a>
                <a href="#" id="pf-modal-github" target="_blank" class="hidden inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                    View GitHub <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
            </div>

            <div id="pf-modal-gallery-section" class="hidden">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                <div id="pf-modal-gallery" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <!-- Gallery Images -->
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Lightbox -->
<div id="pf-lightbox" class="fixed inset-0 z-[10000] hidden items-center justify-center bg-black/95">
    <button id="pf-lightbox-close" class="absolute top-4 right-4 text-white p-2 hover:text-brand-400 transition-colors z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    <button id="pf-lightbox-prev" class="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-brand-400 transition-colors z-10 hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <button id="pf-lightbox-next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:text-brand-400 transition-colors z-10 hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <img id="pf-lightbox-img" src="" class="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300">
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHtml);

const modal = document.getElementById('pf-frontend-modal');
const modalBackdrop = document.getElementById('pf-modal-backdrop');
const modalContent = document.getElementById('pf-modal-content');
const modalClose = document.getElementById('pf-modal-close');

const lightbox = document.getElementById('pf-lightbox');
const lightboxImg = document.getElementById('pf-lightbox-img');
const lightboxClose = document.getElementById('pf-lightbox-close');
const lightboxPrev = document.getElementById('pf-lightbox-prev');
const lightboxNext = document.getElementById('pf-lightbox-next');

let currentGallery = [];
let currentLightboxIndex = 0;
let currentPortfolios = [];

function openModal(item) {
    if (!modal) return;
    document.getElementById('pf-modal-banner').src = item.bannerImage || 'https://via.placeholder.com/800x400?text=No+Image';
    document.getElementById('pf-modal-category').textContent = item.category || 'Portfolio';
    document.getElementById('pf-modal-title').textContent = item.title;
    
    // Optional fields
    if (item.client) {
        document.getElementById('pf-modal-client-container').classList.remove('hidden');
        document.getElementById('pf-modal-client').textContent = item.client;
    } else document.getElementById('pf-modal-client-container').classList.add('hidden');
    
    if (item.completionDate) {
        document.getElementById('pf-modal-date-container').classList.remove('hidden');
        document.getElementById('pf-modal-date').textContent = item.completionDate;
    } else document.getElementById('pf-modal-date-container').classList.add('hidden');
    
    if (item.technology) {
        document.getElementById('pf-modal-tech-container').classList.remove('hidden');
        document.getElementById('pf-modal-tech').textContent = item.technology;
    } else document.getElementById('pf-modal-tech-container').classList.add('hidden');

    document.getElementById('pf-modal-details').innerHTML = item.workDetails || item.shortDescription || '';
    
    // Links
    const websiteBtn = document.getElementById('pf-modal-website');
    if (item.website) {
        websiteBtn.href = item.website;
        websiteBtn.classList.remove('hidden');
        websiteBtn.classList.add('inline-flex');
    } else websiteBtn.classList.add('hidden');
    
    const githubBtn = document.getElementById('pf-modal-github');
    if (item.github) {
        githubBtn.href = item.github;
        githubBtn.classList.remove('hidden');
        githubBtn.classList.add('inline-flex');
    } else githubBtn.classList.add('hidden');

    // Gallery
    const gallerySection = document.getElementById('pf-modal-gallery-section');
    const galleryContainer = document.getElementById('pf-modal-gallery');
    
    if (item.screenshots && item.screenshots.length > 0) {
        gallerySection.classList.remove('hidden');
        galleryContainer.innerHTML = '';
        currentGallery = item.screenshots;
        
        item.screenshots.forEach((url, idx) => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'w-full h-32 sm:h-48 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity';
            img.onclick = () => openLightbox(idx);
            galleryContainer.appendChild(img);
        });
    } else {
        gallerySection.classList.add('hidden');
        currentGallery = [];
    }

    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // small delay to allow display block to apply before opacity transition
    setTimeout(() => {
        modalBackdrop.classList.remove('opacity-0');
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalBackdrop.classList.add('opacity-0');
    modalContent.classList.add('opacity-0', 'scale-95');
    modalContent.classList.remove('opacity-100', 'scale-100');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }, 300);
}

// Lightbox
function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    
    if (currentGallery.length > 1) {
        lightboxPrev.classList.remove('hidden');
        lightboxNext.classList.remove('hidden');
    } else {
        lightboxPrev.classList.add('hidden');
        lightboxNext.classList.add('hidden');
    }
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    // reset zoom if any
    lightboxImg.style.transform = 'scale(1)';
}

function updateLightboxImage() {
    lightboxImg.src = currentGallery[currentLightboxIndex];
}

function lightboxNextImage() {
    if (currentGallery.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentGallery.length;
    updateLightboxImage();
}

function lightboxPrevImage() {
    if (currentGallery.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxImage();
}

// Events
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextImage);
if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevImage);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lightbox && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        } else if (modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
    }
    
    if (lightbox && !lightbox.classList.contains('hidden')) {
        if (e.key === 'ArrowRight') lightboxNextImage();
        if (e.key === 'ArrowLeft') lightboxPrevImage();
    }
});

// Swipe support for lightbox
let touchStartX = 0;
let touchEndX = 0;
if (lightbox) lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});
if (lightbox) lightbox.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});
function handleSwipe() {
    if (touchEndX < touchStartX - 50) lightboxNextImage();
    if (touchEndX > touchStartX + 50) lightboxPrevImage();
}

// Fetch and Render
async function fetchAndRenderPortfolios() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;
    
    try {
        const res = await fetch("/api/portfolios");
        if (!res.ok) throw new Error("Failed to fetch");
        const allPortfolios = await res.json();
        currentPortfolios = allPortfolios.filter(p => p.status === "active");
        // Convert workDetails back to fullDetails and clientName to client for modal mapping
        currentPortfolios = currentPortfolios.map(p => ({
            ...p,
            workDetails: p.fullDetails,
            client: p.clientName,
            technology: p.technologyStack,
            website: p.websiteUrl,
            github: p.githubUrl
        }));
        
        
        let toRender = currentPortfolios;
        if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '') {
            toRender = currentPortfolios.filter(p => p.featured);
            if (toRender.length === 0) toRender = currentPortfolios.slice(0, 3); // Fallback if none featured
        }
        renderPortfolioGrid(toRender);
    } catch (error) {
        console.error("Error fetching portfolios:", error);
        // Fallback or silently fail (it's public UI)
    }
}

function renderPortfolioGrid(portfolios) {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;
    document.getElementById('portfolio-grid').innerHTML = '';
    
    if (portfolios.length === 0) {
        document.getElementById('portfolio-grid').innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No portfolio items found.</div>';
        return;
    }
    
    portfolios.forEach((item, index) => {
        const div = document.createElement('div');
        // Match the existing UI styling exactly
        div.className = `portfolio-item group relative rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 aspect-[4/3] reveal`;
        div.setAttribute('data-category', item.category);
        div.style.transitionDelay = `${(index % 3) * 0.1}s`;
        
        div.innerHTML = `
            ${item.bannerImage 
                ? `<img src="${item.bannerImage}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">`
                : `<div class="absolute inset-0 bg-orange-50 flex items-center justify-center">
                       <svg class="w-16 h-16 text-accent/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                   </div>`
            }
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 cursor-pointer" onclick="window.openPortfolioModal('${item.id}')">
                <div class="text-accent text-sm font-bold tracking-wider uppercase mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">${item.category || 'Portfolio'}</div>
                <h3 class="font-display text-2xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">${item.title}</h3>
                <p class="text-gray-300 text-sm mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">${item.shortDescription || ''}</p>
                <div class="inline-flex items-center gap-2 text-white font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                    Read More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
            </div>
        `;
        
        document.getElementById('portfolio-grid').appendChild(div);
    });
    if (window.lucide) { window.lucide.createIcons(); }
}

// Expose openModal to global scope so inline onclick works
window.openPortfolioModal = function(id) {
    const item = currentPortfolios.find(p => p.id == id);
    if (item) {
        openModal(item);
    }
};

// Initialize
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fetchAndRenderPortfolios); } else { fetchAndRenderPortfolios(); }

// Export for any other script if needed
export { fetchAndRenderPortfolios };

// Hook into existing filters if they exist
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        // Wait for fetchAndRenderPortfolios to complete
        setTimeout(() => {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filterValue = btn.getAttribute('data-filter');
                    
                    
                    // Update active class
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Actually filter the grid

                    let filtered = currentPortfolios;
                    if (filterValue !== 'all') {
                        filtered = currentPortfolios.filter(p => (p.category || '').toLowerCase().replace(/\s+/g, '') === (filterValue || '').toLowerCase().replace(/\s+/g, '') || p.category === filterValue);
                    }
                    renderPortfolioGrid(filtered);
                });
            });
        }, 1000);
    }
});
