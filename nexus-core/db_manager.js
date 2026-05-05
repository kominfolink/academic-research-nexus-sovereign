const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * ZETA DATABASE MANAGER v1.0
 * Handles persistent logging for ephemeral cloud environments.
 */

class DatabaseManager {
    constructor(logPath) {
        this.logPath = logPath;
        this.useDB = !!process.env.DATABASE_URL;
        this.pool = null;

        if (this.useDB) {
            console.log('[Z374-DB] 🗄️ Database URL detected. Initializing PostgreSQL pool...');
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false } // Required for Supabase/Neon
            });
            this.initDB();
        } else {
            console.log('[Z374-DB] 📁 No database detected. Falling back to local file logging.');
        }
    }

    async initDB() {
        try {
            const client = await this.pool.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    action TEXT,
                    details JSONB
                );
            `);
            client.release();
            console.log('[Z374-DB] ✅ Database schema verified.');
        } catch (e) {
            console.error('[Z374-DB] ❌ Database initialization failed:', e.message);
            this.useDB = false;
        }
    }

    async log(action, details) {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ACTION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;

        // Always log to console
        console.log(`[AUDIT] ${action}:`, details);

        // Persistent DB Logging
        if (this.useDB) {
            try {
                await this.pool.query(
                    'INSERT INTO audit_logs (action, details) VALUES ($1, $2)',
                    [action, details]
                );
            } catch (e) {
                console.error('[Z374-DB] ⚠️ DB log failed, falling back to file:', e.message);
            }
        }

        // Local File Logging (Secondary)
        try {
            fs.appendFileSync(this.logPath, entry);
        } catch (e) {
            console.error('[Z374-DB] ⚠️ File log failed:', e.message);
        }
    }

    async getLogs(limit = 50) {
        if (this.useDB) {
            try {
                const res = await this.pool.query(
                    'SELECT timestamp, action, details FROM audit_logs ORDER BY timestamp DESC LIMIT $1',
                    [limit]
                );
                return res.rows.map(row => 
                    `[${row.timestamp.toISOString()}] ACTION: ${row.action} | DETAILS: ${JSON.stringify(row.details)}`
                );
            } catch (e) {
                console.error('[Z374-DB] ⚠️ DB fetch failed:', e.message);
            }
        }

        // Fallback to file
        if (!fs.existsSync(this.logPath)) return [];
        return fs.readFileSync(this.logPath, 'utf8')
            .split('\n')
            .filter(l => l)
            .reverse()
            .slice(0, limit);
    }

    async purge() {
        if (this.useDB) {
            try {
                await this.pool.query('DELETE FROM audit_logs');
            } catch (e) {
                console.error('[Z374-DB] ⚠️ DB purge failed:', e.message);
            }
        }
        fs.writeFileSync(this.logPath, `[${new Date().toISOString()}] AUDIT_PURGE: Log cleared by operator.\n`);
    }
}

module.exports = DatabaseManager;
