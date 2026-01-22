#!/usr/bin/env python3
"""Migrate data from SQLite to PostgreSQL for Aedelore"""

import sqlite3
import json
import os
import subprocess
import time

SQLITE_PATH = '/opt/aedelore/api/data/aedelore.db'

def wait_for_postgres():
    """Wait for PostgreSQL to be ready"""
    print("Waiting for PostgreSQL...")
    for i in range(30):
        result = subprocess.run(
            ['docker', 'exec', 'aedelore-proffs-db', 'pg_isready', '-U', 'aedelore'],
            capture_output=True
        )
        if result.returncode == 0:
            print("PostgreSQL is ready!")
            return True
        time.sleep(1)
    print("PostgreSQL not ready after 30 seconds")
    return False

def run_psql(sql, values=None):
    """Run SQL in PostgreSQL container"""
    if values:
        # Use Python string formatting for simple cases
        for i, v in enumerate(values):
            if v is None:
                sql = sql.replace(f'${i+1}', 'NULL')
            elif isinstance(v, str):
                escaped = v.replace("'", "''")
                sql = sql.replace(f'${i+1}', f"'{escaped}'")
            elif isinstance(v, (dict, list)):
                escaped = json.dumps(v, ensure_ascii=False).replace("'", "''")
                sql = sql.replace(f'${i+1}', f"'{escaped}'")
            else:
                sql = sql.replace(f'${i+1}', str(v))

    result = subprocess.run(
        ['docker', 'exec', '-i', 'aedelore-proffs-db', 'psql', '-U', 'aedelore', '-d', 'aedelore', '-c', sql],
        capture_output=True,
        text=True
    )
    if result.returncode != 0 and 'already exists' not in result.stderr:
        print(f"SQL Error: {result.stderr}")
    return result

def main():
    if not os.path.exists(SQLITE_PATH):
        print(f"SQLite database not found at {SQLITE_PATH}")
        return

    if not wait_for_postgres():
        return

    # Connect to SQLite
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Migrate users
    print("\nMigrating users...")
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()
    for user in users:
        sql = f"""
            INSERT INTO users (id, username, password_hash, created_at)
            VALUES ({user['id']}, $1, $2, $3)
            ON CONFLICT (id) DO NOTHING
        """
        run_psql(sql, [user['username'], user['password_hash'], user['created_at']])
    print(f"  Migrated {len(users)} users")

    # Update sequence
    if users:
        run_psql(f"SELECT setval('users_id_seq', {max(u['id'] for u in users)})")

    # Migrate characters
    print("\nMigrating characters...")
    cur.execute("SELECT * FROM characters")
    characters = cur.fetchall()
    for char in characters:
        data = json.loads(char['data']) if isinstance(char['data'], str) else char['data']
        sql = f"""
            INSERT INTO characters (id, user_id, name, data, updated_at)
            VALUES ({char['id']}, {char['user_id']}, $1, $2, $3)
            ON CONFLICT (id) DO NOTHING
        """
        run_psql(sql, [char['name'], data, char['updated_at']])
    print(f"  Migrated {len(characters)} characters")

    if characters:
        run_psql(f"SELECT setval('characters_id_seq', {max(c['id'] for c in characters)})")

    # Migrate campaigns
    print("\nMigrating campaigns...")
    cur.execute("SELECT * FROM campaigns")
    campaigns = cur.fetchall()
    for camp in campaigns:
        sql = f"""
            INSERT INTO campaigns (id, user_id, name, description, created_at, updated_at)
            VALUES ({camp['id']}, {camp['user_id']}, $1, $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
        """
        run_psql(sql, [camp['name'], camp['description'] or '', camp['created_at'], camp['updated_at']])
    print(f"  Migrated {len(campaigns)} campaigns")

    if campaigns:
        run_psql(f"SELECT setval('campaigns_id_seq', {max(c['id'] for c in campaigns)})")

    # Migrate sessions
    print("\nMigrating sessions...")
    cur.execute("SELECT * FROM sessions")
    sessions = cur.fetchall()
    for sess in sessions:
        data = json.loads(sess['data']) if isinstance(sess['data'], str) else sess['data']
        sql = f"""
            INSERT INTO sessions (id, campaign_id, user_id, session_number, date, location, status, data, created_at, updated_at)
            VALUES ({sess['id']}, {sess['campaign_id']}, {sess['user_id']}, {sess['session_number']}, $1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
        """
        run_psql(sql, [
            sess['date'] or '',
            sess['location'] or '',
            sess['status'] or 'active',
            data,
            sess['created_at'],
            sess['updated_at']
        ])
    print(f"  Migrated {len(sessions)} sessions")

    if sessions:
        run_psql(f"SELECT setval('sessions_id_seq', {max(s['id'] for s in sessions)})")

    conn.close()
    print("\nMigration complete!")

if __name__ == '__main__':
    main()
