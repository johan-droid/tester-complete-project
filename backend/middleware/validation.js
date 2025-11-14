const validator = require('validator');

exports.validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email and password'
        });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }

    next();
};

exports.validateTest = (req, res, next) => {
    const { title, questions } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Test title is required'
        });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Test must have at least one question'
        });
    }

    next();
};