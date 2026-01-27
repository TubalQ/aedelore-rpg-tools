/**
 * Aedelore Wiki Admin - Client-side JavaScript
 */

// API base
const API_BASE = '/api/wiki';

// State
let authToken = null;
let csrfToken = null;
let books = [];
let chapters = [];
let pages = [];
let tinyEditor = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Setup login form handler
    setupLoginForm();

    // Check authentication
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

                // Save token and initialize
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

    // Verify user is admin (ID = 1)
    try {
        const meResponse = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!meResponse.ok) {
            return; // Not logged in
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

        // Load initial data
        await loadBooks();

        // Initialize TinyMCE
        initEditor();

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
            // Update active tab
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');

            // Load data for the tab
            if (tab.dataset.tab === 'chapters') loadChapters();
            if (tab.dataset.tab === 'pages') loadPages();
        });
    });
}

// Initialize TinyMCE editor
function initEditor() {
    tinymce.init({
        selector: '#page-content',
        height: 400,
        menubar: false,
        plugins: 'lists link code table hr',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link | hr | code',
        content_css: false,
        skin: 'oxide-dark',
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
        `,
        setup: (editor) => {
            tinyEditor = editor;
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
        renderBooksList();
    } catch (error) {
        showStatus('Failed to load books: ' + error.message, true);
    }
}

function renderBooksList() {
    const container = document.getElementById('books-list');

    if (books.length === 0) {
        container.innerHTML = '<div class="empty-state">No books yet. Create your first book!</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Chapters</th>
                    <th>Pages</th>
                    <th>Sort</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${books.map(book => `
                    <tr>
                        <td><strong>${escapeHtml(book.title)}</strong></td>
                        <td style="color: var(--text-muted);">${book.slug}</td>
                        <td>${book.chapter_count}</td>
                        <td>${book.page_count}</td>
                        <td>${book.sort_order}</td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-sm" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id}, '${escapeHtml(book.title)}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
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
        await loadBooks();
    } catch (error) {
        showStatus('Failed to delete book: ' + error.message, true);
    }
}

// ========================================
// CHAPTERS
// ========================================

async function loadChapters() {
    try {
        // Load chapters from all books
        chapters = [];
        for (const book of books) {
            const bookData = await apiRequest('GET', `/books/${book.slug}`);
            bookData.chapters.forEach(ch => {
                chapters.push({ ...ch, book_id: book.id, book_title: book.title, book_slug: book.slug });
            });
        }
        renderChaptersList();
    } catch (error) {
        showStatus('Failed to load chapters: ' + error.message, true);
    }
}

function renderChaptersList() {
    const container = document.getElementById('chapters-list');

    if (chapters.length === 0) {
        container.innerHTML = '<div class="empty-state">No chapters yet. Create chapters within books.</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Book</th>
                    <th>Slug</th>
                    <th>Sort</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${chapters.map(ch => `
                    <tr>
                        <td><strong>${escapeHtml(ch.title)}</strong></td>
                        <td style="color: var(--accent-purple);">${escapeHtml(ch.book_title)}</td>
                        <td style="color: var(--text-muted);">${ch.slug}</td>
                        <td>${ch.sort_order}</td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-sm" onclick="editChapter(${ch.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteChapter(${ch.id}, '${escapeHtml(ch.title)}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openChapterModal(chapter = null) {
    document.getElementById('chapter-modal-title').textContent = chapter ? 'Edit Chapter' : 'New Chapter';
    document.getElementById('chapter-id').value = chapter?.id || '';
    document.getElementById('chapter-title').value = chapter?.title || '';
    document.getElementById('chapter-description').value = chapter?.description || '';
    document.getElementById('chapter-sort').value = chapter?.sort_order || 0;
    document.getElementById('chapter-author-note').value = chapter?.author_note || '';

    // Populate book select
    const bookSelect = document.getElementById('chapter-book');
    bookSelect.innerHTML = books.map(b =>
        `<option value="${b.id}" ${chapter?.book_id === b.id ? 'selected' : ''}>${escapeHtml(b.title)}</option>`
    ).join('');

    openModal('chapter-modal');
}

async function editChapter(id) {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) openChapterModal(chapter);
}

async function saveChapter() {
    const id = document.getElementById('chapter-id').value;
    const data = {
        book_id: parseInt(document.getElementById('chapter-book').value),
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
        await loadChapters();
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
        await loadChapters();
    } catch (error) {
        showStatus('Failed to delete chapter: ' + error.message, true);
    }
}

// ========================================
// PAGES
// ========================================

async function loadPages() {
    try {
        // Load pages from all books
        pages = [];
        for (const book of books) {
            const bookData = await apiRequest('GET', `/books/${book.slug}`);
            bookData.pages.forEach(p => {
                const chapter = bookData.chapters.find(c => c.id === p.chapter_id);
                pages.push({
                    ...p,
                    book_id: book.id,
                    book_title: book.title,
                    book_slug: book.slug,
                    chapter_title: chapter?.title || ''
                });
            });
        }
        renderPagesList();
    } catch (error) {
        showStatus('Failed to load pages: ' + error.message, true);
    }
}

function renderPagesList() {
    const container = document.getElementById('pages-list');

    if (pages.length === 0) {
        container.innerHTML = '<div class="empty-state">No pages yet. Create your first page!</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Book</th>
                    <th>Chapter</th>
                    <th>Sort</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${pages.map(p => `
                    <tr>
                        <td><strong>${escapeHtml(p.title)}</strong></td>
                        <td style="color: var(--accent-purple);">${escapeHtml(p.book_title)}</td>
                        <td style="color: var(--text-muted);">${escapeHtml(p.chapter_title) || '—'}</td>
                        <td>${p.sort_order}</td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-sm" onclick="editPage(${p.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deletePage(${p.id}, '${escapeHtml(p.title)}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openPageModal(page = null) {
    document.getElementById('page-modal-title').textContent = page ? 'Edit Page' : 'New Page';
    document.getElementById('page-id').value = page?.id || '';
    document.getElementById('page-title').value = page?.title || '';
    document.getElementById('page-summary').value = page?.summary || '';
    document.getElementById('page-sort').value = page?.sort_order || 0;
    document.getElementById('page-tags').value = (page?.tags || []).join(', ');
    document.getElementById('page-author-note').value = page?.author_note || '';

    // Set content in TinyMCE
    if (tinyEditor) {
        tinyEditor.setContent(page?.content || '');
    }

    // Populate book select
    const bookSelect = document.getElementById('page-book');
    bookSelect.innerHTML = books.map(b =>
        `<option value="${b.id}" ${page?.book_id === b.id ? 'selected' : ''}>${escapeHtml(b.title)}</option>`
    ).join('');

    // Update chapter select based on book
    updateChapterSelect(page?.chapter_id);

    openModal('page-modal');
}

async function updateChapterSelect(selectedChapterId = null) {
    const bookId = parseInt(document.getElementById('page-book').value);
    const chapterSelect = document.getElementById('page-chapter');

    // Get chapters for selected book
    const bookChapters = chapters.filter(c => c.book_id === bookId);

    chapterSelect.innerHTML = '<option value="">No chapter</option>' +
        bookChapters.map(c =>
            `<option value="${c.id}" ${c.id === selectedChapterId ? 'selected' : ''}>${escapeHtml(c.title)}</option>`
        ).join('');
}

async function editPage(id) {
    try {
        // Fetch full page data
        const page = await apiRequest('GET', `/pages/${id}`);
        page.book_id = books.find(b => b.slug === page.book_slug)?.id;
        page.chapter_id = chapters.find(c => c.slug === page.chapter_slug && c.book_slug === page.book_slug)?.id;
        openPageModal(page);
    } catch (error) {
        showStatus('Failed to load page: ' + error.message, true);
    }
}

async function savePage() {
    const id = document.getElementById('page-id').value;
    const tagsStr = document.getElementById('page-tags').value;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const data = {
        book_id: parseInt(document.getElementById('page-book').value),
        chapter_id: document.getElementById('page-chapter').value ? parseInt(document.getElementById('page-chapter').value) : null,
        title: document.getElementById('page-title').value.trim(),
        summary: document.getElementById('page-summary').value.trim(),
        content: tinyEditor ? tinyEditor.getContent() : '',
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
        await loadPages();
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
        await loadPages();
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
