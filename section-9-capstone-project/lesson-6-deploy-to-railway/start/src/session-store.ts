import { Database } from "bun:sqlite"

export class SessionStore {
  private db: Database

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        thread_key TEXT PRIMARY KEY,
        session_id TEXT NOT NULL
      )
    `)
  }

  get(threadKey: string): string | null {
    const row = this.db
      .query("SELECT session_id FROM sessions WHERE thread_key = ?")
      .get(threadKey) as { session_id: string } | null
    return row?.session_id ?? null
  }

  set(threadKey: string, sessionId: string): void {
    this.db
      .query(
        `INSERT INTO sessions (thread_key, session_id)
         VALUES (?, ?)
         ON CONFLICT(thread_key) DO UPDATE SET session_id = excluded.session_id`
      )
      .run(threadKey, sessionId)
  }

  delete(threadKey: string): void {
    this.db
      .query("DELETE FROM sessions WHERE thread_key = ?")
      .run(threadKey)
  }
}
