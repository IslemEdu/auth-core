# auth-core

A minimal, deeply understood auth API — built to prove correctness, not just "working".

## ✅ What’s Here
- `POST /register` — email-normalized, deduplicated, bcrypt-hashed  
- `POST /login` — rate-limited (5/15min), timing-safe, 7-day sessions  
- `GET /me` — token-validated, least-privilege (`id`, `email` only)  
- `POST /logout` — immediate, idempotent revocation  

## 🛡️ Security by Design
- **Case-insensitive emails**: `LOWER(email)` index prevents `User@Ex.com` ≠ `user@ex.com`  
- **Cryptographically strong tokens**: 32-byte hex (`crypto.randomBytes`)  
- **DB-enforced expiration**: `expires_at > NOW()` in query — no app-layer bypass  
- **Timing-safe compare**: dummy `bcrypt.compare` on missing user  
- **No secrets in repo**: `.env` excluded via `.gitignore`  

## 📦 Setup
```bash
# 1. Create DB
createdb auth_core

# 2. Create tables (psql -d auth_core)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

CREATE TABLE active_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_sessions_token ON active_sessions (token);

# 3. Run
npm install
cp .env.example .env  # fill DB credentials
npm run dev