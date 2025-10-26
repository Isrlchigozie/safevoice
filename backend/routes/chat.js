const express = require('express');
const db = require('../config/mongodb');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Start new conversation
router.post('/conversations/start', async (req, res) => {
  console.log('🔄 Starting conversation...');
  
  try {
    // Generate anonymous token
    const anonymousToken = 'user_' + Math.random().toString(36).substr(2, 9);
    console.log('📝 Generated token:', anonymousToken);
    
    // Create anonymous user
    const user = await db.users.create({
      anonymous_token: anonymousToken
    });
    console.log('✅ User created:', user.id);

    // Create conversation
    const conversation = await db.conversations.create({
      user_id: user.id,
      last_message: '',
      organization_id: 1
    });
    console.log('✅ Conversation created:', conversation.id);

    res.json({
      anonymousToken: user.anonymous_token,
      conversationId: conversation.id,
      message: 'Conversation started successfully'
    });

  } catch (error) {
    console.error('❌ Start conversation error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get all conversations (for admin)
router.get('/conversations', verifyAdmin, async (req, res) => {
  try {
    const conversations = await db.conversations.getAll();
    
    // Enrich with user data
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await db.users.findById(conv.user_id);
        return {
          ...conv,
          anonymous_token: user?.anonymous_token || 'unknown'
        };
      })
    );

    res.json(enrichedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await db.messages.findByConversation(conversationId);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, isAdminMessage, anonymousToken } = req.body;

    // Verify conversation exists
    const conversation = await db.conversations.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const message = await db.messages.create({
      conversation_id: conversationId,
      content: content,
      is_admin_message: isAdminMessage,
      message_type: 'text',
      created_at: new Date()
    });

    // Update conversation
    await db.conversations.update(conversationId, {
      last_message: content.substring(0, 100),
      unread_count: isAdminMessage ? 0 : (conversation.unread_count || 0) + 1
    });

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark conversation as read (for admin)
router.put('/conversations/:conversationId/mark-read', verifyAdmin, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await db.conversations.update(conversationId, {
      unread_count: 0
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const { connectDB } = require('../config/database');
    const database = await connectDB();
    
    await database.collection('messages').updateOne(
      { _id: require('mongodb').ObjectId.createFromHexString(messageId) },
      { 
        $set: { 
          is_read: true,
          read_at: new Date()
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Resume conversation route
router.post('/conversations/resume', async (req, res) => {
  try {
    const { anonymousToken } = req.body;
    
    if (!anonymousToken) {
      return res.status(400).json({ error: 'Anonymous token is required' });
    }

    // Find user by token
    const user = await db.users.findByToken(anonymousToken);
    if (!user) {
      return res.status(404).json({ error: 'Invalid anonymous ID' });
    }

    // Find conversation
    let conversation = await db.conversations.findByUserId(user.id, true);
    if (!conversation) {
      conversation = await db.conversations.findByUserId(user.id, false);
    }

    if (!conversation) {
      return res.status(404).json({ error: 'No conversation found' });
    }

    res.json({
      anonymousToken: user.anonymous_token,
      conversationId: conversation.id,
      message: 'Conversation resumed successfully'
    });

  } catch (error) {
    console.error('Resume conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple health check
router.get('/health', async (req, res) => {
  try {
    // Just test if we can access the database
    await db.users.findByToken('test');
    res.json({ status: 'Chat routes are working', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Database error', error: error.message });
  }
});

module.exports = router;