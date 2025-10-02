const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/uploads'); // NEW: Import upload routes

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://safevoice2.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

// Track connected users for real online status
const connectedUsers = new Map();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://safevoice2.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('socketio', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes); // NEW: Add upload routes

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as time, version() as version');
    
    res.json({ 
      status: 'OK', 
      database: 'Connected to Supabase',
      timestamp: new Date().toISOString(),
      dbTime: result.rows[0].time,
      version: result.rows[0].version
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected from Supabase',
      error: error.message,
      connectionString: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set'
    });
  }
});

// Basic route to test if server works
app.get('/', (req, res) => {
  res.json({ message: 'SafeVoice Backend is running!' });
});

// Socket.io for real-time messaging and online status tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins a conversation with proper online tracking
  socket.on('join_conversation', async (conversationData) => {
    try {
      const { conversationId, anonymousToken } = conversationData;
      
      if (!conversationId) {
        console.log('No conversationId provided');
        return;
      }

      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);

      // Track this user as online if they have an anonymous token (real user, not admin)
      if (anonymousToken) {
        const pool = require('./config/database');
        
        // Get user details from database
        const userResult = await pool.query(
          'SELECT u.*, c.id as conversation_id FROM users u JOIN conversations c ON u.id = c.user_id WHERE u.anonymous_token = $1 AND c.id = $2',
          [anonymousToken, conversationId]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          
          connectedUsers.set(anonymousToken, {
            socketId: socket.id,
            conversationId: conversationId,
            anonymousToken: anonymousToken,
            lastActive: new Date(),
            isOnline: true
          });

          // Notify admin room that user is online
          socket.to(`admin_room_1`).emit('user_online', {
            conversationId: conversationId,
            anonymousToken: anonymousToken
          });

          console.log(`User ${anonymousToken} is now online in conversation ${conversationId}`);
        }
      } else {
        // This is likely an admin joining
        console.log('Admin joined conversation:', conversationId);
      }
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  });

  // Admin joins admin room for notifications
  socket.on('join_admin_room', (organizationId) => {
    const adminRoom = `admin_room_${organizationId || 1}`;
    socket.join(adminRoom);
    console.log(`Admin joined room: ${adminRoom}`);
  });

  // Send message with proper online status handling
  socket.on('send_message', async (data) => {
    try {
      console.log('Socket received message:', data);
      
      // If user sends a message, they are definitely online
      if (data.anonymousToken && !data.is_admin_message) {
        const userData = connectedUsers.get(data.anonymousToken);
        if (userData) {
          userData.lastActive = new Date();
          userData.isOnline = true;
          connectedUsers.set(data.anonymousToken, userData);
        }

        // Notify admin that user is active
        socket.to(`admin_room_1`).emit('user_online', {
          conversationId: data.conversationId,
          anonymousToken: data.anonymousToken
        });
      }

      // Broadcast to everyone in the conversation room
      socket.to(data.conversationId).emit('receive_message', data);
      console.log(`Message broadcast to conversation: ${data.conversationId}`);
      
      // Also send back to sender for confirmation
      socket.emit('message_sent', data);

      // Emit conversation update for admin dashboard
      if (!data.is_admin_message) {
        socket.to(`admin_room_1`).emit('conversation_updated', {
          conversationId: data.conversationId,
          lastMessage: data.content,
          anonymousToken: data.anonymousToken,
          hasMessages: true
        });
      }
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // New conversation started
  socket.on('new_conversation', (data) => {
    const adminRoom = `admin_room_${data.organizationId || 1}`;
    
    // Only notify admin if there's an actual message, not just conversation start
    if (data.hasMessages) {
      socket.to(adminRoom).emit('conversation_created', {
        conversationId: data.conversationId,
        anonymousToken: data.anonymousToken,
        createdAt: data.createdAt,
        lastMessage: data.lastMessage,
        hasMessages: true
      });
      console.log(`New conversation notification sent to: ${adminRoom}`);
    }
  });

  // User heartbeat - they are still active
  socket.on('user_heartbeat', (data) => {
    if (data.anonymousToken && connectedUsers.has(data.anonymousToken)) {
      const userData = connectedUsers.get(data.anonymousToken);
      userData.lastActive = new Date();
      userData.isOnline = true;
      connectedUsers.set(data.anonymousToken, userData);
      
      console.log(`Heartbeat from user ${data.anonymousToken}`);
    }
  });

  // Message read receipts
  socket.on('message_read', async (data) => {
    try {
      const pool = require('./config/database');
      
      // Update message as read in database
      await pool.query(
        'UPDATE messages SET is_read = TRUE, read_at = $1 WHERE id = $2',
        [data.readAt, data.messageId]
      );

      // Notify the other user that their message was read
      socket.to(data.conversationId).emit('message_read', {
        messageId: data.messageId,
        readAt: data.readAt
      });

      console.log(`Message ${data.messageId} marked as read`);
    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    console.log('Typing started in conversation:', data.conversationId);
    socket.to(data.conversationId).emit('user_typing', data);
  });

  socket.on('typing_stop', (data) => {
    console.log('Typing stopped in conversation:', data.conversationId);
    socket.to(data.conversationId).emit('user_stop_typing', data);
  });

  // Handle user disconnection - mark as offline
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and mark this user as offline
    for (let [token, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        userData.isOnline = false;
        connectedUsers.set(token, userData);
        
        // Notify admin that user went offline
        socket.to(`admin_room_1`).emit('user_offline', {
          conversationId: userData.conversationId,
          anonymousToken: token
        });
        
        console.log(`User ${token} went offline`);
        break;
      }
    }
  });

  // User activity tracking
  socket.on('user_activity', (data) => {
    if (data.anonymousToken) {
      const userData = connectedUsers.get(data.anonymousToken);
      if (userData) {
        userData.lastActive = new Date();
        userData.isOnline = data.isOnline;
        connectedUsers.set(data.anonymousToken, userData);

        // Notify admin of status change
        if (data.isOnline) {
          socket.to(`admin_room_1`).emit('user_online', {
            conversationId: data.conversationId,
            anonymousToken: data.anonymousToken
          });
        } else {
          socket.to(`admin_room_1`).emit('user_offline', {
            conversationId: data.conversationId,
            anonymousToken: data.anonymousToken
          });
        }
      }
    }
  });
});

// Cleanup disconnected users periodically
setInterval(() => {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  for (let [token, userData] of connectedUsers.entries()) {
    if (userData.lastActive < twoMinutesAgo && userData.isOnline) {
      userData.isOnline = false;
      connectedUsers.set(token, userData);
      
      // Notify admin
      io.to(`admin_room_1`).emit('user_offline', {
        conversationId: userData.conversationId,
        anonymousToken: token
      });
      
      console.log(`User ${token} marked as offline due to inactivity`);
    }
  }
}, 30000); // Check every 30 seconds

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ SafeVoice Server running on port ${PORT}`);
  console.log(`📊 Connected users tracking: Active`);
  console.log(`🔗 CORS enabled for: http://localhost:3000`);
  console.log(`📁 File uploads enabled: /api/uploads`); // NEW: Log upload feature
});

module.exports = { app, io, connectedUsers };