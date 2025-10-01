const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing!");
} else {
  console.log("✅ DATABASE-URL found");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

module.exports = pool;