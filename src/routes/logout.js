const pool = require('../db/pool');
const logger=require('../middleware/logger')

module.exports = async (req, res) => {
  try {
    await pool.query('DELETE FROM active_sessions WHERE token = $1', [req.token]);
    res.json({ message: 'Logged out' });
  } catch (err) {
    logger.error('Logout DB error:', err);
    res.status(500).json({ error: 'logout failed' });
  }
};