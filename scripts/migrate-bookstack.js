#!/usr/bin/env node
/**
 * BookStack to Aedelore Wiki Migration Script
 *
 * Migrates books, chapters, and pages from BookStack (MariaDB)
 * to Aedelore Wiki (PostgreSQL).
 *
 * Usage:
 *   node scripts/migrate-bookstack.js [--dry-run] [--export-only] [--import-file=export.json]
 *
 * Options:
 *   --dry-run      Show what would be migrated without making changes
 *   --export-only  Only export from BookStack to JSON file
 *   --import-file  Import from a JSON file instead of BookStack
 *
 * Environment variables (from /opt/wiki/.env):
 *   BOOKSTACK_DB_PASSWORD  - MariaDB password for BookStack
 *
 * Note: Kopparhjärtat is excluded from migration (doesn't belong to Aedelore)
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const EXCLUDED_BOOKS = ['kopparhjärtat', 'kopparhjärtat']; // Various spellings
const EXPORT_FILE = 'bookstack-export.json';

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const EXPORT_ONLY = args.includes('--export-only');
const importFileArg = args.find(a => a.startsWith('--import-file='));
const IMPORT_FILE = importFileArg ? importFileArg.split('=')[1] : null;

// Helper: Create slug from title
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

// Helper: Extract author note from content
// BookStack pages often start with italicized attribution
function extractAuthorNote(html) {
    if (!html) return { content: html, authorNote: null };

    // Pattern: Content starting with <p><em>...</em></p>
    const match = html.match(/^<p><em>([^<]+)<\/em><\/p>\s*/i);
    if (match) {
        return {
            content: html.slice(match[0].length),
            authorNote: match[1].trim()
        };
    }
    return { content: html, authorNote: null };
}

// Helper: Clean HTML content
function cleanHtml(html) {
    if (!html) return '';

    // Remove BookStack-specific attributes and classes
    let cleaned = html
        .replace(/\s+data-[a-z-]+="[^"]*"/gi, '')
        .replace(/\s+class="[^"]*"/gi, '')
        .replace(/\s+style="[^"]*"/gi, '')
        .replace(/\s+id="bkmrk-[^"]*"/gi, '');

    // Fix internal links (BookStack format: /books/x/page/y)
    cleaned = cleaned.replace(
        /href="\/books\/([^\/]+)\/page\/([^"]+)"/gi,
        (match, bookSlug, pageSlug) => `href="#${bookSlug}/${pageSlug}"`
    );

    return cleaned.trim();
}

// Connect to BookStack MariaDB
async function connectToBookStack() {
    // Read password from wiki .env file
    let password;
    try {
        const envContent = await fs.readFile('/opt/wiki/.env', 'utf8');
        const match = envContent.match(/BOOKSTACK_DB_PASSWORD=(.+)/);
        if (match) {
            password = match[1].trim();
        }
    } catch (err) {
        console.error('Could not read /opt/wiki/.env:', err.message);
        process.exit(1);
    }

    if (!password) {
        console.error('BOOKSTACK_DB_PASSWORD not found in /opt/wiki/.env');
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'bookstack',
        password: password,
        database: 'bookstack',
        socketPath: '/var/run/mysqld/mysqld.sock'
    });

    // Alternative: Connect via Docker network
    // Try connecting through Docker if socket doesn't work
    try {
        await connection.ping();
    } catch (err) {
        console.log('Trying to connect via Docker network...');
        connection.end();
        return await mysql.createConnection({
            host: 'bookstack_db',
            port: 3306,
            user: 'bookstack',
            password: password,
            database: 'bookstack'
        });
    }

    return connection;
}

// Connect to Aedelore PostgreSQL
async function connectToAedelore() {
    // Read from .env
    require('dotenv').config({ path: '/opt/aedelore/.env' });

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'aedelore',
        user: process.env.DB_USER || 'aedelore',
        password: process.env.DB_PASSWORD,
    });

    return pool;
}

// Export data from BookStack
async function exportFromBookStack(mysqlConn) {
    console.log('\n📚 Exporting from BookStack...\n');

    const data = {
        books: [],
        exportedAt: new Date().toISOString(),
        excludedBooks: []
    };

    // Get all books
    const [books] = await mysqlConn.execute(`
        SELECT id, slug, name, description, created_at, updated_at
        FROM books
        WHERE deleted_at IS NULL
        ORDER BY created_at
    `);

    for (const book of books) {
        // Check if excluded
        if (EXCLUDED_BOOKS.some(ex =>
            book.name.toLowerCase().includes(ex) ||
            book.slug.toLowerCase().includes(ex)
        )) {
            console.log(`  ⏭️  Skipping: ${book.name} (excluded)`);
            data.excludedBooks.push(book.name);
            continue;
        }

        console.log(`  📖 Book: ${book.name}`);

        const bookData = {
            slug: book.slug,
            title: book.name,
            description: book.description,
            chapters: [],
            pages: []
        };

        // Get chapters for this book
        const [chapters] = await mysqlConn.execute(`
            SELECT id, slug, name, description, priority, created_at, updated_at
            FROM chapters
            WHERE book_id = ? AND deleted_at IS NULL
            ORDER BY priority, created_at
        `, [book.id]);

        for (const chapter of chapters) {
            console.log(`    📑 Chapter: ${chapter.name}`);

            const chapterData = {
                slug: chapter.slug,
                title: chapter.name,
                description: chapter.description,
                sortOrder: chapter.priority,
                pages: []
            };

            // Get pages in this chapter
            const [pages] = await mysqlConn.execute(`
                SELECT id, slug, name, html, text, priority, created_at, updated_at
                FROM pages
                WHERE chapter_id = ? AND deleted_at IS NULL
                ORDER BY priority, created_at
            `, [chapter.id]);

            for (const page of pages) {
                const { content, authorNote } = extractAuthorNote(page.html);
                chapterData.pages.push({
                    slug: page.slug,
                    title: page.name,
                    content: cleanHtml(content),
                    summary: page.text ? page.text.substring(0, 300) : null,
                    authorNote: authorNote,
                    sortOrder: page.priority
                });
            }

            bookData.chapters.push(chapterData);
        }

        // Get standalone pages (not in any chapter)
        const [standalonePages] = await mysqlConn.execute(`
            SELECT id, slug, name, html, text, priority, created_at, updated_at
            FROM pages
            WHERE book_id = ? AND chapter_id IS NULL AND deleted_at IS NULL
            ORDER BY priority, created_at
        `, [book.id]);

        for (const page of standalonePages) {
            const { content, authorNote } = extractAuthorNote(page.html);
            bookData.pages.push({
                slug: page.slug,
                title: page.name,
                content: cleanHtml(content),
                summary: page.text ? page.text.substring(0, 300) : null,
                authorNote: authorNote,
                sortOrder: page.priority
            });
        }

        data.books.push(bookData);
    }

    return data;
}

// Import data to Aedelore
async function importToAedelore(pgPool, data) {
    console.log('\n📥 Importing to Aedelore Wiki...\n');

    const client = await pgPool.connect();

    try {
        await client.query('BEGIN');

        let bookCount = 0, chapterCount = 0, pageCount = 0;

        for (const book of data.books) {
            console.log(`  📖 Importing book: ${book.title}`);

            // Check if book already exists
            const existing = await client.query(
                'SELECT id FROM wiki_books WHERE slug = $1',
                [book.slug]
            );

            let bookId;
            if (existing.rows.length > 0) {
                if (DRY_RUN) {
                    console.log(`    [DRY RUN] Would update existing book`);
                    bookId = existing.rows[0].id;
                } else {
                    await client.query(`
                        UPDATE wiki_books
                        SET title = $1, description = $2, updated_at = NOW()
                        WHERE slug = $3
                    `, [book.title, book.description, book.slug]);
                    bookId = existing.rows[0].id;
                }
            } else {
                if (DRY_RUN) {
                    console.log(`    [DRY RUN] Would create new book`);
                    bookId = bookCount + 1;
                } else {
                    const result = await client.query(`
                        INSERT INTO wiki_books (slug, title, description, sort_order)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id
                    `, [book.slug, book.title, book.description, bookCount]);
                    bookId = result.rows[0].id;
                }
                bookCount++;
            }

            // Import chapters
            for (let i = 0; i < book.chapters.length; i++) {
                const chapter = book.chapters[i];
                console.log(`    📑 Chapter: ${chapter.title} (${chapter.pages.length} pages)`);

                let chapterId;
                const existingChapter = await client.query(
                    'SELECT id FROM wiki_chapters WHERE book_id = $1 AND slug = $2',
                    [bookId, chapter.slug]
                );

                if (existingChapter.rows.length > 0) {
                    chapterId = existingChapter.rows[0].id;
                    if (!DRY_RUN) {
                        await client.query(`
                            UPDATE wiki_chapters
                            SET title = $1, description = $2, sort_order = $3, updated_at = NOW()
                            WHERE id = $4
                        `, [chapter.title, chapter.description, chapter.sortOrder || i, chapterId]);
                    }
                } else {
                    if (DRY_RUN) {
                        chapterId = chapterCount + 1;
                    } else {
                        const result = await client.query(`
                            INSERT INTO wiki_chapters (book_id, slug, title, description, sort_order)
                            VALUES ($1, $2, $3, $4, $5)
                            RETURNING id
                        `, [bookId, chapter.slug, chapter.title, chapter.description, chapter.sortOrder || i]);
                        chapterId = result.rows[0].id;
                    }
                    chapterCount++;
                }

                // Import pages in chapter
                for (let j = 0; j < chapter.pages.length; j++) {
                    const page = chapter.pages[j];
                    await importPage(client, bookId, chapterId, page, j);
                    pageCount++;
                }
            }

            // Import standalone pages
            for (let i = 0; i < book.pages.length; i++) {
                const page = book.pages[i];
                console.log(`    📄 Standalone page: ${page.title}`);
                await importPage(client, bookId, null, page, i);
                pageCount++;
            }
        }

        if (DRY_RUN) {
            console.log('\n[DRY RUN] Would have imported:');
            await client.query('ROLLBACK');
        } else {
            await client.query('COMMIT');
            console.log('\n✅ Import completed:');
        }

        console.log(`   ${bookCount} books`);
        console.log(`   ${chapterCount} chapters`);
        console.log(`   ${pageCount} pages`);

        if (data.excludedBooks.length > 0) {
            console.log(`\n⏭️  Excluded books: ${data.excludedBooks.join(', ')}`);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Import a single page
async function importPage(client, bookId, chapterId, page, sortOrder) {
    const existing = await client.query(
        'SELECT id FROM wiki_pages WHERE book_id = $1 AND slug = $2',
        [bookId, page.slug]
    );

    if (existing.rows.length > 0) {
        if (!DRY_RUN) {
            await client.query(`
                UPDATE wiki_pages
                SET title = $1, content = $2, summary = $3, author_note = $4,
                    chapter_id = $5, sort_order = $6, updated_at = NOW()
                WHERE id = $7
            `, [page.title, page.content, page.summary, page.authorNote,
                chapterId, page.sortOrder || sortOrder, existing.rows[0].id]);
        }
    } else {
        if (!DRY_RUN) {
            await client.query(`
                INSERT INTO wiki_pages (book_id, chapter_id, slug, title, content, summary, author_note, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [bookId, chapterId, page.slug, page.title, page.content,
                page.summary, page.authorNote, page.sortOrder || sortOrder]);
        }
    }
}

// Main function
async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  BookStack → Aedelore Wiki Migration Tool    ║');
    console.log('╚══════════════════════════════════════════════╝');

    if (DRY_RUN) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
    }

    let data;

    if (IMPORT_FILE) {
        // Import from JSON file
        console.log(`\n📂 Reading from ${IMPORT_FILE}...`);
        const content = await fs.readFile(IMPORT_FILE, 'utf8');
        data = JSON.parse(content);
        console.log(`   Found ${data.books.length} books from export`);
    } else {
        // Export from BookStack
        let mysqlConn;
        try {
            mysqlConn = await connectToBookStack();
            console.log('✅ Connected to BookStack MariaDB');

            data = await exportFromBookStack(mysqlConn);

            // Save export to file
            const exportPath = path.join(__dirname, EXPORT_FILE);
            await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
            console.log(`\n💾 Exported to ${exportPath}`);

        } catch (err) {
            console.error('\n❌ BookStack connection failed:', err.message);
            console.log('\nTip: Make sure you can connect to the BookStack database.');
            console.log('You may need to run this from inside the Docker network or');
            console.log('use the --import-file option with a pre-exported JSON file.');
            process.exit(1);
        } finally {
            if (mysqlConn) await mysqlConn.end();
        }
    }

    if (EXPORT_ONLY) {
        console.log('\n✅ Export complete (--export-only mode)');
        return;
    }

    // Import to Aedelore
    let pgPool;
    try {
        pgPool = await connectToAedelore();
        console.log('✅ Connected to Aedelore PostgreSQL');

        await importToAedelore(pgPool, data);

    } catch (err) {
        console.error('\n❌ Aedelore import failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        if (pgPool) await pgPool.end();
    }

    console.log('\n🎉 Migration complete!\n');
}

// Run
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
