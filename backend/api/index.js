const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const chatRoutes = require('../routes/chat');
const uploadRoutes = require('../routes/uploads');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { connectDB } = require('../config/database');
    const db = await connectDB();
    
    const collections = await db.listCollections().toArray();
    
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

app.get('/api', (req, res) => {
  res.json({ message: 'SafeVoice API is running' });
});

// Export for Vercel
module.exports = app;