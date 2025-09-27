const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    points: {
        type: Number,
        default: 1
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    questions: [questionSchema],
    duration: {
        type: Number,
        required: true,
        min: 1 // Duration in minutes
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
    if (this.questions && this.questions.length > 0) {
        this.totalPoints = this.questions.reduce((total, question) => {
            return total + (question.points || 1);
        }, 0);
    }
    next();
});

module.exports = mongoose.model('Quiz', quizSchema);