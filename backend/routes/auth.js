const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/mongodb');

const router = express.Router();

// SETUP ENDPOINT - Run this first!
router.post('/setup', async (req, res) => {
  try {
    console.log('🔄 Setting up admin user...');
    
    // Check if admin already exists
    const existingAdmin = await db.admins.findByEmail('admin@test.org');
    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return res.json({ 
        message: 'Admin already exists',
        email: 'admin@test.org',
        password: 'admin123'
      });
    }

    // Create admin with hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.admins.create({
      email: 'admin@test.org',
      password_hash: hashedPassword,
      role: 'admin',
      organization_id: 1
    });

    console.log('✅ Admin user created successfully');
    
    res.json({ 
      success: true,
      message: 'Default admin created successfully',
      credentials: {
        email: 'admin@test.org',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('❌ Setup error:', error);
    res.status(500).json({ 
      error: 'Setup failed: ' + error.message 
    });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    // Find admin by email
    const admin = await db.admins.findByEmail(email);
    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Admin found:', admin.email);

    // Check password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id,
        organizationId: admin.organization_id,
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);
    
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        organizationId: admin.organization_id
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
});

module.exports = router;