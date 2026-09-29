import sqlite3

for path in ['saamek_dev.db', 'backend/saamek_dev.db', 'test_saamek.db']:
    print(f'=== DB: {path} ===')
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        tables = [t[0] for t in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        for t in tables:
            count = cur.execute(f"SELECT COUNT(*) FROM [{t}]").fetchone()[0]
            print(f"  {t}: {count} rows")
        conn.close()
    except Exception as e:
        print(f"  Error: {e}")
