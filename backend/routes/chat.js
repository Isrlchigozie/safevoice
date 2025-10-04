const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Start new conversation
router.post('/conversations/start', async (req, res) => {
  try {
    // Generate anonymous token
    const anonymousToken = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // Create anonymous user
    const user = await db.users.create({
      anonymous_token: anonymousToken
    });

    // Create conversation
    const conversation = await db.conversations.create({
      user_id: user.id,
      last_message: '',
      organization_id: 1
    });

    res.json({
      anonymousToken: user.anonymous_token,
      conversationId: conversation.id,
      message: 'Conversation started successfully'
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await db.messages.findByConversation(id);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isAdminMessage = false, anonymousToken } = req.body;

    // Create message
    const message = await db.messages.create({
      conversation_id: id,
      content: content,
      is_admin_message: isAdminMessage
    });

    // Update conversation
    await db.conversations.update(id, {
      last_message: content
    });

    res.json(message);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
