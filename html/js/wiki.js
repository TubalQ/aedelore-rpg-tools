/**
 * Aedelore Wiki - Client-side JavaScript
 */

// State
let currentView = 'home';
let currentBook = null;
let currentPage = null;
let booksData = [];
let searchTimeout = null;

// API base URL
const API_BASE = '/api/wiki';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Parse initial route from hash
    parseRoute();

    // Listen for hash changes
    window.addEventListener('hashchange', parseRoute);

    // Setup search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                if (currentView === 'search') {
                    navigateTo('home');
                }
            }
        });
    }
});

// Route parsing
function parseRoute() {
    const hash = window.location.hash.slice(1); // Remove #

    if (!hash || hash === '/') {
        navigateTo('home');
    } else if (hash.startsWith('search/')) {
        const query = decodeURIComponent(hash.slice(7));
        showSearchResults(query);
    } else {
        const parts = hash.split('/');
        if (parts.length === 1) {
            // Book view
            loadBook(parts[0]);
        } else if (parts.length === 2) {
            // Page view
            loadPage(parts[0], parts[1]);
        }
    }
}

// Navigation
function navigateTo(view, ...args) {
    if (view === 'home') {
        window.location.hash = '';
        currentView = 'home';
        currentBook = null;
        currentPage = null;
        loadBooks();
    } else if (view === 'book') {
        window.location.hash = args[0];
    } else if (view === 'page') {
        window.location.hash = `${args[0]}/${args[1]}`;
    } else if (view === 'search') {
        window.location.hash = `search/${encodeURIComponent(args[0])}`;
    }
}

// Update breadcrumb
function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    let html = '<a href="#" onclick="navigateTo(\'home\'); return false;">Wiki</a>';

    items.forEach((item, index) => {
        html += '<span>›</span>';
        if (index === items.length - 1) {
            html += `<span>${escapeHtml(item.title)}</span>`;
        } else {
            html += `<a href="#${item.slug}" onclick="navigateTo('book', '${item.slug}'); return false;">${escapeHtml(item.title)}</a>`;
        }
    });

    breadcrumb.innerHTML = html;
}

// Load all books (home view)
async function loadBooks() {
    const content = document.getElementById('wiki-content');
    const sidebar = document.getElementById('sidebar');

    sidebar.style.display = 'none';
    content.innerHTML = '<div class="wiki-loading"><div class="wiki-loading-spinner"></div><p>Loading books...</p></div>';

    updateBreadcrumb([]);

    try {
        const response = await fetch(`${API_BASE}/books`);
        if (!response.ok) throw new Error('Failed to load books');

        booksData = await response.json();

        if (booksData.length === 0) {
            content.innerHTML = `
                <div class="wiki-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                    <p>No wiki content yet.</p>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="wiki-book-grid">
                ${booksData.map(book => `
                    <div class="wiki-book-card" onclick="navigateTo('book', '${book.slug}')">
                        <h3>${escapeHtml(book.title)}</h3>
                        <p>${escapeHtml(book.description || 'Explore this collection of lore.')}</p>
                        <div class="wiki-book-meta">
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                                ${book.chapter_count} chapters
                            </span>
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                </svg>
                                ${book.page_count} pages
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading books:', error);
        content.innerHTML = `
            <div class="wiki-empty">
                <p>Failed to load wiki content. Please try again later.</p>
            </div>
        `;
    }
}

// Load a book's contents
async function loadBook(bookSlug) {
    const content = document.getElementById('wiki-content');
    const sidebar = document.getElementById('sidebar');

    sidebar.style.display = 'none';
    content.innerHTML = '<div class="wiki-loading"><div class="wiki-loading-spinner"></div><p>Loading...</p></div>';

    currentView = 'book';
    currentBook = bookSlug;
    currentPage = null;

    try {
        const response = await fetch(`${API_BASE}/books/${bookSlug}`);
        if (!response.ok) throw new Error('Book not found');

        const book = await response.json();

        updateBreadcrumb([{ title: book.title, slug: book.slug }]);

        // Group pages by chapter
        const chapterPages = {};
        const standalonePages = [];

        book.pages.forEach(page => {
            if (page.chapter_id) {
                if (!chapterPages[page.chapter_id]) {
                    chapterPages[page.chapter_id] = [];
                }
                chapterPages[page.chapter_id].push(page);
            } else {
                standalonePages.push(page);
            }
        });

        let html = `
            <a href="#" class="wiki-back-btn" onclick="navigateTo('home'); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5m7-7-7 7 7 7"/>
                </svg>
                Back to all books
            </a>
            <h2 style="font-size: 1.75rem; margin-bottom: 8px;">${escapeHtml(book.title)}</h2>
        `;

        if (book.description) {
            html += `<p style="color: var(--text-subdued); margin-bottom: 24px;">${escapeHtml(book.description)}</p>`;
        }

        // Chapters
        if (book.chapters.length > 0) {
            html += '<ul class="wiki-chapter-list">';

            book.chapters.forEach(chapter => {
                const pages = chapterPages[chapter.id] || [];
                html += `
                    <li class="wiki-chapter-item">
                        <div class="wiki-chapter-header" onclick="toggleChapter(this)">
                            <h4>${escapeHtml(chapter.title)}</h4>
                            <svg class="wiki-chapter-toggle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </div>
                        <div class="wiki-chapter-pages">
                            ${chapter.description ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">${escapeHtml(chapter.description)}</p>` : ''}
                            ${pages.length > 0 ? `
                                <ul class="wiki-page-list">
                                    ${pages.map(page => `
                                        <li>
                                            <a href="#${bookSlug}/${page.slug}" onclick="navigateTo('page', '${bookSlug}', '${page.slug}'); return false;">
                                                ${escapeHtml(page.title)}
                                            </a>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p style="color: var(--text-muted); font-size: 0.85rem;">No pages in this chapter yet.</p>'}
                        </div>
                    </li>
                `;
            });

            html += '</ul>';
        }

        // Standalone pages
        if (standalonePages.length > 0) {
            html += `
                <h3 style="font-size: 1.1rem; margin-top: 32px; margin-bottom: 16px; color: var(--text-muted);">Pages</h3>
                <ul class="wiki-page-list" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px;">
                    ${standalonePages.map(page => `
                        <li>
                            <a href="#${bookSlug}/${page.slug}" onclick="navigateTo('page', '${bookSlug}', '${page.slug}'); return false;">
                                ${escapeHtml(page.title)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading book:', error);
        content.innerHTML = `
            <div class="wiki-empty">
                <p>Book not found.</p>
                <a href="#" class="wiki-back-btn" onclick="navigateTo('home'); return false;">Back to all books</a>
            </div>
        `;
    }
}

// Toggle chapter expansion
function toggleChapter(header) {
    const item = header.closest('.wiki-chapter-item');
    item.classList.toggle('open');
}

// Load a page
async function loadPage(bookSlug, pageSlug) {
    const content = document.getElementById('wiki-content');
    const sidebar = document.getElementById('sidebar');

    content.innerHTML = '<div class="wiki-loading"><div class="wiki-loading-spinner"></div><p>Loading...</p></div>';

    currentView = 'page';
    currentBook = bookSlug;
    currentPage = pageSlug;

    try {
        const response = await fetch(`${API_BASE}/books/${bookSlug}/pages/${pageSlug}`);
        if (!response.ok) throw new Error('Page not found');

        const page = await response.json();

        // Update breadcrumb
        const breadcrumbItems = [{ title: page.book_title, slug: page.book_slug }];
        if (page.chapter_title) {
            breadcrumbItems.push({ title: page.chapter_title, slug: page.book_slug });
        }
        breadcrumbItems.push({ title: page.title, slug: `${page.book_slug}/${page.slug}` });
        updateBreadcrumb(breadcrumbItems);

        // Build page HTML
        let html = `
            <a href="#${bookSlug}" class="wiki-back-btn" onclick="navigateTo('book', '${bookSlug}'); return false;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5m7-7-7 7 7 7"/>
                </svg>
                Back to ${escapeHtml(page.book_title)}
            </a>
            <div class="wiki-page-content">
                <h1>${escapeHtml(page.title)}</h1>
        `;

        // Author note
        if (page.author_note) {
            html += `
                <div class="wiki-author-note">
                    ${page.author_note}
                </div>
            `;
        }

        // Content
        html += `<div class="wiki-page-body">${page.content || '<p>No content yet.</p>'}</div>`;

        // Tags
        if (page.tags && page.tags.length > 0) {
            html += `
                <div class="wiki-tags">
                    ${page.tags.map(tag => `
                        <a href="#" class="wiki-tag" onclick="searchByTag('${escapeHtml(tag)}'); return false;">${escapeHtml(tag)}</a>
                    `).join('')}
                </div>
            `;
        }

        html += '</div>';

        content.innerHTML = html;

        // Build table of contents from headings
        buildTableOfContents();
        sidebar.style.display = 'block';

        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading page:', error);
        content.innerHTML = `
            <div class="wiki-empty">
                <p>Page not found.</p>
                <a href="#${bookSlug}" class="wiki-back-btn" onclick="navigateTo('book', '${bookSlug}'); return false;">Back to book</a>
            </div>
        `;
        sidebar.style.display = 'none';
    }
}

// Build table of contents from headings in page content
function buildTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const pageBody = document.querySelector('.wiki-page-body');

    if (!tocList || !pageBody) return;

    const headings = pageBody.querySelectorAll('h2, h3');
    let html = '';

    headings.forEach((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;

        const level = heading.tagName === 'H2' ? '' : 'style="padding-left: 16px; font-size: 0.85rem;"';
        html += `<li ${level}><a href="#${id}" onclick="scrollToSection('${id}'); return false;">${escapeHtml(heading.textContent)}</a></li>`;
    });

    tocList.innerHTML = html || '<li style="color: var(--text-muted);">No sections</li>';
}

// Scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Search handling
function handleSearch(e) {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        if (currentView === 'search') {
            navigateTo('home');
        }
        return;
    }

    searchTimeout = setTimeout(() => {
        navigateTo('search', query);
    }, 300);
}

// Show search results
async function showSearchResults(query) {
    const content = document.getElementById('wiki-content');
    const sidebar = document.getElementById('sidebar');
    const searchInput = document.getElementById('search-input');

    sidebar.style.display = 'none';
    currentView = 'search';

    // Update search input
    if (searchInput && searchInput.value !== query) {
        searchInput.value = query;
    }

    updateBreadcrumb([{ title: `Search: "${query}"`, slug: 'search' }]);

    content.innerHTML = '<div class="wiki-loading"><div class="wiki-loading-spinner"></div><p>Searching...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();

        if (data.results.length === 0) {
            content.innerHTML = `
                <div class="wiki-empty">
                    <p>No results found for "${escapeHtml(query)}"</p>
                    <a href="#" class="wiki-back-btn" onclick="navigateTo('home'); return false;">Browse all books</a>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <p style="color: var(--text-muted); margin-bottom: 24px;">Found ${data.results.length} result${data.results.length === 1 ? '' : 's'} for "${escapeHtml(query)}"</p>
            <div class="wiki-search-results">
                ${data.results.map(result => `
                    <div class="wiki-search-result" onclick="navigateTo('page', '${result.book_slug}', '${result.slug}')">
                        <h4>${escapeHtml(result.title)}</h4>
                        ${result.summary ? `<p>${escapeHtml(result.summary)}</p>` : ''}
                        <div class="book-name">${escapeHtml(result.book_title)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Search error:', error);
        content.innerHTML = `
            <div class="wiki-empty">
                <p>Search failed. Please try again.</p>
            </div>
        `;
    }
}

// Search by tag
function searchByTag(tag) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = tag;
    }
    navigateTo('search', tag);
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for global access
window.navigateTo = navigateTo;
window.toggleChapter = toggleChapter;
window.scrollToSection = scrollToSection;
window.searchByTag = searchByTag;
