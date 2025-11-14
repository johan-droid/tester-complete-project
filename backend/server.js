// --- server.js ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const questionRoutes = require('./routes/question');
const evaluationRoutes = require('./routes/evaluation');

const app = express();

// --- MIDDLEWARE ---

// 1. Enable CORS
// This allows your frontend (on port 3000) to talk to your backend (on port 5000)
app.use(cors());

// 2. Body Parser
// Allows us to read JSON from the body of requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILE SERVING ---

// 3. Serve the 'src' folder (CSS, JS, Images)
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// 4. Serve the 'frontend' folder (HTML files)
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. Make the 'uploads' folder public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ROUTES ---

// 6. Mount your API routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Simple health check route
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Backend is running!' });
});

// --- CATCH-ALL FOR FRONTEND ---

// 7. Send index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('✅ MongoDB connection attempt initiated...');
});