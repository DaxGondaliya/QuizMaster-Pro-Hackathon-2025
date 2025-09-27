const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
        points: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, // Time spent in seconds
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['completed', 'timeout', 'abandoned'],
        default: 'completed'
    }
}, {
    timestamps: true
});

// Calculate percentage before saving
quizAttemptSchema.pre('save', function(next) {
    if (this.totalPoints > 0) {
        this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    next();
});

// Index for efficient querying
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ quizId: 1, score: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);