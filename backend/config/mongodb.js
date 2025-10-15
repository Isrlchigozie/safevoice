const { db, ObjectId } = require('./database');

// Helper to convert to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  try {
    return typeof id === 'string' ? new ObjectId(id) : id;
  } catch {
    return null;
  }
};

module.exports = {
  // Users
  users: {
    create: async (userData) => {
      const result = await db().users().insertOne({
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: result.insertedId, ...userData };
    },
    
    findByToken: async (anonymousToken) => {
      return await db().users().findOne({ anonymous_token: anonymousToken });
    },
    
    findById: async (userId) => {
      return await db().users().findOne({ _id: toObjectId(userId) });
    }
  },

  // Conversations
  conversations: {
    create: async (conversationData) => {
      const result = await db().conversations().insertOne({
        ...conversationData,
        is_closed: false,
        unread_count: 0,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: result.insertedId, ...conversationData };
    },

    findByUserId: async (userId, onlyActive = false) => {
      let query = { user_id: userId };
      if (onlyActive) {
        query.is_closed = false;
      }
      
      return await db().conversations().find(query)
        .sort({ created_at: -1 })
        .limit(1)
        .next();
    },

    findById: async (conversationId) => {
      return await db().conversations().findOne({ _id: toObjectId(conversationId) });
    },

    update: async (id, updates) => {
      await db().conversations().updateOne(
        { _id: toObjectId(id) },
        { 
          $set: {
            ...updates,
            updated_at: new Date()
          }
        }
      );
    },

    getAll: async () => {
      return await db().conversations()
        .find()
        .sort({ updated_at: -1 })
        .toArray();
    }
  },

  // Messages
  messages: {
    create: async (messageData) => {
      const result = await db().messages().insertOne({
        ...messageData,
        is_read: false,
        created_at: new Date()
      });
      return { id: result.insertedId, ...messageData };
    },

    findByConversation: async (conversationId) => {
      return await db().messages()
        .find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .toArray();
    },

    update: async (id, updates) => {
      await db().messages().updateOne(
        { _id: toObjectId(id) },
        { $set: updates }
      );
    },

    markConversationRead: async (conversationId) => {
      await db().messages().updateMany(
        { 
          conversation_id: conversationId,
          is_admin_message: false,
          is_read: false
        },
        { 
          $set: { 
            is_read: true, 
            read_at: new Date() 
          } 
        }
      );
    }
  },

  // Admins
  admins: {
    create: async (adminData) => {
      const result = await db().admins().insertOne({
        ...adminData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return { id: result.insertedId, ...adminData };
    },

    findByEmail: async (email) => {
      return await db().admins().findOne({ email });
    },

    update: async (id, updates) => {
      await db().admins().updateOne(
        { _id: toObjectId(id) },
        { 
          $set: {
            ...updates,
            updated_at: new Date()
          }
        }
      );
    }
  }
};