const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const fs = require('fs');

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'video/mp4': true,
    'video/quicktime': true,
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/ogg': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { conversationId, messageType, anonymousToken, isAdminMessage } = req.body;
    
    if (!conversationId) {
      // Clean up uploaded file if no conversation ID
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Verify conversation access (similar to your existing message logic)
    let conversationQuery;
    let queryParams;

    if (isAdminMessage === 'true') {
      conversationQuery = 'SELECT c.* FROM conversations c WHERE c.id = $1';
      queryParams = [conversationId];
    } else {
      conversationQuery = `
        SELECT c.* FROM conversations c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = $1 AND u.anonymous_token = $2
      `;
      queryParams = [conversationId, anonymousToken];
    }

    const conversationResult = await pool.query(conversationQuery, queryParams);

    if (conversationResult.rows.length === 0) {
      // Clean up uploaded file if conversation doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Determine message type based on file type
    let finalMessageType = messageType || 'file';
    if (!messageType) {
      if (req.file.mimetype.startsWith('image/')) finalMessageType = 'image';
      else if (req.file.mimetype.startsWith('video/')) finalMessageType = 'video';
      else if (req.file.mimetype.startsWith('audio/')) finalMessageType = 'audio';
    }

    // Save message to database
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, content, is_admin_message, message_type, media_url, file_name, file_size, mime_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        conversationId,
        req.file.originalname, // Use filename as content for media messages
        isAdminMessage === 'true',
        finalMessageType,
        `/api/uploads/files/${req.file.filename}`,
        req.file.originalname,
        req.file.size,
        req.file.mimetype
      ]
    );

    const savedMessage = messageResult.rows[0];

    // Update conversation
    await pool.query(
      `UPDATE conversations 
       SET last_message = $1, updated_at = CURRENT_TIMESTAMP, unread_count = CASE WHEN $2 = true THEN 0 ELSE unread_count END 
       WHERE id = $3`,
      [`Sent a ${finalMessageType}`, isAdminMessage === 'true', conversationId]
    );

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(conversationId).emit('receive_message', savedMessage);
      
      if (!isAdminMessage || isAdminMessage === 'false') {
        io.to(`admin_room_1`).emit('conversation_updated', {
          conversationId: conversationId,
          lastMessage: `Sent a ${finalMessageType}`,
          anonymousToken: anonymousToken,
          hasMessages: true
        });
      }
    }

    res.json(savedMessage);

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

// Serve uploaded files with security headers
router.use('/files', (req, res, next) => {
  // Prevent execution of uploaded files
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  next();
}, express.static('uploads'));

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

module.exports = router;