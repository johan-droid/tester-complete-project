const express = require('express');
const { 
    submitTest, 
    evaluateHandwrittenAnswer, 
    getUserResults 
} = require('../controllers/evaluationController');
const { protect } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/submit', submitTest);
router.post('/handwritten', imageUpload, evaluateHandwrittenAnswer);
router.get('/results', getUserResults);

module.exports = router;