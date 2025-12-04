// backend/services/aiServices.js

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// --- AI Model Configuration ---
// Get your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

// Configuration for blocking harmful content
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

/**
 * Uses a Generative AI to evaluate a student's answer against a correct answer.
 * @param {string} studentAnswer - The text extracted from the student's submission.
 * @param {string} correctAnswer - The model answer from the database.
 * @returns {Promise<Object>} A promise resolving to an evaluation object.
 */
async function callAIToEvaluate(studentAnswer, correctAnswer) {
    console.log('Sending answers to AI for evaluation...');
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        
        const prompt = `
            You are an expert teacher grading a student's answer.
            Analyze the "Student Answer" and compare it to the "Correct Answer".
            
            Provide your evaluation in a VALID JSON object with the following structure:
            {
              "isCorrect": true,
              "marks": 0.8,
              "similarity": 0.85,
              "feedback": "Your answer is good, but you missed a key point about cellular respiration."
            }
            
            - "isCorrect": A boolean. True if the answer is mostly correct (similarity > 0.7), false otherwise.
            - "marks": A float between 0.0 and 1.0 representing the score (0.0 for wrong, 1.0 for perfect).
            - "similarity": A float between 0.0 and 1.0 indicating how semantically similar the answers are.
            - "feedback": A short, constructive feedback string for the student.
            
            ---
            STUDENT ANSWER:
            ---
            ${studentAnswer}
            
            ---
            CORRECT ANSWER:
            ---
            ${correctAnswer}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Clean up the response to ensure it's valid JSON
        const jsonText = response.text().replace(/```json|```/g, '').trim();
        
        const evaluation = JSON.parse(jsonText);
        
        // Add basic validation
        if (typeof evaluation.marks !== 'number' || typeof evaluation.isCorrect !== 'boolean') {
            throw new Error('Invalid JSON response from AI');
        }
        return evaluation;

    } catch (error) {
        console.error("Error calling AI for evaluation:", error);
        // Fallback to a simple check in case AI fails
        return {
            isCorrect: studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase().substring(0, 10)),
            marks: 0.0,
            similarity: 0.0,
            feedback: 'Could not evaluate answer automatically. Please review manually.'
        };
    }
}


class AIService {
    static async evaluateAnswer(studentAnswer, correctAnswer) {
        try {
            // This now calls our new AI function
            const evaluation = await callAIToEvaluate(studentAnswer, correctAnswer);
            
            return {
                isCorrect: evaluation.isCorrect,
                marks: parseFloat(evaluation.marks.toFixed(2)),
                similarity: parseFloat(evaluation.similarity.toFixed(2)),
                feedback: evaluation.feedback
            };
        } catch (error) {
            throw new Error(`AI evaluation error: ${error.message}`);
        }
    }

    // These functions are used for the Dashboard feature.
    // They are simple but functional for now.
    static async identifyWeakAreas(answers) {
        const wrongAnswers = answers.filter(a => !a.isCorrect);
        // 'answers.question' is the full question object from the controller fix
        const weakTopics = [...new Set(wrongAnswers.map(a => a.question.topic || 'Unknown'))];
        return weakTopics.slice(0, 3);
    }

    static async identifyStrengths(answers) {
        const correctAnswers = answers.filter(a => a.isCorrect);
        const strongTopics = [...new Set(correctAnswers.map(a => a.question.topic || 'Unknown'))];
        return strongTopics.slice(0, 3);
    }

    static async generateRecommendations(answers) {
        const recommendations = [];
         const score = answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) : 0;

        if (score < 0.5) {
            recommendations.push('Focus on fundamental concepts');
            recommendations.push('Practice more basic questions');
        } else if (score < 0.8) {
            recommendations.push('Work on time management');
            recommendations.push('Focus on weak areas identified');
        } else {
            recommendations.push('Excellent performance! Maintain consistency');
        }

        return recommendations;
    }
}

module.exports = AIService;
