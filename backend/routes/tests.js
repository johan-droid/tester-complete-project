const express = require('express');
const { 
    createTest, 
    getTests, 
    getTest, 
    updateTest, 
    deleteTest, 
    getTestResults 
} = require('../controllers/testController');
const { protect } = require('../middleware/auth');
const { validateTest } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(validateTest, createTest)
    .get(getTests);

router.route('/:id')
    .get(getTest)
    .put(updateTest)
    .delete(deleteTest);

router.get('/:id/results', getTestResults);

module.exports = router;