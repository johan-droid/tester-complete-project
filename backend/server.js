// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); //

// Import Routes
const authRoutes = require('./routes/auth'); //
const questionRoutes = require('./routes/question'); //
const testRoutes = require('./routes/tests'); //
const evaluationRoutes = require('./routes/evaluation'); //

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Mount Routes with correct prefixes
// This ensures http://localhost:5000/api/auth/me works
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/evaluation', evaluationRoutes);

// Static files (for uploaded images/pdfs if stored locally)
app.use('/uploads', express.static('uploads'));

// Basic Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});