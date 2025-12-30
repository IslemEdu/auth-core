
const fetch = require('node-fetch');  
const logger = require('../middleware/logger'); 

const ingestEvent = async (event) => {
  try {
    await fetch('http://localhost:4000/log', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (err) {
    logger.warn({ err }, 'event: ingest failed');
  }
};

module.exports = { ingestEvent };