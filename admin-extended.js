
let reviewModal;


    reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    
    // Navigation logic
    const navPortfolios = document.getElementById('nav-portfolios');
    const navReviews = document.getElementById('nav-reviews');
    const navLeads = document.getElementById('nav-leads');
    const navWhatsapp = document.getElementById('nav-whatsapp');
    
    const secPortfolios = document.getElementById('section-portfolios');
    const secReviews = document.getElementById('section-reviews');
    const secLeads = document.getElementById('section-leads');
    const secWhatsapp = document.getElementById('section-whatsapp');
    
    const navs = [navPortfolios, navReviews, navLeads, navWhatsapp];
    const secs = [secPortfolios, secReviews, secLeads, secWhatsapp];
    
    function switchTab(index) {
        navs.forEach((nav, i) => {
            if (!nav) return;
            if (i === index) nav.classList.add('active');
            else nav.classList.remove('active');
        });
        
        const leadsGroup = document.getElementById('nav-leads-group');
        if (leadsGroup) {
            if (index === 2 || index === 3) {
                leadsGroup.classList.add('active', 'text-primary');
            } else {
                leadsGroup.classList.remove('active', 'text-primary');
            }
        }
        
        secs.forEach((sec, i) => {
            if (!sec) return;
            if (i === index) {
                sec.classList.remove('d-none');
                sec.classList.add('active-section');
            } else {
                sec.classList.add('d-none');
                sec.classList.remove('active-section');
            }
        });
        
        if (index === 1) loadReviews();
        if (index === 2) loadLeads();
        if (index === 3) loadWhatsappLeads();
    }
    
    if (navPortfolios) navPortfolios.addEventListener('click', (e) => { e.preventDefault(); switchTab(0); });
    if (navReviews) navReviews.addEventListener('click', (e) => { e.preventDefault(); switchTab(1); });
    if (navLeads) navLeads.addEventListener('click', (e) => { e.preventDefault(); switchTab(2); });
    if (navWhatsapp) navWhatsapp.addEventListener('click', (e) => { e.preventDefault(); switchTab(3); });

    // Review Form Submit
    document.getElementById('review-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rv-id').value;
        const data = {
            name: document.getElementById('rv-name').value,
            designation: document.getElementById('rv-designation').value,
            rating: parseInt(document.getElementById('rv-rating').value),
            text: document.getElementById('rv-text').value,
            status: document.getElementById('rv-status').value
        };
        
        try {
            const token = localStorage.getItem('admin_token');
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/api/reviews/${id}` : `/api/reviews`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to save review');
            reviewModal.hide();
            loadReviews();
        } catch (err) {
            console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
            alert("Error saving review");
        }
    });
window.openReviewModal = function(id = null) {
    document.getElementById('review-form').reset();
    document.getElementById('rv-id').value = id || '';
    reviewModal.show();
}

window.editReview = async function(id) {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/reviews', { headers: { 'Authorization': `Bearer ${token}` }});
        const reviews = await res.json();
        const review = reviews.find(r => r.id == id);
        if (review) {
            document.getElementById('rv-id').value = review.id;
            document.getElementById('rv-name').value = review.name;
            document.getElementById('rv-designation').value = review.designation || '';
            document.getElementById('rv-rating').value = review.rating;
            document.getElementById('rv-text').value = review.text;
            document.getElementById('rv-status').value = review.status;
            reviewModal.show();
        }
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

window.deleteReview = async function(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadReviews();
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

async function loadReviews() {
    try {
        const tbody = document.getElementById('reviews-table-body');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        
         const token = localStorage.getItem('admin_token'); 
        if (!token) { console.error("No token!"); return; }
        
        const res = await fetch('/api/reviews', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        tbody.innerHTML = '';
        if (!Array.isArray(data)) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>';
            return;
        }
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No reviews found</td></tr>';
            return;
        }
        
        data.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.name}<br><small class="text-muted">${r.designation || ''}</small></td>
                    <td>${r.rating} / 5</td>
                    <td><span class="badge ${r.status === 'active' ? 'bg-success' : 'bg-secondary'}">${r.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editReview(${r.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${r.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

async function loadLeads() {
    try {
        const tbody = document.getElementById('leads-table-body');
        tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
        
         const token = localStorage.getItem('admin_token'); 
        if (!token) { console.error("No token!"); return; }
        
        const res = await fetch('/api/leads', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        tbody.innerHTML = '';
        if (!Array.isArray(data)) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data</td></tr>';
            return;
        }
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No leads found</td></tr>';
            return;
        }
        
        data.forEach(l => {
            const date = new Date(l.createdAt).toLocaleString();
            tbody.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="form-check-input row-checkbox-leads" value="${l.id}"></td>
                    <td>${date}</td>
                    <td>${l.name}</td>
                    <td>${l.email}<br><small class="text-muted">${l.phone || ''}</small></td>
                    <td>${l.service || 'N/A'}<br><small>${l.message || ''}</small></td>
                    <td>
                        <select class="form-select form-select-sm ${l.status === 'new' ? 'text-bg-primary' : l.status === 'contacted' ? 'text-bg-warning' : 'text-bg-success'}" onchange="updateLeadStatus(${l.id}, this.value, 'leads')">
                            <option class="bg-white text-dark" value="new" ${l.status === 'new' ? 'selected' : ''}>New</option>
                            <option class="bg-white text-dark" value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option class="bg-white text-dark" value="closed" ${l.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" title="Quick Reply" onclick="openQuickReply('\$\{l.name\}', '\$\{l.phone\}')"><i class="bi bi-reply"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLead(\$\{l.id\}, 'leads')"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

async function loadWhatsappLeads() {
    try {
        const tbody = document.getElementById('whatsapp-table-body');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        
         const token = localStorage.getItem('admin_token'); 
        if (!token) { console.error("No token!"); return; }
        
        const res = await fetch('/api/whatsapp-leads', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        tbody.innerHTML = '';
        if (!Array.isArray(data)) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>';
            return;
        }
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No leads found</td></tr>';
            return;
        }
        
        data.forEach(l => {
            const date = new Date(l.createdAt).toLocaleString();
            tbody.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="form-check-input row-checkbox-whatsapp-leads" value="${l.id}"></td>
                    <td>${date}</td>
                    <td>${l.phone}</td>
                    <td>${l.message || 'N/A'}</td>
                    <td>
                        <select class="form-select form-select-sm ${l.status === 'new' ? 'text-bg-primary' : l.status === 'contacted' ? 'text-bg-warning' : 'text-bg-success'}" onchange="updateLeadStatus(${l.id}, this.value, 'whatsapp-leads')">
                            <option class="bg-white text-dark" value="new" ${l.status === 'new' ? 'selected' : ''}>New</option>
                            <option class="bg-white text-dark" value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option class="bg-white text-dark" value="closed" ${l.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" title="Quick Reply" onclick="openQuickReply('', '\$\{l.phone\}')"><i class="bi bi-reply"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLead(\$\{l.id\}, 'whatsapp-leads')"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

window.updateLeadStatus = async function(id, status, type) {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/${type}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            if (type === 'leads') loadLeads();
            if (type === 'whatsapp-leads') loadWhatsappLeads();
        }
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}

window.deleteLead = async function(id, type) {
    if (!confirm('Delete this lead?')) return;
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/${type}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            if (type === 'leads') loadLeads();
            if (type === 'whatsapp-leads') loadWhatsappLeads();
        }
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
    }
}


window.toggleSelectAll = function(type, checkbox) {
    const checkboxes = document.querySelectorAll(`.row-checkbox-${type}`);
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
}

window.applyBulkAction = async function(type) {
    const select = document.getElementById(`bulk-${type}-action`);
    if (!select) return;
    const action = select.value;
    if (!action) {
        alert('Please select an action');
        return;
    }

    const checkboxes = document.querySelectorAll(`.row-checkbox-${type}:checked`);
    if (checkboxes.length === 0) {
        alert('Please select at least one lead');
        return;
    }

    if (!confirm(`Are you sure you want to ${action} ${checkboxes.length} selected lead(s)?`)) return;

    try {
        const token = localStorage.getItem('admin_token');
        const promises = Array.from(checkboxes).map(async (cb) => {
            const id = cb.value;
            if (action === 'delete') {
                return fetch(`/api/${type}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                return fetch(`/api/${type}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status: action })
                });
            }
        });

        await Promise.all(promises);
        
        // Reset select all checkbox
        const selectAllCb = document.querySelector(`#section-${type === 'whatsapp-leads' ? 'whatsapp' : 'leads'} thead input[type="checkbox"]`);
        if (selectAllCb) selectAllCb.checked = false;
        
        select.value = '';

        if (type === 'leads') loadLeads();
        if (type === 'whatsapp-leads') loadWhatsappLeads();
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
        alert('Error performing bulk action');
    }
}

window.exportLeadsCSV = async function(type) {
    try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            alert('Please login first');
            return;
        }
        
        const endpoint = type === 'whatsapp' ? '/api/whatsapp-leads' : '/api/leads';
        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            alert('No data to export');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        const keys = Object.keys(data[0]);
        csvContent += keys.join(",") + "\r\n";
        
        data.forEach(function(rowArray) {
            let row = keys.map(k => {
                let val = rowArray[k] || '';
                // Escape quotes and wrap in quotes if contains comma
                val = val.toString().replace(/"/g, '""');
                if (val.search(/("|,|\n)/g) >= 0) val = '"' + val + '"';
                return val;
            });
            csvContent += row.join(",") + "\r\n";
        });
        
        const blob = new Blob([csvContent.replace("data:text/csv;charset=utf-8,", "")], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${type}_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (err) {
        console.error(err); fetch('/api/debug-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.toString(), stack: err.stack, location: 'admin-extended.js' }) }).catch(()=>null);
        alert('Failed to export CSV');
    }
};

let quickReplyModalInst;
let currentLeadName = '';
let currentLeadPhone = '';

window.openQuickReply = function(name, phone) {
    currentLeadName = name && name !== 'undefined' ? name : 'there';
    currentLeadPhone = phone && phone !== 'undefined' ? phone : '';
    
    if (!quickReplyModalInst) {
        quickReplyModalInst = new bootstrap.Modal(document.getElementById('quickReplyModal'));
    }
    
    document.getElementById('qr-template-select').value = 'welcome';
    updateQuickReplyPreview();
    
    const whatsappLink = document.getElementById('qr-whatsapp-link');
    if (currentLeadPhone) {
        whatsappLink.classList.remove('d-none');
        let formattedPhone = currentLeadPhone.replace(/\D/g, '');
        whatsappLink.href = 'https://wa.me/' + formattedPhone;
    } else {
        whatsappLink.classList.add('d-none');
    }
    
    quickReplyModalInst.show();
};

window.updateQuickReplyPreview = function() {
    const template = document.getElementById('qr-template-select').value;
    const preview = document.getElementById('qr-preview');
    let text = '';
    
    const name = currentLeadName;
    
    switch (template) {
        case 'welcome':
            text = 'Hi ' + name + ',\n\nThank you for reaching out to Rudees Digital! We\'ve received your inquiry and are excited to learn more about your project.\n\nCould you let us know a good time to connect and discuss your requirements in detail?\n\nBest regards,\nRudees Digital Team';
            break;
        case 'followup':
            text = 'Hi ' + name + ',\n\nI\'m following up on our previous conversation regarding your project.\n\nAre you still interested in moving forward? Let me know if you have any questions.\n\nBest regards,\nRudees Digital Team';
            break;
        case 'meeting':
            text = 'Hi ' + name + ',\n\nI\'d like to schedule a brief meeting to discuss how Rudees Digital can help you achieve your goals.\n\nHere is a link to my calendar to find a time that works for you: [Insert Calendar Link]\n\nLooking forward to speaking with you!\n\nBest,\nRudees Digital Team';
            break;
        case 'portfolio':
            text = 'Hi ' + name + ',\n\nThanks for your interest! As requested, here is a link to some of our recent work:\nhttps://rudeesdigital.dev/portfolio.html\n\nLet me know if you\'d like to see more specific examples related to your industry.\n\nBest regards,\nRudees Digital Team';
            break;
    }
    
    preview.value = text;
    
    const whatsappLink = document.getElementById('qr-whatsapp-link');
    if (currentLeadPhone && !whatsappLink.classList.contains('d-none')) {
        let formattedPhone = currentLeadPhone.replace(/\D/g, '');
        whatsappLink.href = 'https://wa.me/' + formattedPhone + '?text=' + encodeURIComponent(text);
    }
};

window.copyQuickReply = function(event) {
    const preview = document.getElementById('qr-preview');
    preview.select();
    preview.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(preview.value).then(() => {
        const btn = event.currentTarget;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check2"></i> Copied!';
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
        
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-primary');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard.');
    });
};
