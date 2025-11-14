const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['mcq', 'true-false', 'short-answer', 'descriptive'],
        required: true
    },
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    correctAnswer: {
        type: String,
        required: function() {
            return this.type === 'short-answer' || this.type === 'descriptive';
        }
    },
    explanation: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [String],
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        default: 1
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        pdfName: String,
        pageNumber: Number,
        extractedText: String
    },
    metadata: {
        timesUsed: {
            type: Number,
            default: 0
        },
        successRate: {
            type: Number,
            default: 0
        },
        averageTime: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for better query performance
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);