const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define Routes
// These paths match the files you uploaded in the 'routes' folder
app.use('/api/users', require('./routes/auth'));
app.use('/api/resumes', require('./routes/evaluation'));
app.use('/api/ats', require('./routes/question'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});