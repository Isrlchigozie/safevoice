const { Pool } = require('pg');
require('dotenv').config();

// Debug logging
console.log('🔧 Database config loading...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'Not set');

// Use Supabase connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: connectionString,
  // Supabase requires SSL
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10, // Adjust based on your Supabase plan
});

// Test connection on startup
pool.on('connect', (client) => {
  console.log('✅ Connected to Supabase PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
  console.error('Error details:', {
    code: err.code,
    message: err.message
  });
});

// Test function
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection test successful');
    console.log('📊 Database time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

// Run test on startup
testConnection();

module.exports = pool;