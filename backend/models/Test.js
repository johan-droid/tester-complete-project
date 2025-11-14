const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Test title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    settings: {
        duration: {
            type: Number, // in minutes
            default: 60
        },
        shuffleQuestions: {
            type: Boolean,
            default: false
        },
        showResults: {
            type: Boolean,
            default: true
        },
        allowRetakes: {
            type: Boolean,
            default: false
        },
        passingScore: {
            type: Number,
            default: 60
        }
    },
    tags: [String],
    isPublic: {
        type: Boolean,
        default: false
    },
    accessCode: {
        type: String,
        sparse: true
    },
    statistics: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for better query performance
testSchema.index({ createdBy: 1, createdAt: -1 });
testSchema.index({ tags: 1 });
testSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Test', testSchema);