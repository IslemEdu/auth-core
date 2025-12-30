
const pino = require('pino');
const crypto = require('crypto');

const logger = pino({
  level: 'info',
  base: { pid: process.pid },
  timestamp: () => `,"time":"${new Date().toISOString()}"`, // ← quotes around time!
  redact: ['req.headers.authorization', 'req.body.password']
});

module.exports = logger;
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const traceId = req.headers['x-trace-id']?req.headers['x-trace-id']:crypto.randomBytes(8).toString('hex');
  req.traceId = traceId;

  res.on('finish', () => {
    logger.info({
      traceId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      user_id: req.user?.id
    }, 'request');
  });

  next();
};
module.exports={logger,requestLogger}