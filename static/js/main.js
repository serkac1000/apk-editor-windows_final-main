// APK Editor JavaScript functionality

// Prevent duplicate class declarations
if (typeof window.APKEditor === 'undefined') {
    
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

        // Preview functionality
        this.setupPreviewHandlers();
    }

    setupFeatherIcons() {
        // Replace invalid feather icons with valid ones
        const iconMappings = {
            'wand': 'magic-wand',
            'palette': 'palette',
            'color-palette': 'palette'
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
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
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
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('Copied to clipboard!', 'success');
            } else {
                console.log('Failed to copy: ', {});
            }
        } catch (err) {
            console.log('Failed to copy: ', err);
        }

        document.body.removeChild(textArea);
    }
}

// Initialize APK Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.APKEditor = new APKEditor();
});

// Global functions for HTML onclick handlers
function showAPKToolInfo() {
    const modal = new bootstrap.Modal(document.getElementById('apktoolModal'));
    modal.show();
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

} // End of APKEditor class definition guard

class APKEditor {
    constructor() {
        this.initializeEventListeners();
        this.initializeFeatherIcons();
        this.currentProject = null;
    }

    initializeEventListeners() {
        // File upload handling
        const fileInput = document.getElementById('apk_file');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Form submissions with loading states
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Preview functionality
        const previewButtons = document.querySelectorAll('.preview-resource');
        previewButtons.forEach(button => {
            button.addEventListener('click', this.handlePreview.bind(this));
        });

        // Real-time preview for text editing
        const contentTextarea = document.getElementById('content');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', this.debounce(this.updatePreview.bind(this), 500));
        }

        // Compile buttons
        const compileButtons = document.querySelectorAll('.compile-btn');
        compileButtons.forEach(button => {
            button.addEventListener('click', this.handleCompile.bind(this));
        });

        // Sign APK buttons
        const signButtons = document.querySelectorAll('.sign-apk-btn');
        signButtons.forEach(button => {
            button.addEventListener('click', this.handleSignApk.bind(this));
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

        // API key form
        const apiKeyForm = document.getElementById('api-key-form');
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', this.handleApiKeySave.bind(this));
        }

        // Test AI button
        const testAiBtn = document.getElementById('test-ai-btn');
        if (testAiBtn) {
            testAiBtn.addEventListener('click', this.handleTestAI.bind(this));
        }

        // Toggle API key visibility
        const toggleKeyBtn = document.getElementById('toggle-key-visibility');
        if (toggleKeyBtn) {
            toggleKeyBtn.addEventListener('click', this.toggleApiKeyVisibility.bind(this));
        }
    }

    initializeFeatherIcons() {
        // Initialize Feather icons if available
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const fileSize = this.formatFileSize(file.size);
            console.log(`Selected APK: ${file.name} (${fileSize})`);

            // Update UI to show selected file
            const fileName = document.querySelector('.file-name');
            if (fileName) {
                fileName.textContent = `${file.name} (${fileSize})`;
            }

            // Show file info
            this.showNotification(`Selected: ${file.name} (${fileSize})`, 'info');
        }
    }

    handleFormSubmit(event) {
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn && !submitBtn.disabled) {
            // Add loading state
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

            // Reset after form submission
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 2000);
        }
    }

    handlePreview(event) {
        event.preventDefault();
        const button = event.target.closest('.preview-resource');
        const resourcePath = button.dataset.resourcePath;
        const resourceType = button.dataset.resourceType;
        const projectId = button.dataset.projectId;

        // Get current content
        const contentTextarea = document.getElementById('content');
        const content = contentTextarea ? contentTextarea.value : '';

        // Show preview modal or update preview area
        this.showPreview(projectId, resourceType, resourcePath, content);
    }

    showPreview(projectId, resourceType, resourcePath, content) {
        // Create or update preview area
        let previewArea = document.getElementById('preview-area');
        if (!previewArea) {
            previewArea = document.createElement('div');
            previewArea.id = 'preview-area';
            previewArea.className = 'card mt-3';
            previewArea.innerHTML = `
                <div class="card-header">
                    <h6 class="mb-0">Preview</h6>
                </div>
                <div class="card-body">
                    <div id="preview-content"></div>
                </div>
            `;

            const contentContainer = document.querySelector('.container');
            if (contentContainer) {
                contentContainer.appendChild(previewArea);
            }
        }

        const previewContent = document.getElementById('preview-content');
        if (resourceType === 'string' || resourceType === 'layout') {
            previewContent.innerHTML = `<pre><code>${this.escapeHtml(content)}</code></pre>`;
        } else {
            previewContent.innerHTML = '<p>Preview not available for this resource type.</p>';
        }
    }

    updatePreview() {
        // Update preview in real-time
        const contentTextarea = document.getElementById('content');
        if (contentTextarea) {
            const content = contentTextarea.value;
            const previewContent = document.getElementById('preview-content');
            if (previewContent) {
                previewContent.innerHTML = `<pre><code>${this.escapeHtml(content)}</code></pre>`;
            }
        }
    }

    handleCompile(event) {
        event.preventDefault();
        const button = event.target.closest('.compile-btn');
        const projectId = button.dataset.projectId;
        const signOption = button.dataset.signOption || 'signed';

        // Update button state
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Compiling...';

        // Redirect to compile endpoint
        window.location.href = `/compile/${projectId}/${signOption}`;
    }

    handleSignApk(event) {
        event.preventDefault();
        const button = event.target.closest('.sign-apk-btn');
        const projectId = button.dataset.projectId;

        // Update button state
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing...';

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
                // Refresh the page or update UI
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showNotification(data.message || 'Failed to sign APK', 'error');
            }
        })
        .catch(error => {
            console.error('Sign APK error:', error);
            this.showNotification('Failed to sign APK', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = originalText;
        });
    }

    handleGUIModification(event) {
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Applying Changes...';
        }
    }

    handleGenerateFunction(event) {
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
        }
    }

    handleApiKeySave(event) {
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }
    }

    handleTestAI(event) {
        event.preventDefault();
        const button = event.target;

        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Testing...';

        fetch('/test_ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('AI is working correctly!', 'success');
            } else {
                this.showNotification(data.message || 'AI test failed', 'error');
            }
        })
        .catch(error => {
            console.error('AI test error:', error);
            this.showNotification('AI test failed', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = originalText;
        });
    }

    toggleApiKeyVisibility() {
        const keyInput = document.getElementById('gemini_api_key');
        const icon = document.querySelector('#toggle-key-visibility i');

        if (keyInput && icon) {
            if (keyInput.type === 'password') {
                keyInput.type = 'text';
                icon.setAttribute('data-feather', 'eye-off');
            } else {
                keyInput.type = 'password';
                icon.setAttribute('data-feather', 'eye');
            }

            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize APK Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.apkEditor = new APKEditor();

    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});