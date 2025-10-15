const { connectDB } = require('./database');

let db;

// Initialize database connection
const initDB = async () => {
  if (!db) {
    db = await connectDB();
  }
  return db;
};

module.exports = {
  // Users
  users: {
    create: async (userData) => {
      const database = await initDB();
      const result = await database.collection('users').insertOne({
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: result.insertedId.toString(), ...userData };
    },
    
    findByToken: async (anonymousToken) => {
      const database = await initDB();
      const user = await database.collection('users').findOne({ anonymous_token: anonymousToken });
      return user ? { ...user, id: user._id.toString() } : null;
    },
    
    findById: async (userId) => {
      const database = await initDB();
      const user = await database.collection('users').findOne({ _id: require('mongodb').ObjectId.createFromHexString(userId) });
      return user ? { ...user, id: user._id.toString() } : null;
    }
  },

  // Conversations
  conversations: {
    create: async (conversationData) => {
      const database = await initDB();
      const result = await database.collection('conversations').insertOne({
        ...conversationData,
        created_at: new Date(),
        updated_at: new Date(),
        is_closed: false,
        unread_count: 0,
        status: 'active'
      });
      return { id: result.insertedId.toString(), ...conversationData };
    },

    findByUserId: async (userId, onlyActive = false) => {
      const database = await initDB();
      let query = { user_id: userId };
      if (onlyActive) {
        query.is_closed = false;
      }
      
      const conversation = await database.collection('conversations')
        .find(query)
        .sort({ created_at: -1 })
        .limit(1)
        .next();
      
      return conversation ? { ...conversation, id: conversation._id.toString() } : null;
    },

    findById: async (conversationId) => {
      const database = await initDB();
      const conversation = await database.collection('conversations').findOne({ 
        _id: require('mongodb').ObjectId.createFromHexString(conversationId) 
      });
      return conversation ? { ...conversation, id: conversation._id.toString() } : null;
    },

    update: async (id, updates) => {
      const database = await initDB();
      await database.collection('conversations').updateOne(
        { _id: require('mongodb').ObjectId.createFromHexString(id) },
        { 
          $set: {
            ...updates,
            updated_at: new Date()
          }
        }
      );
    },

    getAll: async () => {
      const database = await initDB();
      const conversations = await database.collection('conversations')
        .find()
        .sort({ updated_at: -1 })
        .toArray();
      
      return conversations.map(conv => ({ ...conv, id: conv._id.toString() }));
    }
  },

  // Messages
  messages: {
    create: async (messageData) => {
      const database = await initDB();
      const result = await database.collection('messages').insertOne({
        ...messageData,
        created_at: new Date(),
        is_read: false
      });
      return { id: result.insertedId.toString(), ...messageData };
    },

    findByConversation: async (conversationId) => {
      const database = await initDB();
      const messages = await database.collection('messages')
        .find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .toArray();
      
      return messages.map(msg => ({ ...msg, id: msg._id.toString() }));
    }
  },

  // Admins
  admins: {
    create: async (adminData) => {
      const database = await initDB();
      const result = await database.collection('admins').insertOne({
        ...adminData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: result.insertedId.toString(), ...adminData };
    },

    findByEmail: async (email) => {
      const database = await initDB();
      const admin = await database.collection('admins').findOne({ email });
      return admin ? { ...admin, id: admin._id.toString() } : null;
    }
  }
};