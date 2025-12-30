const fetch = require('node-fetch');
const { logger } = require('../middleware/logger');

const ingestMetrics = async (serviceName, metrics) => {
  try {
    await fetch('http://localhost:4001/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_name: serviceName, metrics })
    });
  } catch (err) {
    logger.warn({ err }, `metrics: ${serviceName} ingest failed`);
  }
};

module.exports = { ingestMetrics };