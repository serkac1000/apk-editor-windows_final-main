// APK Editor JavaScript functionality
class APKEditor {
    constructor() {
        this.initializeEventListeners();
        this.initializeFeatherIcons();
    }

    initializeEventListeners() {
        // File upload handling
        const fileInput = document.getElementById('apk_file');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelection.bind(this));
        }

        // Form submissions with loading states
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Preview functionality
        const previewButtons = document.querySelectorAll('.preview-btn');
        previewButtons.forEach(btn => {
            btn.addEventListener('click', this.handlePreview.bind(this));
        });

        // Compile buttons
        const compileButtons = document.querySelectorAll('.compile-btn');
        compileButtons.forEach(btn => {
            btn.addEventListener('click', this.handleCompile.bind(this));
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
    }

    initializeFeatherIcons() {
        // Initialize Feather icons if available
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        const fileInfo = document.getElementById('file-info');

        if (file && fileInfo) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            fileInfo.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-file-earmark-zip"></i>
                    Selected APK: ${file.name} (${fileSize} MB)
                </div>
            `;
            console.log(`Selected APK: ${file.name} (${fileSize} MB)`);
        }

        const projectNameInput = document.getElementById('project_name');
        if (projectNameInput && file) {
            projectNameInput.value = file.name.replace('.apk', '');
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
        const button = event.target;
        const resourceType = button.dataset.resourceType;
        const resourcePath = button.dataset.resourcePath;
        const projectId = button.dataset.projectId;

        this.showPreview(projectId, resourceType, resourcePath);
    }

    showPreview(projectId, resourceType, resourcePath) {
        const previewContainer = document.getElementById('preview-container');
        if (!previewContainer) return;

        let previewContent = '';

        if (resourceType === 'string') {
            previewContent = this.getStringPreviewContent(resourcePath);
        } else if (resourceType === 'layout') {
            previewContent = this.getLayoutPreviewContent(resourcePath);
        } else {
            previewContent = `<p>Preview not available for this resource type.</p>`;
        }

        previewContainer.innerHTML = `
            <div class="preview-app">
                <div class="preview-header">App Preview</div>
                <div class="preview-content">
                    ${previewContent}
                </div>
            </div>
        `;
    }

    getStringPreviewContent(resourcePath) {
        return `
            <div class="preview-text">Preview for string resource: ${resourcePath}</div>
        `;
    }

    getLayoutPreviewContent(resourcePath) {
        return `
            <button id="preview-button" class="btn btn-primary">Sample Button</button>
        `;
    }

    updateStringPreview() {
        const previewText = document.querySelector('.preview-text');
        if (previewText) {
            previewText.textContent = 'Updated text content';
        }
    }

    updateLayoutPreview() {
        const previewButton = document.getElementById('preview-button');
        if (previewButton) {
            previewButton.style.backgroundColor = '#28a745';
            previewButton.textContent = 'Modified Button';
        }
    }

    handleCompile(event) {
        event.preventDefault();
        const button = event.target;
        const projectId = button.dataset.projectId;

        this.showCompileProgress();

        // Redirect to compile endpoint
        window.location.href = `/compile/${projectId}`;
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

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const alertClass = `alert-${type}`;
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    isValidXML(xmlString) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, 'text/xml');
            return !doc.querySelector('parsererror');
        } catch (e) {
            return false;
        }
    }
}

// Initialize APK Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.apkEditor = new APKEditor();
});