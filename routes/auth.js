const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'student'
        });
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'quiz-jwt-secret',
            { expiresIn: '24h' }
        );
        
        // Store user info in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Provide specific error messages
        if (error.name === 'MongooseError' || error.name === 'MongooseServerSelectionError') {
            res.status(503).json({ 
                error: 'Database connection unavailable. Please try again later or contact admin to start MongoDB service.' 
            });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'User already exists with this email' });
        } else {
            res.status(500).json({ 
                error: 'Server error during registration. Please check your input and try again.' 
            });
        }
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'quiz-jwt-secret',
            { expiresIn: '24h' }
        );
        
        // Store user info in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        
        // Provide specific error messages
        if (error.name === 'MongooseError' || error.name === 'MongooseServerSelectionError') {
            res.status(503).json({ 
                error: 'Database connection unavailable. Please try again later or contact admin to start MongoDB service.' 
            });
        } else {
            res.status(500).json({ 
                error: 'Server error during login. Please check your credentials and try again.' 
            });
        }
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const user = await User.findById(req.session.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;