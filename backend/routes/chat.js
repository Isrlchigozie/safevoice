const express = require('express');
const db = require('../config/mongodb');

const router = express.Router();

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