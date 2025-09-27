const express = require('express');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Create a new quiz
router.post('/quiz', isAdmin, async (req, res) => {
    try {
        const { title, description, questions, duration } = req.body;
        
        if (!title || !questions || !duration) {
            return res.status(400).json({ error: 'Title, questions, and duration are required' });
        }
        
        if (questions.length === 0) {
            return res.status(400).json({ error: 'At least one question is required' });
        }
        
        const quiz = new Quiz({
            title,
            description,
            questions,
            duration,
            createdBy: req.session.user.id
        });
        
        await quiz.save();
        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Server error while creating quiz' });
    }
});

// Get all quizzes (admin view)
router.get('/quizzes', isAdmin, async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ quizzes });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Server error while fetching quizzes' });
    }
});

// Get single quiz (admin view with answers)
router.get('/quiz/:id', isAdmin, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        res.json({ quiz });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Server error while fetching quiz' });
    }
});

// Update quiz
router.put('/quiz/:id', isAdmin, async (req, res) => {
    try {
        const { title, description, questions, duration, isActive } = req.body;
        
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.questions = questions || quiz.questions;
        quiz.duration = duration || quiz.duration;
        quiz.isActive = isActive !== undefined ? isActive : quiz.isActive;
        
        await quiz.save();
        res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Server error while updating quiz' });
    }
});

// Delete quiz
router.delete('/quiz/:id', isAdmin, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Also delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quizId: req.params.id });
        await Quiz.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Server error while deleting quiz' });
    }
});

// Get quiz statistics
router.get('/quiz/:id/stats', isAdmin, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        const attempts = await QuizAttempt.find({ quizId: req.params.id })
            .populate('userId', 'name email');
        
        const stats = {
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0 
                ? Math.round(attempts.reduce((sum, att) => sum + att.percentage, 0) / attempts.length)
                : 0,
            highestScore: attempts.length > 0 
                ? Math.max(...attempts.map(att => att.percentage))
                : 0,
            lowestScore: attempts.length > 0 
                ? Math.min(...attempts.map(att => att.percentage))
                : 0,
            recentAttempts: attempts.slice(-10).reverse()
        };
        
        res.json({ stats });
    } catch (error) {
        console.error('Get quiz stats error:', error);
        res.status(500).json({ error: 'Server error while fetching quiz statistics' });
    }
});

// Get all users (admin view)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error while fetching users' });
    }
});

// Get dashboard stats
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const totalQuizzes = await Quiz.countDocuments();
        const activeQuizzes = await Quiz.countDocuments({ isActive: true });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAttempts = await QuizAttempt.countDocuments();
        
        const recentAttempts = await QuizAttempt.find()
            .populate('userId', 'name')
            .populate('quizId', 'title')
            .sort({ createdAt: -1 })
            .limit(10);
        
        const stats = {
            totalQuizzes,
            activeQuizzes,
            totalStudents,
            totalAttempts,
            recentAttempts
        };
        
        res.json({ stats });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Server error while fetching dashboard statistics' });
    }
});

module.exports = router;