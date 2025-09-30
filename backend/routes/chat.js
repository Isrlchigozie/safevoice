const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Start new conversation (anonymous user)
router.post('/conversations/start', async (req, res) => {
  try {
    // Generate anonymous token
    const anonymousToken = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // Create anonymous user
    const userResult = await pool.query(
      'INSERT INTO users (anonymous_token) VALUES ($1) RETURNING *',
      [anonymousToken]
    );

    const user = userResult.rows[0];

    // Create conversation
    const conversationResult = await pool.query(
      'INSERT INTO conversations (user_id, last_message, unread_count, is_closed) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.id, '', 0, false]
    );

    const conversation = conversationResult.rows[0];

    // NOTE: Do NOT emit conversation_created here because there are no messages yet.
    // Admin dashboard filters out empty conversations; we'll emit when the first real message appears.

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

// Get conversations for admin
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await pool.query(`
      SELECT c.*, u.anonymous_token 
      FROM conversations c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.organization_id = 1 
      ORDER BY c.updated_at DESC
    `);

    res.json(conversations.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json(messages.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close conversation
router.put('/conversations/:id/close', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE conversations SET is_closed = TRUE, closed_at = CURRENT_TIMESTAMP, status = $1 WHERE id = $2',
      ['closed', id]
    );

    res.json({ message: 'Conversation closed successfully' });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read (admin)
router.put('/conversations/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE messages SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND is_admin_message = FALSE',
      [id]
    );

    // Reset unread count on conversation
    await pool.query(
      'UPDATE conversations SET unread_count = 0 WHERE id = $1',
      [id]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send Message 
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isAdminMessage = false, anonymousToken } = req.body;

    console.log('Received message request:', { id, content, isAdminMessage, anonymousToken });

    // Basic validation
    if (!content && content !== '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify conversation exists and user has access
    let conversationQuery;
    let queryParams;

    if (isAdminMessage) {
      conversationQuery = 'SELECT c.* FROM conversations c WHERE c.id = $1';
      queryParams = [id];
    } else {
      conversationQuery = `
        SELECT c.*, u.anonymous_token FROM conversations c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = $1 AND u.anonymous_token = $2
      `;
      queryParams = [id, anonymousToken];
    }

    const conversationResult = await pool.query(conversationQuery, queryParams);

    if (conversationResult.rows.length === 0) {
      console.log('Conversation not found or access denied');
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Insert message
    const messageResult = await pool.query(
      'INSERT INTO messages (conversation_id, content, is_admin_message) VALUES ($1, $2, $3) RETURNING *',
      [id, content, isAdminMessage]
    );

    const savedMessage = messageResult.rows[0];

    // Update conversation last_message, updated_at, and unread_count
    if (isAdminMessage) {
      // Admin sent a message: reset unread_count for admin->user flow
      await pool.query(
        `UPDATE conversations 
         SET last_message = $1, updated_at = CURRENT_TIMESTAMP, unread_count = 0 
         WHERE id = $2`,
        [content, id]
      );
    } else {
      // User sent a message: increment unread_count so admin sees it
      // Also set last_message
      await pool.query(
        `UPDATE conversations 
         SET last_message = $1, updated_at = CURRENT_TIMESTAMP, unread_count = COALESCE(unread_count, 0) + 1 
         WHERE id = $2`,
        [content, id]
      );
    }

    // Emit socket events to keep admin dashboard in sync
    const io = req.app.get('socketio');
    if (io) {
      // Notify conversation room (so admin or user in the room receives the message)
      io.to(id.toString()).emit('receive_message', savedMessage);

      // If this is a user message, notify admins about conversation update (so admin dashboard shows it)
      if (!isAdminMessage) {
        io.to(`admin_room_1`).emit('conversation_updated', {
          conversationId: parseInt(id, 10),
          lastMessage: content,
          anonymousToken: anonymousToken || null,
          hasMessages: true
        });

        // If conversation previously had no last_message, also send a creation-style event to admins
        // (the admin client filters by last_message value on fetch, but for real-time ensure admin sees it)
        // We'll check the conversation row to see if last_message was empty before (best-effort)
        try {
          const convoCheck = await pool.query('SELECT last_message FROM conversations WHERE id = $1', [id]);
          const prevLast = convoCheck.rows[0]?.last_message;
          if (!prevLast || prevLast.trim() === '') {
            io.to(`admin_room_1`).emit('conversation_created', {
              conversationId: parseInt(id, 10),
              organizationId: 1,
              anonymousToken: anonymousToken || null,
              createdAt: new Date().toISOString(),
              lastMessage: content,
              hasMessages: true
            });
          }
        } catch (err) {
          // If we can't check, it's not fatal — admins will get the conversation_updated event
          console.warn('Could not check previous last_message:', err.message);
        }
      } else {
        // Admin message: notify conversation room and admins if needed
        io.to(`admin_room_1`).emit('conversation_updated', {
          conversationId: parseInt(id, 10),
          lastMessage: content,
          anonymousToken: null,
          hasMessages: true
        });
      }
    }

    console.log('Message saved successfully:', savedMessage);

    res.json(savedMessage);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark individual message as read
router.put('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE messages SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume previous conversation (by anonymousToken)
router.post('/conversations/resume', async (req, res) => {
  try {
    const { anonymousToken } = req.body;

    if (!anonymousToken) {
      return res.status(400).json({ error: 'Anonymous token is required' });
    }

    // Find user by anonymous token
    const userResult = await pool.query(
      'SELECT * FROM users WHERE anonymous_token = $1',
      [anonymousToken]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid anonymous ID' });
    }

    const user = userResult.rows[0];

    // First try to find an active (not closed) conversation
    let conversationResult = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 AND is_closed = FALSE ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    // If none found, fallback to latest conversation (closed or open)
    if (conversationResult.rows.length === 0) {
      conversationResult = await pool.query(
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
    }

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ error: 'No conversation found for this ID' });
    }

    const conversation = conversationResult.rows[0];

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

module.exports = router;