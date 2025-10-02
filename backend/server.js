const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/uploads');

const app = express();
const server = http.createServer(app);

// Vercel-compatible Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://safevoice2.vercel.app",
      "https://safevoice2-git-main-isrlchigozies-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Vercel-specific optimizations
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Track connected users
const connectedUsers = new Map();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://safevoice2.vercel.app",
    "https://safevoice2-git-main-isrlchigozies-projects.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make io accessible to routes
app.set('socketio', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as time');
    
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString(),
      dbTime: result.rows[0].time,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SafeVoice Backend is running on Vercel!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins conversation
  socket.on('join_conversation', async (conversationData) => {
    try {
      const { conversationId, anonymousToken } = conversationData;
      
      if (!conversationId) return;

      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);

      if (anonymousToken) {
        const pool = require('./config/database');
        const userResult = await pool.query(
          'SELECT u.*, c.id as conversation_id FROM users u JOIN conversations c ON u.id = c.user_id WHERE u.anonymous_token = $1 AND c.id = $2',
          [anonymousToken, conversationId]
        );

        if (userResult.rows.length > 0) {
          connectedUsers.set(anonymousToken, {
            socketId: socket.id,
            conversationId: conversationId,
            anonymousToken: anonymousToken,
            lastActive: new Date(),
            isOnline: true
          });

          socket.to(`admin_room_1`).emit('user_online', {
            conversationId: conversationId,
            anonymousToken: anonymousToken
          });
        }
      }
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  });

  // Admin joins admin room
  socket.on('join_admin_room', (organizationId) => {
    const adminRoom = `admin_room_${organizationId || 1}`;
    socket.join(adminRoom);
    console.log(`Admin joined room: ${adminRoom}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      console.log('Socket received message:', data);
      
      if (data.anonymousToken && !data.is_admin_message) {
        const userData = connectedUsers.get(data.anonymousToken);
        if (userData) {
          userData.lastActive = new Date();
          userData.isOnline = true;
          connectedUsers.set(data.anonymousToken, userData);
        }

        socket.to(`admin_room_1`).emit('user_online', {
          conversationId: data.conversationId,
          anonymousToken: data.anonymousToken
        });
      }

      socket.to(data.conversationId).emit('receive_message', data);
      socket.emit('message_sent', data);

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

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    for (let [token, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        userData.isOnline = false;
        connectedUsers.set(token, userData);
        
        socket.to(`admin_room_1`).emit('user_offline', {
          conversationId: userData.conversationId,
          anonymousToken: token
        });
        break;
      }
    }
  });
});

// Cleanup interval
setInterval(() => {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  for (let [token, userData] of connectedUsers.entries()) {
    if (userData.lastActive < twoMinutesAgo && userData.isOnline) {
      userData.isOnline = false;
      connectedUsers.set(token, userData);
      
      io.to(`admin_room_1`).emit('user_offline', {
        conversationId: userData.conversationId,
        anonymousToken: token
      });
    }
  }
}, 30000);

// Vercel uses dynamic ports, so we need to use the PORT env variable
const PORT = process.env.PORT || 10000;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`✅ SafeVoice Server running on port ${PORT}`);
    console.log(`📊 Connected users tracking: Active`);
    console.log(`🔗 CORS enabled for Vercel frontend`);
    console.log(`📁 File uploads enabled: /api/uploads`);
  });
}

// Export for Vercel serverless
module.exports = app;