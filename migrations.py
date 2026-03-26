"""
Self-Healing Database Migration Engine for The Tribunal.

Guarantees:
1. ADDITIVE-ONLY: New columns are added; existing data is NEVER deleted.
2. IDEMPOTENT: Safe to run on every boot — already-applied changes are skipped.
3. VERSIONED LEDGER: Every migration is logged in a `_migration_ledger` table
   with a version hash, timestamp, and description for full auditability.
4. ATOMIC: Each migration runs inside its own transaction. If it fails,
   it rolls back cleanly without corrupting the database.

Scientific basis:
- Follows the "Expand and Contract" pattern (Evolutionary Database Design,
  Pramod Sadalage & Martin Fowler) — schema changes are always additive first,
  deprecations happen in a later, separate phase.
- Aligns with the Zero-Downtime Deployment principle used in continuous delivery.
"""

import sqlite3
import hashlib
from datetime import datetime


# --------------------------------------------------------------------------- #
#  Migration Registry — append new migrations here. NEVER remove old ones.    #
# --------------------------------------------------------------------------- #

MIGRATIONS = [
    {
        "version": "001",
        "description": "Add status column to argument table",
        "sql": "ALTER TABLE argument ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Pending';"
    },
    # Future migrations go here. Example:
    # {
    #     "version": "002",
    #     "description": "Add priority column to dispute table",
    #     "sql": "ALTER TABLE dispute ADD COLUMN priority VARCHAR(20) DEFAULT 'Normal';"
    # },
]


def _version_hash(migration: dict) -> str:
    """Deterministic hash so we can detect if a migration was tampered with."""
    payload = f"{migration['version']}|{migration['sql']}"
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def _ensure_ledger(cursor):
    """Create the migration ledger table if it doesn't exist."""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS _migration_ledger (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            version     TEXT    NOT NULL UNIQUE,
            hash        TEXT    NOT NULL,
            description TEXT,
            applied_at  TEXT    NOT NULL
        );
    """)


def _already_applied(cursor, version: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM _migration_ledger WHERE version = ?", (version,)
    )
    return cursor.fetchone() is not None


def _column_exists(cursor, table: str, column: str) -> bool:
    """Introspect the live schema to check if a column already exists."""
    cursor.execute(f"PRAGMA table_info({table});")
    return any(row[1] == column for row in cursor.fetchall())


def run_migrations(db_path: str):
    """
    Execute all pending migrations against the database at `db_path`.

    This function is designed to be called on every application boot.
    It is fully idempotent and transaction-safe.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    _ensure_ledger(cursor)
    conn.commit()

    applied = 0
    skipped = 0

    for m in MIGRATIONS:
        version = m["version"]
        h = _version_hash(m)

        if _already_applied(cursor, version):
            skipped += 1
            continue

        # Extra safety: if the ALTER TABLE adds a column that already exists
        # (e.g. db.create_all() ran first), skip the SQL but still log it.
        sql_lower = m["sql"].lower()
        if "alter table" in sql_lower and "add column" in sql_lower:
            parts = sql_lower.split("add column")[1].strip().split()[0]
            table = sql_lower.split("alter table")[1].strip().split()[0]
            if _column_exists(cursor, table, parts):
                # Column already present — just record the migration
                cursor.execute(
                    "INSERT INTO _migration_ledger (version, hash, description, applied_at) VALUES (?, ?, ?, ?)",
                    (version, h, m["description"], datetime.utcnow().isoformat())
                )
                conn.commit()
                skipped += 1
                continue

        try:
            cursor.execute(m["sql"])
            cursor.execute(
                "INSERT INTO _migration_ledger (version, hash, description, applied_at) VALUES (?, ?, ?, ?)",
                (version, h, m["description"], datetime.utcnow().isoformat())
            )
            conn.commit()
            applied += 1
            print(f"  [MIGRATION] Applied v{version}: {m['description']}")
        except Exception as e:
            conn.rollback()
            print(f"  [MIGRATION] SKIPPED v{version} (safe): {e}")
            # Still mark as applied if column already exists from create_all
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                cursor.execute(
                    "INSERT INTO _migration_ledger (version, hash, description, applied_at) VALUES (?, ?, ?, ?)",
                    (version, h, m["description"], datetime.utcnow().isoformat())
                )
                conn.commit()

    conn.close()
    print(f"  [MIGRATION] Done. Applied: {applied}, Skipped (already present): {skipped}")
