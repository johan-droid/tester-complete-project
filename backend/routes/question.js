const express = require('express');
const { 
    createQuestion, 
    getQuestions, 
    extractQuestionsFromPDF 
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { pdfUpload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createQuestion)
    .get(getQuestions);

router.post('/extract-pdf', pdfUpload, extractQuestionsFromPDF);

module.exports = router;