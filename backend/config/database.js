const { db } = require('./firebase');

// Collection references
const usersCollection = db.collection('users');
const conversationsCollection = db.collection('conversations');
const messagesCollection = db.collection('messages');
const adminsCollection = db.collection('admins');

// Helper functions
const generateId = () => db.collection('temp').doc().id;
const getTimestamp = () => new Date();

module.exports = {
  // Users
  users: {
    create: async (userData) => {
      const id = generateId();
      const user = {
        id,
        ...userData,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      };
      await usersCollection.doc(id).set(user);
      return user;
    },
    
    findByToken: async (anonymousToken) => {
      const snapshot = await usersCollection
        .where('anonymous_token', '==', anonymousToken)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    },
    
    findById: async (userId) => {
      const doc = await usersCollection.doc(userId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
  },

  // Conversations
  conversations: {
    create: async (conversationData) => {
      const id = generateId();
      const conversation = {
        id,
        ...conversationData,
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
        is_closed: false,
        unread_count: 0,
        status: 'active'
      };
      await conversationsCollection.doc(id).set(conversation);
      return conversation;
    },

    findByUserId: async (userId, onlyActive = false) => {
      let query = conversationsCollection.where('user_id', '==', userId);
      
      if (onlyActive) {
        query = query.where('is_closed', '==', false);
      }
      
      const snapshot = await query.orderBy('created_at', 'desc').limit(1).get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    },

    findById: async (conversationId) => {
      const doc = await conversationsCollection.doc(conversationId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    },

    update: async (id, updates) => {
      await conversationsCollection.doc(id).update({
        ...updates,
        updated_at: getTimestamp()
      });
    },

    getAll: async () => {
      const snapshot = await conversationsCollection
        .orderBy('updated_at', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  // Messages
  messages: {
    create: async (messageData) => {
      const id = generateId();
      const message = {
        id,
        ...messageData,
        created_at: getTimestamp(),
        is_read: false
      };
      await messagesCollection.doc(id).set(message);
      return message;
    },

    findByConversation: async (conversationId) => {
      const snapshot = await messagesCollection
        .where('conversation_id', '==', conversationId)
        .orderBy('created_at', 'asc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    update: async (id, updates) => {
      await messagesCollection.doc(id).update(updates);
    }
  },

  // Admins
  admins: {
    create: async (adminData) => {
      const id = generateId();
      const admin = {
        id,
        ...adminData,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      };
      await adminsCollection.doc(id).set(admin);
      return admin;
    },

    findByEmail: async (email) => {
      const snapshot = await adminsCollection
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    },

    update: async (id, updates) => {
      await adminsCollection.doc(id).update({
        ...updates,
        updated_at: getTimestamp()
      });
    }
  }
};