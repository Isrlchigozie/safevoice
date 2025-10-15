const { MongoClient } = require('mongodb');

console.log('🔧 Loading MongoDB configuration...');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is missing!');
  throw new Error('MONGODB_URI environment variable is required');
}

console.log('✅ MongoDB URI found');

const client = new MongoClient(uri);

// Simple connection function
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('safevoice');
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDB };