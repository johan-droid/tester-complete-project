const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tester', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('💡 Tip: Make sure MongoDB is running or check your MONGODB_URI in .env file');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/evaluations', require('./routes/evaluations'));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Tester Backend is running smoothly!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Demo endpoint for frontend (no auth required)
app.get('/api/demo/data', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'This is demo data from Tester backend',
            features: [
                'AI-Powered Evaluation',
                'PDF Question Extraction',
                'Handwritten Answer Recognition',
                'Performance Analytics'
            ],
            status: 'Backend is working correctly!'
        }
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('🔥 Error Stack:', err.stack);
    
    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Please upload a smaller file.'
        });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected field in file upload.'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Something went wrong on our end!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '🔍 Route not found - Please check the API endpoint'
    });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`\n🎉 Tester Backend Server Started Successfully!`);
        console.log(`📍 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`📚 API Documentation: Available at /api/ endpoints`);
        console.log(`\n💡 Next Steps:`);
        console.log(`   1. Make sure MongoDB is running`);
        console.log(`   2. Open frontend/index.html in a browser`);
        console.log(`   3. Test the API endpoints\n`);
    });
}

module.exports = app;