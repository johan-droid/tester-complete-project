const Question = require('../models/Question');
const PDFService = require('../services/pdfservices');

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create({
            ...req.body,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: {
                question
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating question',
            error: error.message
        });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, difficulty, subject, topic, tags } = req.query;
        const query = { createdBy: req.user.id };

        if (type) query.type = type;
        if (difficulty) query.difficulty = difficulty;
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (tags) query.tags = { $in: tags.split(',') };

        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Question.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                questions,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: error.message
        });
    }
};

exports.extractQuestionsFromPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            });
        }

        const questions = await PDFService.extractQuestions(req.file.path);
        
        // Save extracted questions to database
        const savedQuestions = await Promise.all(
            questions.map(async (questionData) => {
                const question = await Question.create({
                    ...questionData,
                    createdBy: req.user.id,
                    source: {
                        pdfName: req.file.originalname,
                        extractedText: questionData.question
                    }
                });
                return question;
            })
        );

        res.status(200).json({
            success: true,
            data: {
                questions: savedQuestions,
                extractedCount: savedQuestions.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error extracting questions from PDF',
            error: error.message
        });
    }
};