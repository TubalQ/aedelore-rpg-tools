const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const log = loggers.routes;

// Metrics reference (will be set by server.js)
let metrics = null;
let writeMetricsFile = null;

function setMetrics(m, writeFn) {
    metrics = m;
    writeMetricsFile = writeFn;
}

// Admin check middleware - only user ID 6 (Patrik) can admin
function requireAdmin(req, res, next) {
    if (req.userId !== 6) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Helper: Generate slug from title
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// ========================================
// IMAGE UPLOAD CONFIGURATION
// ========================================

const UPLOAD_DIR = '/app/uploads/images/wiki';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const dir = path.join(UPLOAD_DIR, yearMonth);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = slugify(path.basename(file.originalname, ext)) || 'image';
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: jpg, jpeg, png, gif, webp'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

// ========================================
// PUBLIC ENDPOINTS (No authentication)
// ========================================

// GET /api/wiki/books - List all books
router.get('/books', async (req, res) => {
    try {
        const books = await db.all(`
            SELECT
                b.id, b.slug, b.title, b.description, b.cover_image, b.author_note, b.sort_order,
                COUNT(DISTINCT c.id) as chapter_count,
                COUNT(DISTINCT p.id) as page_count
            FROM wiki_books b
            LEFT JOIN wiki_chapters c ON c.book_id = b.id AND c.deleted_at IS NULL
            LEFT JOIN wiki_pages p ON p.book_id = b.id AND p.deleted_at IS NULL
            WHERE b.deleted_at IS NULL
            GROUP BY b.id
            ORDER BY b.sort_order, b.title
        `);
        res.json(books);
    } catch (error) {
        log.error({ err: error }, 'Get wiki books error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/books/:slug - Get book with chapters and pages
router.get('/books/:slug', async (req, res) => {
    try {
        const book = await db.get(
            'SELECT * FROM wiki_books WHERE slug = $1 AND deleted_at IS NULL',
            [req.params.slug]
        );

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Get chapters
        const chapters = await db.all(`
            SELECT id, slug, title, description, author_note, sort_order
            FROM wiki_chapters
            WHERE book_id = $1 AND deleted_at IS NULL
            ORDER BY sort_order, title
        `, [book.id]);

        // Get pages (both with chapters and without)
        const pages = await db.all(`
            SELECT id, slug, title, summary, chapter_id, sort_order
            FROM wiki_pages
            WHERE book_id = $1 AND deleted_at IS NULL
            ORDER BY sort_order, title
        `, [book.id]);

        res.json({
            ...book,
            chapters,
            pages
        });
    } catch (error) {
        log.error({ err: error }, 'Get wiki book error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/books/:bookSlug/pages/:pageSlug - Get page content
router.get('/books/:bookSlug/pages/:pageSlug', async (req, res) => {
    try {
        const page = await db.get(`
            SELECT p.*, b.title as book_title, b.slug as book_slug,
                   c.title as chapter_title, c.slug as chapter_slug
            FROM wiki_pages p
            JOIN wiki_books b ON p.book_id = b.id
            LEFT JOIN wiki_chapters c ON p.chapter_id = c.id
            WHERE b.slug = $1 AND p.slug = $2 AND p.deleted_at IS NULL AND b.deleted_at IS NULL
        `, [req.params.bookSlug, req.params.pageSlug]);

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        // Increment view count
        await db.query(
            'UPDATE wiki_pages SET view_count = view_count + 1 WHERE id = $1',
            [page.id]
        );

        res.json(page);
    } catch (error) {
        log.error({ err: error }, 'Get wiki page error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/pages/:id - Get page by ID
router.get('/pages/:id', async (req, res) => {
    try {
        const page = await db.get(`
            SELECT p.*, b.title as book_title, b.slug as book_slug,
                   c.title as chapter_title, c.slug as chapter_slug
            FROM wiki_pages p
            JOIN wiki_books b ON p.book_id = b.id
            LEFT JOIN wiki_chapters c ON p.chapter_id = c.id
            WHERE p.id = $1 AND p.deleted_at IS NULL AND b.deleted_at IS NULL
        `, [req.params.id]);

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        log.error({ err: error }, 'Get wiki page by ID error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/search - Full-text search
router.get('/search', async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const searchTerm = q.trim();

        // Search in pages using ILIKE for simple search
        const pages = await db.all(`
            SELECT p.id, p.slug, p.title, p.summary, p.book_id,
                   b.title as book_title, b.slug as book_slug,
                   c.title as chapter_title
            FROM wiki_pages p
            JOIN wiki_books b ON p.book_id = b.id
            LEFT JOIN wiki_chapters c ON p.chapter_id = c.id
            WHERE p.deleted_at IS NULL AND b.deleted_at IS NULL
              AND (
                  p.title ILIKE $1
                  OR p.content ILIKE $1
                  OR p.summary ILIKE $1
                  OR $2 = ANY(p.tags)
              )
            ORDER BY
                CASE WHEN p.title ILIKE $1 THEN 0 ELSE 1 END,
                p.title
            LIMIT 50
        `, [`%${searchTerm}%`, searchTerm.toLowerCase()]);

        res.json({ query: searchTerm, results: pages });
    } catch (error) {
        log.error({ err: error }, 'Wiki search error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/tags - List all unique tags
router.get('/tags', async (req, res) => {
    try {
        const result = await db.all(`
            SELECT DISTINCT UNNEST(tags) as tag
            FROM wiki_pages
            WHERE deleted_at IS NULL AND tags IS NOT NULL
            ORDER BY tag
        `);
        res.json(result.map(r => r.tag));
    } catch (error) {
        log.error({ err: error }, 'Get wiki tags error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/tags/:tag - List pages by tag
router.get('/tags/:tag', async (req, res) => {
    try {
        const pages = await db.all(`
            SELECT p.id, p.slug, p.title, p.summary, p.book_id,
                   b.title as book_title, b.slug as book_slug
            FROM wiki_pages p
            JOIN wiki_books b ON p.book_id = b.id
            WHERE p.deleted_at IS NULL AND b.deleted_at IS NULL
              AND $1 = ANY(p.tags)
            ORDER BY p.title
        `, [req.params.tag.toLowerCase()]);

        res.json({ tag: req.params.tag, pages });
    } catch (error) {
        log.error({ err: error }, 'Get pages by tag error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/wiki/recent - Recently updated pages
router.get('/recent', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const pages = await db.all(`
            SELECT p.id, p.slug, p.title, p.summary, p.updated_at,
                   b.title as book_title, b.slug as book_slug
            FROM wiki_pages p
            JOIN wiki_books b ON p.book_id = b.id
            WHERE p.deleted_at IS NULL AND b.deleted_at IS NULL
            ORDER BY p.updated_at DESC
            LIMIT $1
        `, [limit]);

        res.json(pages);
    } catch (error) {
        log.error({ err: error }, 'Get recent pages error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================================
// ADMIN ENDPOINTS (Requires authentication + admin)
// ========================================

// POST /api/wiki/admin/upload-image - Upload image for TinyMCE
router.post('/admin/upload-image', authenticate, requireAdmin, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File too large. Maximum size: 5MB' });
                }
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Build the public URL path (convert /app/uploads to /uploads)
        const relativePath = req.file.path.replace('/app/uploads', '/uploads');
        log.info({ path: relativePath, size: req.file.size }, 'Wiki image uploaded');
        res.json({ location: relativePath });
    });
});

// POST /api/wiki/admin/books - Create book
router.post('/admin/books', authenticate, requireAdmin, async (req, res) => {
    const { title, description, cover_image, author_note, sort_order } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const slug = slugify(title);

    try {
        // Check for duplicate slug
        const existing = await db.get(
            'SELECT id FROM wiki_books WHERE slug = $1',
            [slug]
        );
        if (existing) {
            return res.status(400).json({ error: 'A book with this title already exists' });
        }

        const result = await db.get(
            `INSERT INTO wiki_books (slug, title, description, cover_image, author_note, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [slug, title.trim(), description || null, cover_image || null, author_note || null, sort_order || 0]
        );

        res.json({ success: true, id: result.id, slug });
    } catch (error) {
        log.error({ err: error }, 'Create wiki book error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/wiki/admin/books/:id - Update book
router.put('/admin/books/:id', authenticate, requireAdmin, async (req, res) => {
    const { title, description, cover_image, author_note, sort_order } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const book = await db.get(
            'SELECT id FROM wiki_books WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const newSlug = slugify(title);

        // Check for duplicate slug (excluding self)
        const existing = await db.get(
            'SELECT id FROM wiki_books WHERE slug = $1 AND id != $2',
            [newSlug, req.params.id]
        );
        if (existing) {
            return res.status(400).json({ error: 'A book with this title already exists' });
        }

        await db.query(
            `UPDATE wiki_books SET
                slug = $1, title = $2, description = $3, cover_image = $4,
                author_note = $5, sort_order = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [newSlug, title.trim(), description || null, cover_image || null,
             author_note || null, sort_order || 0, req.params.id]
        );

        res.json({ success: true, slug: newSlug });
    } catch (error) {
        log.error({ err: error }, 'Update wiki book error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/wiki/admin/books/:id - Soft delete book
router.delete('/admin/books/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE wiki_books SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Delete wiki book error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/wiki/admin/chapters - Create chapter
router.post('/admin/chapters', authenticate, requireAdmin, async (req, res) => {
    const { book_id, title, description, author_note, sort_order } = req.body;

    if (!book_id) {
        return res.status(400).json({ error: 'Book ID is required' });
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const slug = slugify(title);

    try {
        // Verify book exists
        const book = await db.get(
            'SELECT id FROM wiki_books WHERE id = $1 AND deleted_at IS NULL',
            [book_id]
        );
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check for duplicate slug within book
        const existing = await db.get(
            'SELECT id FROM wiki_chapters WHERE book_id = $1 AND slug = $2',
            [book_id, slug]
        );
        if (existing) {
            return res.status(400).json({ error: 'A chapter with this title already exists in this book' });
        }

        const result = await db.get(
            `INSERT INTO wiki_chapters (book_id, slug, title, description, author_note, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [book_id, slug, title.trim(), description || null, author_note || null, sort_order || 0]
        );

        res.json({ success: true, id: result.id, slug });
    } catch (error) {
        log.error({ err: error }, 'Create wiki chapter error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/wiki/admin/chapters/:id - Update chapter
router.put('/admin/chapters/:id', authenticate, requireAdmin, async (req, res) => {
    const { title, description, author_note, sort_order } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const chapter = await db.get(
            'SELECT id, book_id FROM wiki_chapters WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const newSlug = slugify(title);

        // Check for duplicate slug within book (excluding self)
        const existing = await db.get(
            'SELECT id FROM wiki_chapters WHERE book_id = $1 AND slug = $2 AND id != $3',
            [chapter.book_id, newSlug, req.params.id]
        );
        if (existing) {
            return res.status(400).json({ error: 'A chapter with this title already exists in this book' });
        }

        await db.query(
            `UPDATE wiki_chapters SET
                slug = $1, title = $2, description = $3, author_note = $4,
                sort_order = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [newSlug, title.trim(), description || null, author_note || null, sort_order || 0, req.params.id]
        );

        res.json({ success: true, slug: newSlug });
    } catch (error) {
        log.error({ err: error }, 'Update wiki chapter error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/wiki/admin/chapters/:id - Soft delete chapter
router.delete('/admin/chapters/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE wiki_chapters SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        // Set chapter_id to NULL for pages in this chapter
        await db.query(
            'UPDATE wiki_pages SET chapter_id = NULL WHERE chapter_id = $1',
            [req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Delete wiki chapter error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/wiki/admin/pages - Create page
router.post('/admin/pages', authenticate, requireAdmin, async (req, res) => {
    const { book_id, chapter_id, title, content, summary, author_note, tags, sort_order } = req.body;

    if (!book_id) {
        return res.status(400).json({ error: 'Book ID is required' });
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const slug = slugify(title);

    try {
        // Verify book exists
        const book = await db.get(
            'SELECT id FROM wiki_books WHERE id = $1 AND deleted_at IS NULL',
            [book_id]
        );
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Verify chapter if provided
        if (chapter_id) {
            const chapter = await db.get(
                'SELECT id FROM wiki_chapters WHERE id = $1 AND book_id = $2 AND deleted_at IS NULL',
                [chapter_id, book_id]
            );
            if (!chapter) {
                return res.status(404).json({ error: 'Chapter not found in this book' });
            }
        }

        // Check for duplicate slug within book
        const existing = await db.get(
            'SELECT id FROM wiki_pages WHERE book_id = $1 AND slug = $2',
            [book_id, slug]
        );
        if (existing) {
            return res.status(400).json({ error: 'A page with this title already exists in this book' });
        }

        // Process tags
        const processedTags = Array.isArray(tags)
            ? tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0)
            : null;

        const result = await db.get(
            `INSERT INTO wiki_pages (book_id, chapter_id, slug, title, content, summary, author_note, tags, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [book_id, chapter_id || null, slug, title.trim(), content || '',
             summary || null, author_note || null, processedTags, sort_order || 0]
        );

        res.json({ success: true, id: result.id, slug });
    } catch (error) {
        log.error({ err: error }, 'Create wiki page error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/wiki/admin/pages/:id - Update page
router.put('/admin/pages/:id', authenticate, requireAdmin, async (req, res) => {
    const { chapter_id, title, content, summary, author_note, tags, sort_order } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const page = await db.get(
            'SELECT id, book_id FROM wiki_pages WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        // Verify chapter if provided
        if (chapter_id) {
            const chapter = await db.get(
                'SELECT id FROM wiki_chapters WHERE id = $1 AND book_id = $2 AND deleted_at IS NULL',
                [chapter_id, page.book_id]
            );
            if (!chapter) {
                return res.status(404).json({ error: 'Chapter not found in this book' });
            }
        }

        const newSlug = slugify(title);

        // Check for duplicate slug within book (excluding self)
        const existing = await db.get(
            'SELECT id FROM wiki_pages WHERE book_id = $1 AND slug = $2 AND id != $3',
            [page.book_id, newSlug, req.params.id]
        );
        if (existing) {
            return res.status(400).json({ error: 'A page with this title already exists in this book' });
        }

        // Process tags
        const processedTags = Array.isArray(tags)
            ? tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0)
            : null;

        await db.query(
            `UPDATE wiki_pages SET
                chapter_id = $1, slug = $2, title = $3, content = $4, summary = $5,
                author_note = $6, tags = $7, sort_order = $8, updated_at = CURRENT_TIMESTAMP
             WHERE id = $9`,
            [chapter_id || null, newSlug, title.trim(), content || '', summary || null,
             author_note || null, processedTags, sort_order || 0, req.params.id]
        );

        res.json({ success: true, slug: newSlug });
    } catch (error) {
        log.error({ err: error }, 'Update wiki page error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/wiki/admin/pages/:id - Soft delete page
router.delete('/admin/pages/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE wiki_pages SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Delete wiki page error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/wiki/admin/pages/:id/restore - Restore deleted page
router.post('/admin/pages/:id/restore', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE wiki_pages SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted page not found' });
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Restore wiki page error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/wiki/admin/import - Bulk import from JSON
router.post('/admin/import', authenticate, requireAdmin, async (req, res) => {
    const { books } = req.body;

    if (!Array.isArray(books)) {
        return res.status(400).json({ error: 'Books array is required' });
    }

    const client = await db.pool.connect();
    let imported = { books: 0, chapters: 0, pages: 0 };

    try {
        await client.query('BEGIN');

        for (const bookData of books) {
            if (!bookData.title) continue;

            const bookSlug = slugify(bookData.title);

            // Insert or update book
            const bookResult = await client.query(
                `INSERT INTO wiki_books (slug, title, description, author_note, sort_order)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (slug) DO UPDATE SET
                    title = EXCLUDED.title, description = EXCLUDED.description,
                    author_note = EXCLUDED.author_note, sort_order = EXCLUDED.sort_order,
                    updated_at = CURRENT_TIMESTAMP
                 RETURNING id`,
                [bookSlug, bookData.title, bookData.description || null,
                 bookData.author_note || null, bookData.sort_order || 0]
            );
            const bookId = bookResult.rows[0].id;
            imported.books++;

            // Import chapters
            if (Array.isArray(bookData.chapters)) {
                for (const chapterData of bookData.chapters) {
                    if (!chapterData.title) continue;

                    const chapterSlug = slugify(chapterData.title);

                    const chapterResult = await client.query(
                        `INSERT INTO wiki_chapters (book_id, slug, title, description, author_note, sort_order)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (book_id, slug) DO UPDATE SET
                            title = EXCLUDED.title, description = EXCLUDED.description,
                            author_note = EXCLUDED.author_note, sort_order = EXCLUDED.sort_order,
                            updated_at = CURRENT_TIMESTAMP
                         RETURNING id`,
                        [bookId, chapterSlug, chapterData.title, chapterData.description || null,
                         chapterData.author_note || null, chapterData.sort_order || 0]
                    );
                    const chapterId = chapterResult.rows[0].id;
                    imported.chapters++;

                    // Import pages within chapter
                    if (Array.isArray(chapterData.pages)) {
                        for (const pageData of chapterData.pages) {
                            if (!pageData.title) continue;

                            const pageSlug = slugify(pageData.title);
                            const tags = Array.isArray(pageData.tags)
                                ? pageData.tags.map(t => t.toLowerCase().trim())
                                : null;

                            await client.query(
                                `INSERT INTO wiki_pages (book_id, chapter_id, slug, title, content, summary, author_note, tags, sort_order)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                 ON CONFLICT (book_id, slug) DO UPDATE SET
                                    chapter_id = EXCLUDED.chapter_id, title = EXCLUDED.title,
                                    content = EXCLUDED.content, summary = EXCLUDED.summary,
                                    author_note = EXCLUDED.author_note, tags = EXCLUDED.tags,
                                    sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP`,
                                [bookId, chapterId, pageSlug, pageData.title, pageData.content || '',
                                 pageData.summary || null, pageData.author_note || null, tags, pageData.sort_order || 0]
                            );
                            imported.pages++;
                        }
                    }
                }
            }

            // Import pages directly under book (no chapter)
            if (Array.isArray(bookData.pages)) {
                for (const pageData of bookData.pages) {
                    if (!pageData.title) continue;

                    const pageSlug = slugify(pageData.title);
                    const tags = Array.isArray(pageData.tags)
                        ? pageData.tags.map(t => t.toLowerCase().trim())
                        : null;

                    await client.query(
                        `INSERT INTO wiki_pages (book_id, chapter_id, slug, title, content, summary, author_note, tags, sort_order)
                         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)
                         ON CONFLICT (book_id, slug) DO UPDATE SET
                            title = EXCLUDED.title, content = EXCLUDED.content, summary = EXCLUDED.summary,
                            author_note = EXCLUDED.author_note, tags = EXCLUDED.tags,
                            sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP`,
                        [bookId, pageSlug, pageData.title, pageData.content || '',
                         pageData.summary || null, pageData.author_note || null, tags, pageData.sort_order || 0]
                    );
                    imported.pages++;
                }
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, imported });
    } catch (error) {
        await client.query('ROLLBACK');
        log.error({ err: error }, 'Wiki import error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Import failed: ' + error.message });
    } finally {
        client.release();
    }
});

// GET /api/wiki/admin/trash - List deleted items
router.get('/admin/trash', authenticate, requireAdmin, async (req, res) => {
    try {
        const books = await db.all(
            'SELECT id, slug, title, deleted_at FROM wiki_books WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
        );
        const chapters = await db.all(
            `SELECT c.id, c.slug, c.title, c.deleted_at, b.title as book_title
             FROM wiki_chapters c
             JOIN wiki_books b ON c.book_id = b.id
             WHERE c.deleted_at IS NOT NULL
             ORDER BY c.deleted_at DESC`
        );
        const pages = await db.all(
            `SELECT p.id, p.slug, p.title, p.deleted_at, b.title as book_title
             FROM wiki_pages p
             JOIN wiki_books b ON p.book_id = b.id
             WHERE p.deleted_at IS NOT NULL
             ORDER BY p.deleted_at DESC`
        );

        res.json({ books, chapters, pages });
    } catch (error) {
        log.error({ err: error }, 'Get wiki trash error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
module.exports.setMetrics = setMetrics;
