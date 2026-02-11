const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,                        // Maximum connections in pool
    idleTimeoutMillis: 30000,       // Close idle connections after 30s
    connectionTimeoutMillis: 5000,  // Timeout for new connections
    allowExitOnIdle: false          // Keep pool alive
});

// Handle unexpected pool errors (prevents crashes)
pool.on('error', (err, client) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
});

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS characters (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                data JSONB NOT NULL,
                system TEXT DEFAULT 'aedelore',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);

            -- Add system column if it doesn't exist (migration for existing databases)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'system') THEN
                    ALTER TABLE characters ADD COLUMN system TEXT DEFAULT 'aedelore';
                END IF;
            END $$;

            -- Add campaign_id column if it doesn't exist (migration for linking characters to campaigns)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'campaign_id') THEN
                    ALTER TABLE characters ADD COLUMN campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL;
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS idx_characters_campaign_id ON characters(campaign_id);

            -- Add character locking and XP columns (migration for character progression system)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'xp') THEN
                    ALTER TABLE characters ADD COLUMN xp INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'xp_spent') THEN
                    ALTER TABLE characters ADD COLUMN xp_spent INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'race_class_locked') THEN
                    ALTER TABLE characters ADD COLUMN race_class_locked BOOLEAN DEFAULT FALSE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'attributes_locked') THEN
                    ALTER TABLE characters ADD COLUMN attributes_locked BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;

            -- Add soft delete column for characters (migration for trash/restore feature)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'deleted_at') THEN
                    ALTER TABLE characters ADD COLUMN deleted_at TIMESTAMP;
                END IF;
            END $$;

            -- Add abilities_locked column for characters (migration for locking abilities after campaign start)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'characters' AND column_name = 'abilities_locked') THEN
                    ALTER TABLE characters ADD COLUMN abilities_locked BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);

            -- Campaign players table for tracking which users are in which campaigns
            CREATE TABLE IF NOT EXISTS campaign_players (
                id SERIAL PRIMARY KEY,
                campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(campaign_id, user_id)
            );

            CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign_id ON campaign_players(campaign_id);
            CREATE INDEX IF NOT EXISTS idx_campaign_players_user_id ON campaign_players(user_id);

            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_number INTEGER NOT NULL,
                date TEXT,
                location TEXT,
                status TEXT DEFAULT 'active' CHECK(status IN ('active', 'locked')),
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_campaign_id ON sessions(campaign_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

            CREATE TABLE IF NOT EXISTS auth_tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);

            -- Add email column to users (migration for password reset feature)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'users' AND column_name = 'email') THEN
                    ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

            -- Password reset tokens table
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE
            );

            CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
            CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

            -- Frontend error logging table
            CREATE TABLE IF NOT EXISTS frontend_errors (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                error_type VARCHAR(50),
                message TEXT,
                stack TEXT,
                url TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_frontend_errors_created ON frontend_errors(created_at DESC);

            -- Login history table (IP + user-agent logging)
            CREATE TABLE IF NOT EXISTS login_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at DESC);

            -- Add share_code column to campaigns (migration for campaign sharing)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'campaigns' AND column_name = 'share_code') THEN
                    ALTER TABLE campaigns ADD COLUMN share_code TEXT UNIQUE;
                END IF;
            END $$;

            -- Add soft delete column for campaigns (migration for trash/restore feature)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'campaigns' AND column_name = 'deleted_at') THEN
                    ALTER TABLE campaigns ADD COLUMN deleted_at TIMESTAMP;
                END IF;
            END $$;

            -- Add soft delete column for sessions (migration for trash/restore feature)
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                               WHERE table_name = 'sessions' AND column_name = 'deleted_at') THEN
                    ALTER TABLE sessions ADD COLUMN deleted_at TIMESTAMP;
                END IF;
            END $$;

            -- Wiki system tables
            CREATE TABLE IF NOT EXISTS wiki_books (
                id SERIAL PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                cover_image TEXT,
                author_note TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_wiki_books_slug ON wiki_books(slug);
            CREATE INDEX IF NOT EXISTS idx_wiki_books_deleted ON wiki_books(deleted_at);

            CREATE TABLE IF NOT EXISTS wiki_chapters (
                id SERIAL PRIMARY KEY,
                book_id INTEGER NOT NULL REFERENCES wiki_books(id) ON DELETE CASCADE,
                slug TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                author_note TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP,
                UNIQUE(book_id, slug)
            );

            CREATE INDEX IF NOT EXISTS idx_wiki_chapters_book ON wiki_chapters(book_id);
            CREATE INDEX IF NOT EXISTS idx_wiki_chapters_deleted ON wiki_chapters(deleted_at);

            CREATE TABLE IF NOT EXISTS wiki_pages (
                id SERIAL PRIMARY KEY,
                book_id INTEGER NOT NULL REFERENCES wiki_books(id) ON DELETE CASCADE,
                chapter_id INTEGER REFERENCES wiki_chapters(id) ON DELETE SET NULL,
                slug TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                summary TEXT,
                author_note TEXT,
                tags TEXT[],
                sort_order INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP,
                UNIQUE(book_id, slug)
            );

            CREATE INDEX IF NOT EXISTS idx_wiki_pages_book ON wiki_pages(book_id);
            CREATE INDEX IF NOT EXISTS idx_wiki_pages_chapter ON wiki_pages(chapter_id);
            CREATE INDEX IF NOT EXISTS idx_wiki_pages_deleted ON wiki_pages(deleted_at);
            CREATE INDEX IF NOT EXISTS idx_wiki_pages_tags ON wiki_pages USING GIN(tags);
        `);
        console.log('Database schema initialized');
    } finally {
        client.release();
    }
}

// Database wrapper with async methods
const db = {
    pool,

    async query(text, params) {
        return pool.query(text, params);
    },

    async get(text, params) {
        const result = await pool.query(text, params);
        return result.rows[0];
    },

    async all(text, params) {
        const result = await pool.query(text, params);
        return result.rows;
    },

    async run(text, params) {
        const result = await pool.query(text, params);
        return { changes: result.rowCount, lastID: result.rows[0]?.id };
    },

    async initialize() {
        await initializeDatabase();
    }
};

module.exports = db;
