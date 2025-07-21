// APK Editor JavaScript functionality

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

        // API key form
        const apiKeyForm = document.getElementById('api-key-form');
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', this.handleApiKeySubmit.bind(this));
        }

        // Test AI button
        const testAiBtn = document.getElementById('test-ai-btn');
        if (testAiBtn) {
            testAiBtn.addEventListener('click', this.testAI.bind(this));
        }

        // GUI modification form
        const guiForm = document.getElementById('gui-modification-form');
        if (guiForm) {
            guiForm.addEventListener('submit', this.handleGUIModification.bind(this));
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
            const fileName = file.name;
            const fileSize = this.formatFileSize(file.size);
            console.log(`Selected APK: ${fileName} (${fileSize})`);

            // Update UI to show selected file
            const label = document.querySelector('label[for="apk_file"]');
            if (label) {
                label.textContent = `Selected: ${fileName}`;
                label.classList.add('text-success');
            }
        }
    }

    handleFormSubmit(event) {
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
            submitBtn.disabled = true;

            // Re-enable after 30 seconds as fallback
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 30000);
        }
    }

    handlePreview(event) {
        event.preventDefault();
        const resourceType = event.target.dataset.resourceType;
        const resourcePath = event.target.dataset.resourcePath;

        if (resourceType === 'string' || resourceType === 'layout') {
            this.showTextPreview(resourceType, resourcePath);
        } else if (resourceType === 'image') {
            this.showImagePreview(resourcePath);
        }
    }

    showTextPreview(resourceType, resourcePath) {
        const content = document.getElementById('content').value;
        const previewContainer = document.getElementById('preview-container');

        if (!previewContainer) {
            this.createPreviewContainer();
        }

        const preview = document.getElementById('preview-content');
        if (resourceType === 'string') {
            preview.innerHTML = this.generateStringPreview(content);
        } else if (resourceType === 'layout') {
            preview.innerHTML = this.generateLayoutPreview(content);
        }

        document.getElementById('preview-container').style.display = 'block';
    }

    generateStringPreview(content) {
        const parser = new DOMParser();
        try {
            const doc = parser.parseFromString(content, 'text/xml');
            const strings = doc.querySelectorAll('string');

            let previewHTML = '<div class="preview-app"><div class="preview-header">App Preview</div><div class="preview-content">';

            strings.forEach(string => {
                const name = string.getAttribute('name');
                const value = string.textContent;

                if (name === 'app_name') {
                    previewHTML += `<h5>${value}</h5>`;
                } else if (name.includes('button') || name.includes('btn')) {
                    previewHTML += `<button class="btn btn-primary m-1" id="preview-button">${value}</button>`;
                } else {
                    previewHTML += `<div class="preview-text">${value}</div>`;
                }
            });

            previewHTML += '</div></div>';
            return previewHTML;
        } catch (error) {
            return '<div class="alert alert-warning">Invalid XML format</div>';
        }
    }

    generateLayoutPreview(content) {
        // Basic layout preview - simplified representation
        let previewHTML = '<div class="preview-app"><div class="preview-header">Layout Preview</div><div class="preview-content">';

        if (content.includes('TextView')) {
            previewHTML += '<div class="preview-text">Sample Text View</div>';
        }
        if (content.includes('Button')) {
            previewHTML += '<button class="btn btn-primary m-1">Sample Button</button>';
        }
        if (content.includes('ImageView')) {
            previewHTML += '<div class="bg-light p-3 m-1">📱 Image View</div>';
        }

        previewHTML += '</div></div>';
        return previewHTML;
    }

    createPreviewContainer() {
        const container = document.createElement('div');
        container.id = 'preview-container';
        container.className = 'preview-container mt-3';
        container.innerHTML = `
            <h6>Preview</h6>
            <div id="preview-content"></div>
        `;

        const form = document.querySelector('form');
        if (form) {
            form.appendChild(container);
        }
    }

    updatePreview() {
        const resourceType = document.querySelector('input[name="resource_type"]')?.value;
        const resourcePath = document.querySelector('input[name="resource_path"]')?.value;

        if (resourceType && resourcePath) {
            this.showTextPreview(resourceType, resourcePath);
        }
    }

    handleCompile(event) {
        event.preventDefault();
        const button = event.target;
        const projectId = button.dataset.projectId;
        const originalText = button.textContent;

        // Show loading state
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Compiling...';

        // Follow the original href after showing loading state
        setTimeout(() => {
            window.location.href = `/compile/${projectId}`;
        }, 100);
    }

    showCompileProgress() {
        const progressHtml = `
            <div class="alert alert-info">
                <i class="bi bi-gear-fill"></i> Compiling APK...
                <div class="progress mt-2">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         style="width: 100%"></div>
                </div>
            </div>
        `;

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', progressHtml);
        }
    }

    handleApiKeySubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';
            submitBtn.disabled = true;
        }

        // Submit form normally
        form.submit();
    }

    testAI() {
        const testBtn = document.getElementById('test-ai-btn');
        if (testBtn) {
            testBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Testing...';
            testBtn.disabled = true;
        }

        fetch('/test_ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            const alertClass = data.success ? 'alert-success' : 'alert-danger';
            const alertHtml = `
                <div class="alert ${alertClass}" role="alert">
                    <strong>${data.success ? 'Success!' : 'Error!'}</strong> ${data.message}
                </div>
            `;

            const container = document.querySelector('.container-fluid');
            if (container) {
                container.insertAdjacentHTML('afterbegin', alertHtml);
            }
        })
        .catch(error => {
            console.error('AI test error:', error);
        })
        .finally(() => {
            if (testBtn) {
                testBtn.innerHTML = '<i class="bi bi-cpu"></i> Test AI';
                testBtn.disabled = false;
            }
        });
    }

    handleGUIModification(event) {
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Applying Changes...';
        }
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    // Handle form submissions with loading states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                const originalText = submitButton.textContent;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            }
        });
    });
});