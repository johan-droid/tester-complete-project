const Result = require('../models/Result');
const Question = require('../models/Question');
const AIService = require('../services/aiServices');
const OCRService = require('../services/ocrServices');

exports.submitTest = async (req, res) => {
    try {
        const { testId, answers, timeTaken } = req.body;
        
        // Calculate score and evaluate answers
        const evaluatedAnswers = await Promise.all(
            answers.map(async (answer) => {
                let isCorrect = false;
                let marksObtained = 0;
                let feedback = '';

                const question = await Question.findById(answer.questionId);
                
                if (question.type === 'mcq' || question.type === 'true-false') {
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    isCorrect = answer.userAnswer === correctOption.text;
                    marksObtained = isCorrect ? question.marks : 0;
                } else {
                    // Use AI service for subjective evaluation
                    const evaluation = await AIService.evaluateAnswer(
                        answer.userAnswer,
                        question.correctAnswer
                    );
                    isCorrect = evaluation.isCorrect;
                    marksObtained = evaluation.marks;
                    feedback = evaluation.feedback;
                }

                return {
                    question: answer.questionId,
                    userAnswer: answer.userAnswer,
                    isCorrect,
                    marksObtained,
                    feedback,
                    timeSpent: answer.timeSpent
                };
            })
        );

        const totalScore = evaluatedAnswers.reduce((sum, answer) => sum + answer.marksObtained, 0);
        const totalMarks = evaluatedAnswers.reduce((sum, answer) => {
            const question = evaluatedAnswers.find(a => a.question.toString() === answer.question.toString());
            return sum + (question ? question.marksObtained : 0);
        }, 0);

        // Create result
        const result = await Result.create({
            test: testId,
            user: req.user.id,
            answers: evaluatedAnswers,
            score: totalScore,
            totalMarks,
            timeTaken,
            status: 'completed',
            evaluation: {
                weakAreas: await AIService.identifyWeakAreas(evaluatedAnswers),
                strengths: await AIService.identifyStrengths(evaluatedAnswers),
                recommendations: await AIService.generateRecommendations(evaluatedAnswers)
            }
        });

        await result.populate('test');
        await result.populate('answers.question');

        res.status(201).json({
            success: true,
            data: {
                result
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting test',
            error: error.message
        });
    }
};

exports.evaluateHandwrittenAnswer = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const { questionId } = req.body;
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Extract text from handwritten image
        const extractedText = await OCRService.extractText(req.file.path);
        
        // Evaluate using AI
        const evaluation = await AIService.evaluateAnswer(
            extractedText,
            question.correctAnswer
        );

        res.status(200).json({
            success: true,
            data: {
                extractedText,
                evaluation
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error evaluating handwritten answer',
            error: error.message
        });
    }
};

exports.getUserResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id })
            .populate('test')
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
            message: 'Error fetching results',
            error: error.message
        });
    }
};