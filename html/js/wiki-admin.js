/**
 * Aedelore Wiki Admin - Client-side JavaScript
 * Book-focused UI with tree view and image upload
 */

// API base
const API_BASE = '/api/wiki';

// State
let authToken = null;
let csrfToken = null;
let books = [];
let selectedBookId = null;
let currentBookData = null; // chapters and pages for selected book
let tinyEditor = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupLoginForm();
    authToken = localStorage.getItem('aedelore_auth_token');

    if (!authToken) {
        return; // Show login form
    }

    await initializeAdmin();
});

// Setup login form
function setupLoginForm() {
    const form = document.getElementById('admin-login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    errorEl.textContent = data.error || 'Login failed';
                    errorEl.style.display = 'block';
                    return;
                }

                authToken = data.token;
                localStorage.setItem('aedelore_auth_token', authToken);
                errorEl.style.display = 'none';
                await initializeAdmin();

            } catch (error) {
                errorEl.textContent = 'Connection error';
                errorEl.style.display = 'block';
            }
        });
    }
}

// Initialize admin interface after login
async function initializeAdmin() {
    // Get CSRF token
    try {
        const csrfResponse = await fetch('/api/csrf-token');
        const csrfData = await csrfResponse.json();
        csrfToken = csrfData.csrfToken;
    } catch (e) {
        console.error('Failed to get CSRF token:', e);
    }

    // Verify user is admin (ID = 6)
    try {
        const meResponse = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!meResponse.ok) {
            return;
        }

        const user = await meResponse.json();

        if (user.id !== 6) {
            document.getElementById('auth-check').innerHTML = `
                <div class="auth-required">
                    <h2>Admin Access Denied</h2>
                    <p>You don't have admin privileges to access the wiki editor.</p>
                    <p style="margin-top: 12px; color: var(--text-muted);">Logged in as: ${user.username} (ID: ${user.id})</p>
                    <a href="wiki" class="btn btn-secondary" style="margin-top: 16px;">Back to Wiki</a>
                </div>
            `;
            return;
        }

        // Show admin interface
        document.getElementById('auth-check').style.display = 'none';
        document.getElementById('admin-app').style.display = 'block';
        document.getElementById('user-info').textContent = `Logged in as ${user.username}`;

        // Setup tabs
        setupTabs();

        // Load books
        await loadBooks();

        // TinyMCE is initialized lazily when page modal opens

    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-CSRF-Token': csrfToken
            }
        });
    } catch (e) {
        // Ignore errors
    }
    localStorage.removeItem('aedelore_auth_token');
    location.reload();
}

// Setup tab navigation
function setupTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

// TinyMCE state
let editorInitialized = false;
let pendingContent = '';

// Initialize TinyMCE editor with image upload (called when modal opens)
function initEditor(initialContent = '') {
    // Check if TinyMCE is loaded
    if (typeof tinymce === 'undefined') {
        // Fallback: TinyMCE not available (likely CSP blocking)
        // Fallback: just set content directly on textarea
        const textarea = document.getElementById('page-content');
        if (textarea) {
            textarea.value = initialContent || '';
            textarea.style.display = 'block';
            textarea.style.width = '100%';
            textarea.style.minHeight = '400px';
            textarea.style.background = '#141420';
            textarea.style.color = '#e0e0e0';
            textarea.style.padding = '16px';
            textarea.style.border = '1px solid rgba(255,255,255,0.12)';
            textarea.style.borderRadius = '8px';
            textarea.style.fontFamily = 'monospace';
        }
        return;
    }

    // If already initialized, just set content
    if (editorInitialized && tinyEditor) {
        tinyEditor.setContent(initialContent);
        return;
    }

    pendingContent = initialContent;

    tinymce.init({
        selector: '#page-content',
        height: 400,
        menubar: false,
        plugins: 'lists link code table image',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
        content_css: false,
        skin: 'oxide-dark',
        // Image upload configuration
        images_upload_credentials: true,
        automatic_uploads: true,
        images_upload_handler: async (blobInfo, progress) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());

            const response = await fetch('/api/wiki/admin/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'X-CSRF-Token': csrfToken
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            return data.location;
        },
        content_style: `
            body {
                font-family: Inter, sans-serif;
                font-size: 14px;
                color: #e0e0e0;
                background: #141420;
                padding: 16px;
            }
            p { margin-bottom: 12px; }
            h2 { color: #f0c040; margin: 24px 0 12px; }
            h3 { color: #22d3ee; margin: 16px 0 8px; }
            blockquote { border-left: 3px solid #a855f7; padding-left: 16px; color: #888; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
        `,
        setup: (editor) => {
            tinyEditor = editor;
            editor.on('init', () => {
                editorInitialized = true;
                if (pendingContent) {
                    editor.setContent(pendingContent);
                    pendingContent = '';
                }
            });
        }
    });
}

// API helper
async function apiRequest(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-CSRF-Token': csrfToken
        }
    };

    if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
}

// Show status message
function showStatus(message, isError = false) {
    const el = document.getElementById('status-message');
    el.innerHTML = `<div class="status ${isError ? 'status-error' : 'status-success'}">${message}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 5000);
}

// Modal helpers
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ========================================
// BOOKS
// ========================================

async function loadBooks() {
    try {
        books = await apiRequest('GET', '/books');
        populateBookSelector();

        // If a book was previously selected, reload its content
        if (selectedBookId) {
            const bookStillExists = books.find(b => b.id === selectedBookId);
            if (bookStillExists) {
                await loadBookContent(selectedBookId);
            } else {
                selectBook(null);
            }
        }
    } catch (error) {
        showStatus('Failed to load books: ' + error.message, true);
    }
}

function populateBookSelector() {
    const select = document.getElementById('book-select');
    select.innerHTML = '<option value="">Select a book...</option>' +
        books.map(book =>
            `<option value="${book.id}" ${book.id === selectedBookId ? 'selected' : ''}>
                ${escapeHtml(book.title)} (${book.chapter_count} chapters, ${book.page_count} pages)
            </option>`
        ).join('');
}

// Select a book and load its content
async function selectBook(bookId) {
    if (!bookId) {
        selectedBookId = null;
        currentBookData = null;
        document.getElementById('no-book-selected').style.display = 'block';
        document.getElementById('book-tree').style.display = 'none';
        document.getElementById('edit-book-btn').disabled = true;
        document.getElementById('delete-book-btn').disabled = true;
        return;
    }

    selectedBookId = parseInt(bookId);
    document.getElementById('edit-book-btn').disabled = false;
    document.getElementById('delete-book-btn').disabled = false;

    await loadBookContent(selectedBookId);
}

// Load book content and render tree
async function loadBookContent(bookId) {
    try {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        currentBookData = await apiRequest('GET', `/books/${book.slug}`);

        document.getElementById('no-book-selected').style.display = 'none';
        document.getElementById('book-tree').style.display = 'block';

        renderBookTree();
    } catch (error) {
        showStatus('Failed to load book content: ' + error.message, true);
    }
}

// Render hierarchical tree view
function renderBookTree() {
    if (!currentBookData) return;

    const container = document.getElementById('book-tree');
    const chapters = currentBookData.chapters || [];
    const pages = currentBookData.pages || [];

    // Group pages by chapter
    const chapterPages = {};
    const standalonePages = [];

    pages.forEach(page => {
        if (page.chapter_id) {
            if (!chapterPages[page.chapter_id]) {
                chapterPages[page.chapter_id] = [];
            }
            chapterPages[page.chapter_id].push(page);
        } else {
            standalonePages.push(page);
        }
    });

    let html = '<div class="wiki-tree">';

    // Render chapters with their pages
    if (chapters.length > 0) {
        chapters.forEach(chapter => {
            const chapterPageList = chapterPages[chapter.id] || [];
            const pageCount = chapterPageList.length;

            html += `
                <div class="tree-chapter" data-chapter-id="${chapter.id}">
                    <div class="tree-chapter-header" onclick="toggleChapter(${chapter.id})">
                        <div class="tree-chapter-title">
                            <span class="icon">&#9654;</span>
                            &#128193; ${escapeHtml(chapter.title)}
                            <span class="page-count">(${pageCount} pages)</span>
                        </div>
                        <div class="tree-actions">
                            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editChapter(${chapter.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteChapter(${chapter.id}, '${escapeHtml(chapter.title).replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    </div>
                    <div class="tree-chapter-pages">
                        ${chapterPageList.map(page => `
                            <div class="tree-page">
                                <div class="tree-page-title">
                                    &#128196; ${escapeHtml(page.title)}
                                </div>
                                <div class="tree-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="editPage(${page.id})">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deletePage(${page.id}, '${escapeHtml(page.title).replace(/'/g, "\\'")}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                        <button class="add-item-btn" onclick="openPageModalForChapter(${chapter.id})">
                            + Add Page to Chapter
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // Add chapter button
    html += `
        <button class="add-item-btn" style="margin: 12px 0;" onclick="openChapterModal()">
            + New Chapter
        </button>
    `;

    // Standalone pages section
    html += `
        <div class="standalone-section">
            <div class="standalone-header">Standalone Pages</div>
            ${standalonePages.map(page => `
                <div class="tree-page">
                    <div class="tree-page-title">
                        &#128196; ${escapeHtml(page.title)}
                    </div>
                    <div class="tree-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editPage(${page.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePage(${page.id}, '${escapeHtml(page.title).replace(/'/g, "\\'")}')">Delete</button>
                    </div>
                </div>
            `).join('')}
            <button class="add-item-btn" onclick="openPageModal()">
                + Add Standalone Page
            </button>
        </div>
    `;

    html += '</div>';
    container.innerHTML = html;
}

// Toggle chapter expand/collapse
function toggleChapter(chapterId) {
    const chapter = document.querySelector(`.tree-chapter[data-chapter-id="${chapterId}"]`);
    if (chapter) {
        chapter.classList.toggle('expanded');
    }
}

// Edit selected book
function editSelectedBook() {
    if (selectedBookId) {
        editBook(selectedBookId);
    }
}

// Delete selected book
function deleteSelectedBook() {
    if (selectedBookId) {
        const book = books.find(b => b.id === selectedBookId);
        if (book) {
            deleteBook(selectedBookId, book.title);
        }
    }
}

function openBookModal(book = null) {
    document.getElementById('book-modal-title').textContent = book ? 'Edit Book' : 'New Book';
    document.getElementById('book-id').value = book?.id || '';
    document.getElementById('book-title').value = book?.title || '';
    document.getElementById('book-description').value = book?.description || '';
    document.getElementById('book-sort').value = book?.sort_order || 0;
    document.getElementById('book-cover').value = book?.cover_image || '';
    document.getElementById('book-author-note').value = book?.author_note || '';
    openModal('book-modal');
}

async function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) openBookModal(book);
}

async function saveBook() {
    const id = document.getElementById('book-id').value;
    const data = {
        title: document.getElementById('book-title').value.trim(),
        description: document.getElementById('book-description').value.trim(),
        sort_order: parseInt(document.getElementById('book-sort').value) || 0,
        cover_image: document.getElementById('book-cover').value.trim(),
        author_note: document.getElementById('book-author-note').value.trim()
    };

    if (!data.title) {
        showStatus('Title is required', true);
        return;
    }

    try {
        if (id) {
            await apiRequest('PUT', `/admin/books/${id}`, data);
            showStatus('Book updated successfully');
        } else {
            await apiRequest('POST', '/admin/books', data);
            showStatus('Book created successfully');
        }
        closeModal('book-modal');
        await loadBooks();
    } catch (error) {
        showStatus('Failed to save book: ' + error.message, true);
    }
}

async function deleteBook(id, title) {
    if (!confirm(`Delete "${title}"? This will also delete all chapters and pages in this book.`)) {
        return;
    }

    try {
        await apiRequest('DELETE', `/admin/books/${id}`);
        showStatus('Book deleted successfully');
        if (selectedBookId === id) {
            selectBook(null);
        }
        await loadBooks();
    } catch (error) {
        showStatus('Failed to delete book: ' + error.message, true);
    }
}

// ========================================
// CHAPTERS
// ========================================

function openChapterModal(chapter = null) {
    document.getElementById('chapter-modal-title').textContent = chapter ? 'Edit Chapter' : 'New Chapter';
    document.getElementById('chapter-id').value = chapter?.id || '';
    document.getElementById('chapter-book-id').value = chapter?.book_id || selectedBookId || '';
    document.getElementById('chapter-title').value = chapter?.title || '';
    document.getElementById('chapter-description').value = chapter?.description || '';
    document.getElementById('chapter-sort').value = chapter?.sort_order || 0;
    document.getElementById('chapter-author-note').value = chapter?.author_note || '';
    openModal('chapter-modal');
}

async function editChapter(id) {
    if (!currentBookData) return;
    const chapter = currentBookData.chapters.find(c => c.id === id);
    if (chapter) {
        chapter.book_id = selectedBookId;
        openChapterModal(chapter);
    }
}

async function saveChapter() {
    const id = document.getElementById('chapter-id').value;
    const bookId = document.getElementById('chapter-book-id').value;

    const data = {
        book_id: parseInt(bookId),
        title: document.getElementById('chapter-title').value.trim(),
        description: document.getElementById('chapter-description').value.trim(),
        sort_order: parseInt(document.getElementById('chapter-sort').value) || 0,
        author_note: document.getElementById('chapter-author-note').value.trim()
    };

    if (!data.title) {
        showStatus('Title is required', true);
        return;
    }

    try {
        if (id) {
            await apiRequest('PUT', `/admin/chapters/${id}`, data);
            showStatus('Chapter updated successfully');
        } else {
            await apiRequest('POST', '/admin/chapters', data);
            showStatus('Chapter created successfully');
        }
        closeModal('chapter-modal');
        await loadBooks();
        if (selectedBookId) {
            await loadBookContent(selectedBookId);
        }
    } catch (error) {
        showStatus('Failed to save chapter: ' + error.message, true);
    }
}

async function deleteChapter(id, title) {
    if (!confirm(`Delete "${title}"? Pages in this chapter will become standalone pages.`)) {
        return;
    }

    try {
        await apiRequest('DELETE', `/admin/chapters/${id}`);
        showStatus('Chapter deleted successfully');
        await loadBooks();
        if (selectedBookId) {
            await loadBookContent(selectedBookId);
        }
    } catch (error) {
        showStatus('Failed to delete chapter: ' + error.message, true);
    }
}

// ========================================
// PAGES
// ========================================

function openPageModal(page = null) {
    document.getElementById('page-modal-title').textContent = page ? 'Edit Page' : 'New Page';
    document.getElementById('page-id').value = page?.id || '';
    document.getElementById('page-book-id').value = page?.book_id || selectedBookId || '';
    document.getElementById('page-title').value = page?.title || '';
    document.getElementById('page-summary').value = page?.summary || '';
    document.getElementById('page-sort').value = page?.sort_order || 0;
    document.getElementById('page-tags').value = (page?.tags || []).join(', ');
    document.getElementById('page-author-note').value = page?.author_note || '';

    // Populate chapter select
    const chapterSelect = document.getElementById('page-chapter');
    const chapters = currentBookData?.chapters || [];
    chapterSelect.innerHTML = '<option value="">No chapter (standalone page)</option>' +
        chapters.map(c =>
            `<option value="${c.id}" ${page?.chapter_id === c.id ? 'selected' : ''}>${escapeHtml(c.title)}</option>`
        ).join('');

    openModal('page-modal');

    // Initialize TinyMCE after modal is visible (needs visible element)
    setTimeout(() => {
        initEditor(page?.content || '');
    }, 100);
}

function openPageModalForChapter(chapterId) {
    openPageModal();
    document.getElementById('page-chapter').value = chapterId;
}

async function editPage(id) {
    try {
        const page = await apiRequest('GET', `/pages/${id}`);
        page.book_id = selectedBookId;
        // Find chapter_id from current book data
        if (currentBookData) {
            const chapter = currentBookData.chapters.find(c => c.slug === page.chapter_slug);
            page.chapter_id = chapter?.id || null;
        }
        openPageModal(page);
    } catch (error) {
        showStatus('Failed to load page: ' + error.message, true);
    }
}

async function savePage() {
    const id = document.getElementById('page-id').value;
    const bookId = document.getElementById('page-book-id').value;
    const tagsStr = document.getElementById('page-tags').value;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const data = {
        book_id: parseInt(bookId),
        chapter_id: document.getElementById('page-chapter').value ? parseInt(document.getElementById('page-chapter').value) : null,
        title: document.getElementById('page-title').value.trim(),
        summary: document.getElementById('page-summary').value.trim(),
        content: tinyEditor ? tinyEditor.getContent() : (document.getElementById('page-content')?.value || ''),
        sort_order: parseInt(document.getElementById('page-sort').value) || 0,
        tags: tags,
        author_note: document.getElementById('page-author-note').value.trim()
    };

    if (!data.title) {
        showStatus('Title is required', true);
        return;
    }

    try {
        if (id) {
            await apiRequest('PUT', `/admin/pages/${id}`, data);
            showStatus('Page updated successfully');
        } else {
            await apiRequest('POST', '/admin/pages', data);
            showStatus('Page created successfully');
        }
        closeModal('page-modal');
        await loadBooks();
        if (selectedBookId) {
            await loadBookContent(selectedBookId);
        }
    } catch (error) {
        showStatus('Failed to save page: ' + error.message, true);
    }
}

async function deletePage(id, title) {
    if (!confirm(`Delete "${title}"?`)) {
        return;
    }

    try {
        await apiRequest('DELETE', `/admin/pages/${id}`);
        showStatus('Page deleted successfully');
        await loadBooks();
        if (selectedBookId) {
            await loadBookContent(selectedBookId);
        }
    } catch (error) {
        showStatus('Failed to delete page: ' + error.message, true);
    }
}

// ========================================
// IMPORT
// ========================================

async function importData() {
    const jsonInput = document.getElementById('import-json').value.trim();
    const resultContainer = document.getElementById('import-result');

    if (!jsonInput) {
        resultContainer.innerHTML = '<div class="status status-error">Please paste JSON data to import</div>';
        return;
    }

    let data;
    try {
        data = JSON.parse(jsonInput);
    } catch (e) {
        resultContainer.innerHTML = '<div class="status status-error">Invalid JSON format</div>';
        return;
    }

    if (!data.books || !Array.isArray(data.books)) {
        resultContainer.innerHTML = '<div class="status status-error">JSON must have a "books" array</div>';
        return;
    }

    resultContainer.innerHTML = '<div class="status">Importing...</div>';

    try {
        const result = await apiRequest('POST', '/admin/import', data);
        resultContainer.innerHTML = `
            <div class="status status-success">
                Import successful!<br>
                Books: ${result.imported.books}<br>
                Chapters: ${result.imported.chapters}<br>
                Pages: ${result.imported.pages}
            </div>
        `;
        document.getElementById('import-json').value = '';
        await loadBooks();
    } catch (error) {
        resultContainer.innerHTML = `<div class="status status-error">Import failed: ${error.message}</div>`;
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
