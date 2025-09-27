const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'quiz-system-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MongoDB Connection with fallback
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster1.ldpnkto.mongodb.net/');
        console.log('✅ Connected to MongoDB');
        await createDefaultAdmin(); // Create admin user after connection
        return true;
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('🔄 Trying alternative connection...');
        
        try {
            // Try MongoDB Atlas connection string format
            await mongoose.connect('mongodb+srv://admin:admin123@cluster1.ldpnkto.mongodb.net/');
            console.log('✅ Connected to MongoDB on 127.0.0.1');
            await createDefaultAdmin(); // Create admin user after connection
            return true;
        } catch (err2) {
            console.error('❌ All MongoDB connections failed');
            console.log('⚠️  Running without database - some features may be limited');
            console.log('💡 To fix: Install and start MongoDB locally, or use MongoDB Atlas');
            return false;
        }
    }
};

// Create default admin user
const createDefaultAdmin = async () => {
    try {
        const User = require('./models/User');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@quiz.com';
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'System Administrator',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin'
            });
            
            await adminUser.save();
            console.log('✅ Default admin user created');
            console.log(`📧 Admin Email: ${adminEmail}`);
            console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
};

connectToMongoDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

app.get('/quiz/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history.html'));
});

// Socket.io for real-time timer
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-quiz', (quizId) => {
        socket.join(quizId);
        console.log(`User ${socket.id} joined quiz ${quizId}`);
    });
    
    socket.on('quiz-timer', (data) => {
        socket.to(data.quizId).emit('timer-update', data.timeLeft);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Quiz System Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});