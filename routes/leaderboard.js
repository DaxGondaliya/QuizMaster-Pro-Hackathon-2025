const express = require('express');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const router = express.Router();

// Get overall leaderboard
router.get('/overall', async (req, res) => {
    try {
        const leaderboard = await User.find({ role: 'student', quizzesAttempted: { $gt: 0 } })
            .select('name email totalScore quizzesAttempted')
            .sort({ totalScore: -1, quizzesAttempted: -1 })
            .limit(50);
        
        const formattedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            name: user.name,
            email: user.email,
            totalScore: user.totalScore,
            quizzesAttempted: user.quizzesAttempted,
            averageScore: user.quizzesAttempted > 0 
                ? Math.round(user.totalScore / user.quizzesAttempted * 100) / 100 
                : 0
        }));
        
        res.json({ leaderboard: formattedLeaderboard });
    } catch (error) {
        console.error('Get overall leaderboard error:', error);
        res.status(500).json({ error: 'Server error while fetching leaderboard' });
    }
});

// Get quiz-specific leaderboard
router.get('/quiz/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        
        // Get all attempts for this quiz, grouped by user (best attempt per user)
        const mongoose = require('mongoose');
        const attempts = await QuizAttempt.aggregate([
            { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$userId',
                    bestScore: { $max: '$score' },
                    bestPercentage: { $max: '$percentage' },
                    totalAttempts: { $sum: 1 },
                    bestTimeSpent: { $min: '$timeSpent' },
                    lastAttempt: { $max: '$completedAt' },
                    user: { $first: '$user' }
                }
            },
            {
                $sort: { 
                    bestScore: -1, 
                    bestTimeSpent: 1,
                    lastAttempt: -1 
                }
            },
            { $limit: 50 }
        ]);
        
        const leaderboard = attempts.map((entry, index) => ({
            rank: index + 1,
            name: entry.user.name,
            email: entry.user.email,
            bestScore: entry.bestScore,
            bestPercentage: entry.bestPercentage,
            totalAttempts: entry.totalAttempts,
            bestTimeSpent: entry.bestTimeSpent,
            lastAttempt: entry.lastAttempt
        }));
        
        res.json({ leaderboard });
    } catch (error) {
        console.error('Get quiz leaderboard error:', error);
        res.status(500).json({ error: 'Server error while fetching quiz leaderboard' });
    }
});

// Get recent high scores
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const recentScores = await QuizAttempt.find()
            .populate('userId', 'name email')
            .populate('quizId', 'title')
            .sort({ createdAt: -1, score: -1 })
            .limit(limit);
        
        const formattedScores = recentScores.map((attempt, index) => ({
            rank: index + 1,
            studentName: attempt.userId.name,
            studentEmail: attempt.userId.email,
            quizTitle: attempt.quizId.title,
            score: attempt.score,
            totalPoints: attempt.totalPoints,
            percentage: attempt.percentage,
            timeSpent: attempt.timeSpent,
            completedAt: attempt.completedAt
        }));
        
        res.json({ recentScores: formattedScores });
    } catch (error) {
        console.error('Get recent scores error:', error);
        res.status(500).json({ error: 'Server error while fetching recent scores' });
    }
});

// Get top performers by percentage
router.get('/top-performers', async (req, res) => {
    try {
        const topPerformers = await QuizAttempt.find({ percentage: { $gte: 80 } })
            .populate('userId', 'name email')
            .populate('quizId', 'title')
            .sort({ percentage: -1, timeSpent: 1 })
            .limit(20);
        
        const formattedPerformers = topPerformers.map((attempt, index) => ({
            rank: index + 1,
            studentName: attempt.userId.name,
            quizTitle: attempt.quizId.title,
            percentage: attempt.percentage,
            score: attempt.score,
            totalPoints: attempt.totalPoints,
            timeSpent: attempt.timeSpent,
            completedAt: attempt.completedAt
        }));
        
        res.json({ topPerformers: formattedPerformers });
    } catch (error) {
        console.error('Get top performers error:', error);
        res.status(500).json({ error: 'Server error while fetching top performers' });
    }
});

module.exports = router;