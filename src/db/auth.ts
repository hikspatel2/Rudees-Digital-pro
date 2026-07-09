import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'auth.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
  );
  
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
}

export const authenticate = (username: string, passwordPlain: string): string | null => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { password_hash: string } | undefined;
  if (!user) return null;
  
  if (bcrypt.compareSync(passwordPlain, user.password_hash)) {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (token, username) VALUES (?, ?)').run(token, username);
    return token;
  }
  return null;
}

export const verifySession = (token: string): string | null => {
  const session = db.prepare('SELECT username FROM sessions WHERE token = ?').get(token) as { username: string } | undefined;
  return session ? session.username : null;
}

export const destroySession = (token: string) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export const updatePassword = (username: string, newPasswordPlain: string) => {
  const hash = bcrypt.hashSync(newPasswordPlain, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
}
