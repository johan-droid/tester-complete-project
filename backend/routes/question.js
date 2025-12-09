const express = require('express');
const { 
    createQuestion, 
    getQuestions, 
    extractQuestionsFromPDF 
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { pdfUpload } = require('../middleware/upload');

const router = express.Router();

// Debugging check (optional, you can remove this after it works)
if (!pdfUpload) console.error("CRITICAL ERROR: pdfUpload middleware is undefined!");
if (!extractQuestionsFromPDF) console.error("CRITICAL ERROR: extractQuestionsFromPDF controller is undefined!");

router.use(protect);

router.route('/')
    .post(createQuestion)
    .get(getQuestions);

// This is where your error was happening (Line 18)
router.post('/extract-pdf', pdfUpload, extractQuestionsFromPDF);

module.exports = router;