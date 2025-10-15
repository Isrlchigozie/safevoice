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

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://safevoice2.vercel.app"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('socketio', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { db } = require('./config/database');
    // Test connection by listing collections
    const collections = await db().listCollections().toArray();
    
    res.json({ 
      status: 'OK', 
      database: 'MongoDB Connected',
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'MongoDB Disconnected',
      error: error.message 
    });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'SafeVoice Backend Running!' });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
