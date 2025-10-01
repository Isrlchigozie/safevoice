const { Pool } = require('pg');
const { connectionString } = require('pg/lib/defaults');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;