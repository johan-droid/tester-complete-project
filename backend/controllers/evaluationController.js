// backend/controllers/evaluationController.js

const Result = require('../models/Result');
const Question = require('../models/Question');
const AIService = require('../services/aiServices');
const OCRService = require('../services/ocrServices');

exports.submitTest = async (req, res) => {
    try {
        const { testId, answers, timeTaken, startedAt } = req.body;
        
        // --- FIX 1: Fetch all question data at once ---
        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ '_id': { $in: questionIds } });
        
        // Create a map for easy lookup of full question objects and marks
        const questionMap = new Map();
        questions.forEach(q => {
            questionMap.set(q._id.toString(), q);
        });

        // Calculate score and evaluate answers
        const evaluatedAnswers = await Promise.all(
            answers.map(async (answer) => {
                let isCorrect = false;
                let marksObtained = 0;
                let feedback = '';

                // const question = await Question.findById(answer.questionId); // No longer needed
                const question = questionMap.get(answer.questionId);
                
                if (!question) {
                    // Skip this answer if question not found
                    return null;
                }

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
                    // Scale AI marks (0-1) by the question's total marks
                    marksObtained = evaluation.marks * question.marks; 
                    feedback = evaluation.feedback;
                }

                return {
                    question: question, // --- FIX 2: Pass the FULL question object ---
                    userAnswer: answer.userAnswer,
                    isCorrect,
                    marksObtained: parseFloat(marksObtained.toFixed(2)),
                    feedback,
                    timeSpent: answer.timeSpent
                };
            })
        );
        
        // Filter out any null answers (where question wasn't found)
        const validAnswers = evaluatedAnswers.filter(a => a !== null);

        const totalScore = validAnswers.reduce((sum, answer) => sum + answer.marksObtained, 0);
        
        // --- FIX 3: Correctly calculate totalMarks ---
        const totalMarks = validAnswers.reduce((sum, answer) => {
            // 'answer.question' is now the full object
            return sum + (answer.question.marks || 0); 
        }, 0);
        
        // Now, we pass the validAnswers (with full question objects) to the AI services
        const evaluation = {
            weakAreas: await AIService.identifyWeakAreas(validAnswers),
            strengths: await AIService.identifyStrengths(validAnswers),
            recommendations: await AIService.generateRecommendations(validAnswers)
        };

        // Create result
        const result = await Result.create({
            test: testId,
            user: req.user.id,
            // Before saving, map 'question' back to just the ID for the database
            answers: validAnswers.map(a => ({ ...a, question: a.question._id })),
            score: totalScore,
            totalMarks,
            timeTaken,
            startedAt: startedAt || new Date(Date.now() - (timeTaken * 1000)), // Estimate if not provided
            status: 'completed',
            evaluation
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
        console.error('Error submitting test:', error); // Log the full error
        res.status(500).json({
            success: false,
            message: 'Error submitting test',
            error: error.message
        });
    }
};

// ... (evaluateHandwrittenAnswer and getUserResults are fine) ...
exports.evaluateHandwrittenAnswer = async (req, res) => {
    // ... (no changes needed here) ...
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
    // ... (no changes needed here) ...
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
