const { MongoClient } = require('mongodb');

console.log('🔧 Loading MongoDB configuration...');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is missing!');
  throw new Error('MONGODB_URI environment variable is required');
}

console.log('✅ MongoDB URI found');

// Fix SSL connection issues
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Simple connection function
async function connectDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    const db = client.db('safevoice');
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

module.exports = { connectDB };