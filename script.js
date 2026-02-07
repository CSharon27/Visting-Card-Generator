/**
 * CardGen Core Logic
 */

const app = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadTheme();
        this.initTabs();
        this.checkEditMode();
    },

    cacheDOM() {
        // Form Inputs
        this.inputs = {
            name: document.getElementById('input-name'),
            title: document.getElementById('input-title'),
            company: document.getElementById('input-company'),
            phone: document.getElementById('input-phone'),
            email: document.getElementById('input-email'),
            website: document.getElementById('input-website'),
            address: document.getElementById('input-address'),
            logo: document.getElementById('input-logo'),
            template: document.getElementById('select-template'),
            primaryColor: document.getElementById('input-primary-color'),
            textColor: document.getElementById('input-text-color'),
            font: document.getElementById('select-font'),
            rounded: document.getElementById('input-rounded')
        };

        // Preview Elements
        this.previews = {
            card: document.getElementById('card-preview'),
            name: document.getElementById('preview-name'),
            title: document.getElementById('preview-title'),
            phone: document.getElementById('preview-phone'),
            email: document.getElementById('preview-email'),
            website: document.getElementById('preview-website'),
            address: document.getElementById('preview-address'),
            logoContainer: document.getElementById('preview-logo-container')
        };

        this.themeToggle = document.getElementById('theme-toggle');
        this.modal = document.getElementById('qr-modal');
    },

    bindEvents() {
        if (!this.inputs.name) {
            if (this.themeToggle) this.themeToggle.addEventListener('click', () => this.toggleTheme());
            return;
        }

        // Real-time text updates
        ['name', 'title', 'phone', 'email', 'website', 'address'].forEach(key => {
            if (this.inputs[key]) {
                this.inputs[key].addEventListener('input', () => this.updateText(key));
            }
        });

        // Style updates
        this.inputs.template.addEventListener('change', () => this.applyTemplate());
        this.inputs.primaryColor.addEventListener('input', () => this.updateStyles());
        this.inputs.textColor.addEventListener('input', () => this.updateStyles());
        this.inputs.font.addEventListener('change', () => this.updateStyles());
        this.inputs.rounded.addEventListener('change', () => this.updateStyles());

        // Image upload
        this.inputs.logo.addEventListener('change', (e) => this.handleLogoUpload(e));

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    },

    initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Update buttons
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                const targetElement = document.getElementById(`${target}-tab`);
                if (targetElement) targetElement.style.display = 'block';
            });
        });
    },

    updateText(key) {
        if (this.previews[key]) {
            this.previews[key].textContent = this.inputs[key].value || `Your ${key}`;
        }
    },

    updateStyles() {
        const primary = this.inputs.primaryColor.value;
        const text = this.inputs.textColor.value;
        const font = this.inputs.font.value;
        const isRounded = this.inputs.rounded.checked;

        this.previews.card.style.setProperty('--primary-color', primary);
        this.previews.card.style.setProperty('--text-color', text);
        this.previews.card.style.fontFamily = font;
        this.previews.card.style.borderRadius = isRounded ? '15px' : '0px';

        // Update decorative elements
        const element = this.previews.card.querySelector('.template-element');
        if (element) element.style.background = primary;

        this.previews.name.style.color = text;
    },

    applyTemplate() {
        const template = this.inputs.template.value;
        this.previews.card.className = `template-${template}`;

        // Custom logic for templates
        if (template === 'modern-dark') {
            this.previews.card.style.background = '#1e293b';
            this.inputs.textColor.value = '#f8fafc';
        } else if (template === 'creative') {
            this.previews.card.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
        } else {
            this.previews.card.style.background = '#ffffff';
        }
        this.updateStyles();
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.previews.logoContainer.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            };
            reader.readAsDataURL(file);
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);

        const icon = this.themeToggle.querySelector('i');
        if (icon) icon.className = nextTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = this.themeToggle.querySelector('i');
        if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    saveDesign() {
        const design = {
            id: Date.now(),
            name: this.inputs.name.value,
            title: this.inputs.title.value,
            company: this.inputs.company.value,
            phone: this.inputs.phone.value,
            email: this.inputs.email.value,
            website: this.inputs.website.value,
            address: this.inputs.address.value,
            styles: {
                primary: this.inputs.primaryColor.value,
                text: this.inputs.textColor.value,
                font: this.inputs.font.value,
                template: this.inputs.template.value,
                rounded: this.inputs.rounded.checked
            }
        };

        let saved = JSON.parse(localStorage.getItem('savedCards') || '[]');
        saved.push(design);
        localStorage.setItem('savedCards', JSON.stringify(saved));
        alert('Design saved successfully!');
    },

    exportCard(format) {
        const card = document.getElementById('card-preview');
        html2canvas(card, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `my-card-${Date.now()}.${format}`;
            link.href = canvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`, 1.0);
            link.click();
        });
    },

    generateQR() {
        const website = this.inputs.website.value || 'https://cardgen.com';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(website)}`;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Scan for Website</h3>
                <img src="${qrUrl}" alt="QR Code" style="margin: 20px 0; border: 1px solid #eee; padding: 10px;">
                <p style="font-size: 0.9rem; color: var(--text-muted); mb-20">${website}</p>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            const saved = JSON.parse(localStorage.getItem('savedCards') || '[]');
            const card = saved.find(c => c.id == editId);
            if (card) {
                this.inputs.name.value = card.name;
                this.inputs.title.value = card.title;
                this.inputs.company.value = card.company;
                this.inputs.phone.value = card.phone;
                this.inputs.email.value = card.email;
                this.inputs.website.value = card.website;
                this.inputs.address.value = card.address;

                this.inputs.primaryColor.value = card.styles.primary;
                this.inputs.textColor.value = card.styles.text;
                this.inputs.font.value = card.styles.font;
                this.inputs.template.value = card.styles.template;
                this.inputs.rounded.checked = card.styles.rounded;

                // Sync all text
                ['name', 'title', 'phone', 'email', 'website', 'address'].forEach(key => this.updateText(key));
                this.applyTemplate();
            }
        }
    },

    resetPreview() {
        if (confirm('Are you sure you want to reset all changes?')) {
            window.location.reload();
        }
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => app.init());
