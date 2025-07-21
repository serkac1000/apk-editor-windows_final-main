// APK Editor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // File upload handling
    const fileInput = document.getElementById('apk_file');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                console.log(`Selected APK: ${file.name} (${formatFileSize(file.size)})`);
            }
        });
    }

    // Project name auto-fill
    const projectNameInput = document.getElementById('project_name');
    if (fileInput && projectNameInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && !projectNameInput.value) {
                projectNameInput.value = file.name.replace('.apk', '');
            }
        });
    }

    // Preview functionality
    setupPreview();

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined') {
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setupPreview() {
    const contentTextarea = document.getElementById('content');
    const previewBtn = document.getElementById('preview-btn');
    const previewContainer = document.getElementById('preview-container');

    if (contentTextarea && previewBtn && previewContainer) {
        previewBtn.addEventListener('click', function() {
            const content = contentTextarea.value;
            const resourceType = document.querySelector('[data-resource-type]')?.dataset.resourceType;
            const resourcePath = document.querySelector('[data-resource-path]')?.dataset.resourcePath;
            const projectId = document.querySelector('[data-project-id]')?.dataset.projectId;

            if (resourceType && resourcePath && projectId) {
                showPreview(projectId, resourceType, resourcePath, content);
            }
        });

        // Real-time preview on content change
        contentTextarea.addEventListener('input', function() {
            const content = this.value;
            const resourceType = document.querySelector('[data-resource-type]')?.dataset.resourceType;
            const resourcePath = document.querySelector('[data-resource-path]')?.dataset.resourcePath;
            const projectId = document.querySelector('[data-project-id]')?.dataset.projectId;

            if (resourceType && resourcePath && projectId) {
                showPreview(projectId, resourceType, resourcePath, content);
            }
        });
    }
}

function showPreview(projectId, resourceType, resourcePath, content) {
    const previewContainer = document.getElementById('preview-container');

    if (!previewContainer) return;

    if (resourceType === 'string') {
        previewContainer.innerHTML = `
            <div class="card mt-3">
                <div class="card-header">
                    <h5 class="mb-0">Preview: ${resourcePath}</h5>
                </div>
                <div class="card-body">
                    <pre class="bg-light p-3 rounded border">${escapeHtml(content)}</pre>
                </div>
            </div>
        `;
    } else if (resourceType === 'layout') {
        const isValid = isValidXML(content);
        previewContainer.innerHTML = `
            <div class="card mt-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">XML Layout Preview: ${resourcePath}</h5>
                    <span class="badge ${isValid ? 'bg-success' : 'bg-danger'}">
                        ${isValid ? '✅ Valid XML' : '❌ Invalid XML'}
                    </span>
                </div>
                <div class="card-body">
                    <pre class="bg-light p-3 rounded border" style="max-height: 400px; overflow-y: auto;"><code class="language-xml">${escapeHtml(content)}</code></pre>
                    ${!isValid ? '<div class="alert alert-warning mt-2"><small>XML syntax errors detected. Please check your formatting.</small></div>' : ''}
                </div>
            </div>
        `;
    }

    previewContainer.style.display = 'block';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isValidXML(xmlString) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        return !doc.querySelector('parsererror');
    } catch (e) {
        return false;
    }
}
// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined') {
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // File upload validation
    const fileInput = document.querySelector('input[type="file"][accept=".apk"]');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.name.toLowerCase().endsWith('.apk')) {
                    alert('Please select a valid APK file');
                    e.target.value = '';
                    return;
                }

                // Show file size
                const fileSize = formatFileSize(file.size);
                const maxSize = 100 * 1024 * 1024; // 100MB

                if (file.size > maxSize) {
                    alert('File size exceeds 100MB limit');
                    e.target.value = '';
                    return;
                }

                console.log(`Selected APK: ${file.name} (${fileSize})`);
            }
        });
    }

    // Resource preview functionality
    setupResourcePreview();

    // GUI modification preview
    setupGUIPreview();

    // Form validation
    setupFormValidation();
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setupResourcePreview() {
    // String resource preview
    const stringTextarea = document.querySelector('textarea[name="content"]');
    if (stringTextarea) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'mt-3 p-3 border rounded';
        previewDiv.innerHTML = '<h6>Preview:</h6><div id="string-preview"></div>';
        stringTextarea.parentNode.appendChild(previewDiv);

        stringTextarea.addEventListener('input', function() {
            const preview = document.getElementById('string-preview');
            preview.textContent = this.value || 'Empty string';
        });

        // Initial preview
        const preview = document.getElementById('string-preview');
        if (preview) {
            preview.textContent = stringTextarea.value || 'Empty string';
        }
    }

    // Image resource preview
    const imageInput = document.querySelector('input[name="image_file"]');
    if (imageInput) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'mt-3';
        previewDiv.innerHTML = '<h6>Preview:</h6><img id="image-preview" class="img-thumbnail" style="max-width: 200px; display: none;">';
        imageInput.parentNode.appendChild(previewDiv);

        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('image-preview');

            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    }
}

function setupGUIPreview() {
    const guiForm = document.querySelector('form[action*="modify_gui"]');
    if (!guiForm) return;

    const changesTextarea = guiForm.querySelector('textarea[name="gui_changes"]');
    const colorSelect = guiForm.querySelector('select[name="color_scheme"]');

    if (changesTextarea || colorSelect) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'mt-3 p-3 border rounded bg-light';
        previewDiv.innerHTML = `
            <h6>Live Preview:</h6>
            <div id="gui-preview">
                <div class="preview-app" style="border: 2px solid #ccc; padding: 20px; border-radius: 8px; background: white; max-width: 300px;">
                    <div class="preview-header" style="background: #007bff; color: white; padding: 10px; margin: -20px -20px 20px -20px; border-radius: 6px 6px 0 0;">
                        <h6 class="m-0">Sample App</h6>
                    </div>
                    <div class="preview-content">
                        <button class="btn btn-primary mb-2" id="preview-button">Sample Button</button>
                        <div class="preview-text">Hello World!</div>
                        <div class="preview-status mt-2">
                            <span class="badge bg-success">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (changesTextarea) {
            changesTextarea.parentNode.appendChild(previewDiv);
        } else if (colorSelect) {
            colorSelect.parentNode.appendChild(previewDiv);
        }

        // Update preview on changes
        if (changesTextarea) {
            changesTextarea.addEventListener('input', updateGUIPreview);
        }
        if (colorSelect) {
            colorSelect.addEventListener('change', updateGUIPreview);
        }

        // Initial preview
        updateGUIPreview();
    }
}

function updateGUIPreview() {
    const changesTextarea = document.querySelector('textarea[name="gui_changes"]');
    const colorSelect = document.querySelector('select[name="color_scheme"]');
    const preview = document.querySelector('#gui-preview .preview-app');

    if (!preview) return;

    const changes = changesTextarea ? changesTextarea.value.toLowerCase() : '';
    const colorScheme = colorSelect ? colorSelect.value : '';

    // Reset styles
    const header = preview.querySelector('.preview-header');
    const button = preview.querySelector('#preview-button');
    const status = preview.querySelector('.preview-status .badge');

    // Apply color scheme
    const colorSchemes = {
        'blue': { primary: '#007bff', secondary: '#6c757d', accent: '#17a2b8' },
        'green': { primary: '#28a745', secondary: '#6c757d', accent: '#20c997' },
        'red': { primary: '#dc3545', secondary: '#6c757d', accent: '#fd7e14' },
        'purple': { primary: '#6f42c1', secondary: '#6c757d', accent: '#e83e8c' },
        'orange': { primary: '#fd7e14', secondary: '#6c757d', accent: '#ffc107' },
        'dark': { primary: '#343a40', secondary: '#6c757d', accent: '#ffffff' },
        'light': { primary: '#f8f9fa', secondary: '#e9ecef', accent: '#343a40' }
    };

    if (colorScheme && colorSchemes[colorScheme]) {
        const colors = colorSchemes[colorScheme];
        header.style.background = colors.primary;
        button.style.backgroundColor = colors.primary;
        button.style.borderColor = colors.primary;
    }

    // Apply text-based changes
    if (changes.includes('blue')) {
        header.style.background = '#007bff';
        button.style.backgroundColor = '#007bff';
        button.style.borderColor = '#007bff';
    } else if (changes.includes('green')) {
        header.style.background = '#28a745';
        button.style.backgroundColor = '#28a745';
        button.style.borderColor = '#28a745';
    } else if (changes.includes('red')) {
        header.style.background = '#dc3545';
        button.style.backgroundColor = '#dc3545';
        button.style.borderColor = '#dc3545';
    }

    // Handle button size changes
    if (changes.includes('bigger') || changes.includes('larger')) {
        button.style.fontSize = '18px';
        button.style.padding = '12px 24px';
    } else if (changes.includes('smaller')) {
        button.style.fontSize = '12px';
        button.style.padding = '6px 12px';
    }

    // Handle connection status changes
    if (changes.includes('disconnected')) {
        status.textContent = 'Disconnected';
        status.className = 'badge bg-danger';
    } else if (changes.includes('connected')) {
        status.textContent = 'Connected';
        status.className = 'badge bg-success';
    }
}

function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

                // Re-enable after 10 seconds as fallback
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Submit';
                }, 10000);
            }
        });
    });
}

// Global functions
window.confirmDelete = function(projectName) {
    return confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`);
};

window.showLoading = function(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-border text-primary mb-3"></div>
            <div>${message || 'Processing...'}</div>
        </div>
    `;
    document.body.appendChild(overlay);
};

window.hideLoading = function() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
};