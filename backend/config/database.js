const { MongoClient, ObjectId } = require('mongodb');

console.log('🔧 Connecting to MongoDB...');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('safevoice');
    console.log('✅ MongoDB connected successfully');
    
    // Create collections if they don't exist
    await db.createCollection('users');
    await db.createCollection('conversations');
    await db.createCollection('messages');
    await db.createCollection('admins');
    
    // Create indexes
    await db.collection('users').createIndex({ anonymous_token: 1 }, { unique: true });
    await db.collection('conversations').createIndex({ user_id: 1 });
    await db.collection('messages').createIndex({ conversation_id: 1 });
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ Database collections and indexes created');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Initialize connection
connectDB();

module.exports = {
  db: () => db,
  ObjectId,
  
  // Collection helpers
  users: () => db.collection('users'),
  conversations: () => db.collection('conversations'),
  messages: () => db.collection('messages'),
  admins: () => db.collection('admins')
};