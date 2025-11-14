const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        marksObtained: {
            type: Number,
            default: 0
        },
        timeSpent: Number, // in seconds
        feedback: String
    }],
    score: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // in seconds
        required: true
    },
    startedAt: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress'
    },
    evaluation: {
        weakAreas: [String],
        strengths: [String],
        recommendations: [String],
        overallFeedback: String
    }
}, {
    timestamps: true
});

// Index for better query performance
resultSchema.index({ user: 1, test: 1 });
resultSchema.index({ submittedAt: -1 });

// Calculate percentage before saving
resultSchema.pre('save', function(next) {
    if (this.score && this.totalMarks) {
        this.percentage = (this.score / this.totalMarks) * 100;
    }
    next();
});

module.exports = mongoose.model('Result', resultSchema);