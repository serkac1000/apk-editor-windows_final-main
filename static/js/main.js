// APK Editor JavaScript functionality

class APKEditor {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFeatherIcons();
    }

    setupEventListeners() {
        // File upload preview
        const fileInput = document.getElementById('apk_file');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Sign APK buttons
        document.querySelectorAll('.sign-apk-btn').forEach(btn => {
            btn.addEventListener('click', this.handleSignAPK.bind(this));
        });

        // GUI modification form
        const guiForm = document.getElementById('gui-modification-form');
        if (guiForm) {
            guiForm.addEventListener('submit', this.handleGUIModification.bind(this));
        }

        // Generate function form
        const generateForm = document.getElementById('generate-function-form');
        if (generateForm) {
            generateForm.addEventListener('submit', this.handleGenerateFunction.bind(this));
        }

        // Preview functionality
        this.setupPreviewHandlers();
    }

    setupFeatherIcons() {
        // Fix invalid feather icons with valid alternatives
        const iconMappings = {
            'wand': 'magic-wand',
            'palette': 'edit-3',
            'color-palette': 'edit-3'
        };

        document.querySelectorAll('[data-feather]').forEach(icon => {
            const iconName = icon.getAttribute('data-feather');
            if (iconMappings[iconName]) {
                icon.setAttribute('data-feather', iconMappings[iconName]);
            }
        });

        // Initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            console.log(`Selected APK: ${file.name} (${fileSize} MB)`);

            // Update UI to show selected file
            const fileInfo = document.getElementById('file-info');
            if (fileInfo) {
                fileInfo.textContent = `${file.name} (${fileSize} MB)`;
                fileInfo.style.display = 'block';
            }

            // Show success notification
            this.showNotification(`Selected: ${file.name} (${fileSize} MB)`, 'info');
        }
    }

    handleSignAPK(event) {
        const projectId = event.target.getAttribute('data-project-id');
        if (!projectId) return;

        // Show loading state
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Signing...';
        btn.disabled = true;

        // Make AJAX request to sign APK
        fetch(`/sign_apk/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('APK signed successfully!', 'success');
                // Reload page to update UI
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showNotification(`Signing failed: ${data.message}`, 'error');
            }
        })
        .catch(error => {
            this.showNotification('Signing failed: Network error', 'error');
            console.error('Sign APK error:', error);
        })
        .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        });
    }

    handleGUIModification(event) {
        // Add loading overlay
        this.showLoadingOverlay('Applying GUI modifications...');

        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Applying Changes...';
        }
    }

    handleGenerateFunction(event) {
        // Add loading overlay
        this.showLoadingOverlay('Generating Android code...');

        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
        }
    }

    setupPreviewHandlers() {
        // Real-time preview updates
        const guiChangesInput = document.getElementById('gui_changes');
        const colorSchemeSelect = document.getElementById('color_scheme');

        if (guiChangesInput) {
            guiChangesInput.addEventListener('input', this.updatePreview.bind(this));
        }

        if (colorSchemeSelect) {
            colorSchemeSelect.addEventListener('change', this.updatePreview.bind(this));
        }
    }

    updatePreview() {
        const guiChanges = document.getElementById('gui_changes')?.value || '';
        const colorScheme = document.getElementById('color_scheme')?.value || '';

        // Update preview elements
        const previewButton = document.getElementById('preview-button');
        const previewText = document.getElementById('preview-text');
        const previewStatus = document.getElementById('preview-status');

        if (previewButton) {
            // Apply color scheme to preview button
            const colorMap = {
                'blue': '#007bff',
                'green': '#28a745', 
                'red': '#dc3545',
                'purple': '#6f42c1',
                'orange': '#fd7e14',
                'dark': '#343a40',
                'light': '#f8f9fa'
            };

            if (colorScheme && colorMap[colorScheme]) {
                previewButton.style.backgroundColor = colorMap[colorScheme];
                previewButton.style.borderColor = colorMap[colorScheme];
            }
        }

        // Update preview text based on changes
        if (previewText && guiChanges) {
            if (guiChanges.toLowerCase().includes('button')) {
                previewText.textContent = 'Button preview updated';
            } else if (guiChanges.toLowerCase().includes('color')) {
                previewText.textContent = 'Color scheme preview';
            } else {
                previewText.textContent = 'GUI changes preview';
            }
        }

        // Update connection status if mentioned
        if (previewStatus && guiChanges.toLowerCase().includes('connect')) {
            if (guiChanges.toLowerCase().includes('disconnect')) {
                previewStatus.textContent = 'Status: Disconnected';
                previewStatus.className = 'preview-status text-danger';
            } else {
                previewStatus.textContent = 'Status: Connected';
                previewStatus.className = 'preview-status text-success';
            }
        }
    }

    showLoadingOverlay(message = 'Processing...') {
        // Remove existing overlay
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 mb-0">${message}</p>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';

        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility functions
    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copied to clipboard!', 'success');
            }).catch(err => {
                console.log('Failed to copy: ', err);
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText = "top: 0; left: 0; position: fixed;";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('Copied to clipboard!', 'success');
            }
        } catch (err) {
            console.log('Failed to copy: ', err);
        }

        document.body.removeChild(textArea);
    }
}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.APKEditor = new APKEditor();
});

// Global functions for HTML onclick handlers
function showAPKToolInfo() {
    if (typeof bootstrap !== 'undefined' && document.getElementById('apktoolModal')) {
        const modal = new bootstrap.Modal(document.getElementById('apktoolModal'));
        modal.show();
    }
}

function testAI() {
    fetch('/test_ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.APKEditor.showNotification('AI test successful!', 'success');
        } else {
            window.APKEditor.showNotification(`AI test failed: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        window.APKEditor.showNotification('AI test failed: Network error', 'error');
    });
}