const express = require('express');
const register = require('./routes/register');
const login = require('./routes/login');
const me = require('./routes/me');
const logout = require('./routes/logout');
const pool = require('./db/pool');
const authenticate = require('./middleware/authenticate');
const { requestLogger } = require('./middleware/logger');
const { checkDB, checkSessions, checkRateLimit } = require('./health');
const { cleanupExpiredSessions } = require('./cleanup');
const logger = require('./middleware/logger');

const app = express();


const CLEANUP_INTERVAL = 5 * 60 * 1000;
const cleanupJob = setInterval(async () => {
  const result = await cleanupExpiredSessions();
  if (!result.ok) {
    logger.error({ err: result.error }, '[CLEANUP] Failed');
  } else if (result.deleted > 0) {
    logger.info({ deleted: result.deleted, latency_ms: result.latency_ms }, '[CLEANUP] sessions removed');
  }
}, CLEANUP_INTERVAL);


process.on('SIGTERM', () => {
  clearInterval(cleanupJob);
  process.exit(0);
});


cleanupExpiredSessions().catch(err => {
  logger.error({ err }, '[CLEANUP] Startup failed');
});

// Middleware & routes
app.use(requestLogger);
app.use(express.json());

app.post('/register', register);
app.post('/login', login);
app.get('/me', authenticate, me);
app.post('/logout', authenticate, logout);

app.get('/health', async (req, res) => {
  const [db, sessions, rateLimit] = await Promise.all([
    checkDB(),
    checkSessions(),
    Promise.resolve(checkRateLimit())
  ]);

  const status = db.ok && sessions.ok && rateLimit.ok ? 'ok' : 'degraded';
  const code = status === 'ok' ? 200 : 503;
  res.status(code).json({
    status,
    timestamp: new Date().toISOString(),
    db,
    sessions,
    rateLimit
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});