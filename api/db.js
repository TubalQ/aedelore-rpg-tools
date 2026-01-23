const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
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

            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);

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
