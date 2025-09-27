const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Get all active quizzes for students
router.get('/available', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true })
            .select('title description duration totalPoints attempts createdAt')
            .sort({ createdAt: -1 });
        res.json({ quizzes });
    } catch (error) {
        console.error('Get available quizzes error:', error);
        res.status(500).json({ error: 'Server error while fetching quizzes' });
    }
});

// Get quiz for taking (without answers)
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, isActive: true });
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or not active' });
        }
        
        // Remove correct answers from questions for students
        const quizForStudent = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            totalPoints: quiz.totalPoints,
            questions: quiz.questions.map((question, index) => ({
                _id: question._id,
                index: index,
                question: question.question,
                options: question.options,
                points: question.points
            }))
        };
        
        res.json({ quiz: quizForStudent });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Server error while fetching quiz' });
    }
});

// Submit quiz attempt
router.post('/:id/submit', isAuthenticated, async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;
        const quizId = req.params.id;
        const userId = req.session.user.id;
        
        // Get the quiz with correct answers
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Calculate score
        let score = 0;
        const processedAnswers = [];
        
        answers.forEach((answer, index) => {
            const question = quiz.questions[index];
            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            const points = isCorrect ? (question.points || 1) : 0;
            
            score += points;
            
            processedAnswers.push({
                questionIndex: index,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: isCorrect,
                points: points
            });
        });
        
        // Create quiz attempt record
        const quizAttempt = new QuizAttempt({
            userId,
            quizId,
            answers: processedAnswers,
            score,
            totalPoints: quiz.totalPoints,
            timeSpent
        });
        
        await quizAttempt.save();
        
        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 
                totalScore: score,
                quizzesAttempted: 1
            }
        });
        
        // Update quiz attempt count
        await Quiz.findByIdAndUpdate(quizId, {
            $inc: { attempts: 1 }
        });
        
        // Return results
        const results = {
            score,
            totalPoints: quiz.totalPoints,
            percentage: quizAttempt.percentage,
            timeSpent,
            answers: processedAnswers.map((ans, index) => ({
                questionIndex: index,
                question: quiz.questions[index].question,
                options: quiz.questions[index].options,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: quiz.questions[index].correctAnswer,
                isCorrect: ans.isCorrect,
                points: ans.points
            }))
        };
        
        res.json({
            message: 'Quiz submitted successfully',
            results
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Server error while submitting quiz' });
    }
});

// Get user's quiz attempts history
router.get('/history/user', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const attempts = await QuizAttempt.find({ userId })
            .populate('quizId', 'title description')
            .sort({ createdAt: -1 });
        
        res.json({ attempts });
    } catch (error) {
        console.error('Get quiz history error:', error);
        res.status(500).json({ error: 'Server error while fetching quiz history' });
    }
});

// Get detailed results for a specific attempt
router.get('/attempt/:id', isAuthenticated, async (req, res) => {
    try {
        const attempt = await QuizAttempt.findOne({ 
            _id: req.params.id,
            userId: req.session.user.id 
        }).populate('quizId');
        
        if (!attempt) {
            return res.status(404).json({ error: 'Quiz attempt not found' });
        }
        
        const quiz = attempt.quizId;
        const detailedResults = {
            attempt: {
                _id: attempt._id,
                score: attempt.score,
                totalPoints: attempt.totalPoints,
                percentage: attempt.percentage,
                timeSpent: attempt.timeSpent,
                completedAt: attempt.completedAt,
                status: attempt.status
            },
            quiz: {
                title: quiz.title,
                description: quiz.description
            },
            answers: attempt.answers.map((ans, index) => ({
                questionIndex: ans.questionIndex,
                question: quiz.questions[ans.questionIndex].question,
                options: quiz.questions[ans.questionIndex].options,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: quiz.questions[ans.questionIndex].correctAnswer,
                isCorrect: ans.isCorrect,
                points: ans.points
            }))
        };
        
        res.json({ results: detailedResults });
    } catch (error) {
        console.error('Get attempt details error:', error);
        res.status(500).json({ error: 'Server error while fetching attempt details' });
    }
});

module.exports = router;