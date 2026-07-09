
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

