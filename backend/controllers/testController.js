const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');

exports.createTest = async (req, res) => {
    try {
        const { title, description, questions, settings, tags } = req.body;

        const test = await Test.create({
            title,
            description,
            questions,
            settings,
            tags,
            createdBy: req.user.id
        });

        // Populate the test with questions
        await test.populate('questions');

        res.status(201).json({
            success: true,
            data: {
                test
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating test',
            error: error.message
        });
    }
};

exports.getTests = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, tags } = req.query;
        const query = { createdBy: req.user.id };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        const tests = await Test.find(query)
            .populate('questions')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Test.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                tests,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tests',
            error: error.message
        });
    }
};

exports.getTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('questions')
            .populate('createdBy', 'name email');

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                test
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test',
            error: error.message
        });
    }
};

exports.updateTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('questions');

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                test
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating test',
            error: error.message
        });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndDelete(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Test deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting test',
            error: error.message
        });
    }
};

exports.getTestResults = async (req, res) => {
    try {
        const results = await Result.find({ test: req.params.id })
            .populate('user', 'name email')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test results',
            error: error.message
        });
    }
};