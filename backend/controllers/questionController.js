const Question = require('../models/Question');
const PDFService = require('../services/pdfservices');

// --- 1. Create Question (Restored) ---
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

// --- 2. Get Questions (Restored) ---
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

// --- 3. Extract from PDF (New Logic) ---
exports.extractQuestionsFromPDF = async (req, res) => {
    console.log("Received PDF extraction request");

    try {
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            });
        }

        console.log(`Processing file: ${req.file.path}`);

        // Extract questions using the service
        const questionsData = await PDFService.extractQuestions(req.file.path);
        
        console.log(`Service returned ${questionsData.length} questions`);

        // Save extracted questions to database
        const savedQuestions = await Promise.all(
            questionsData.map(async (qData) => {
                const question = await Question.create({
                    type: qData.type || 'short-answer',
                    question: qData.question || 'No question text',
                    options: qData.options || [],
                    correctAnswer: qData.correctAnswer || 'N/A',
                    difficulty: qData.difficulty || 'medium',
                    subject: qData.subject || 'General',
                    topic: qData.topic || 'General',
                    marks: qData.marks || 1,
                    createdBy: req.user.id,
                    source: {
                        pdfName: req.file.originalname,
                        extractedText: qData.question
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
        console.error("Controller Error:", error);
        res.status(500).json({
            success: false,
            message: 'Error extracting questions: ' + error.message,
            error: error.message
        });
    }
};