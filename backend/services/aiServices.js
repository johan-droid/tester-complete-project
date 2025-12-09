// backend/services/aiServices.js

const pdf = require('pdf-parse');
const fs = require('fs');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// --- AI Model Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Helper to clean and parse JSON from AI response
 * Fixes: Removes markdown code blocks which often cause parsing errors
 */
function safeJSONParse(text) {
    console.log("Raw AI Response:", text); // Debugging: See what AI actually sent
    
    // Remove markdown code blocks (```json ... ```)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("JSON Parse Error. Cleaned text was:", cleanedText);
        // Fallback: Attempt to find array brackets if extra text exists
        const match = cleanedText.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (err) {
                throw new Error('AI response could not be parsed as JSON');
            }
        }
        throw new Error('AI response could not be parsed as JSON');
    }
}

/**
 * Helper to chunk text to avoid token limits
 */
function chunkText(text, chunkSize = 15000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Calls the AI to generate questions from a text chunk
 */
async function callAIToExtractQuestions(textChunk, chunkIndex, totalChunks) {
    console.log(`Processing chunk ${chunkIndex + 1}/${totalChunks}...`);
    
    try {
        // Use gemini-1.5-flash for speed and lower cost (free tier friendly)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        
        const prompt = `
            You are an expert teacher. 
            Goal: Create a set of practice questions based on the provided text.
            
            Instructions:
            1. Generate at least 5 unique questions from the text below.
            2. VARY the difficulty: Include 'easy', 'medium', and 'hard' questions.
            3. VARY the type: Include 'mcq', 'true-false', 'short-answer'.
            4. Output MUST be a valid JSON array. Do not add any markdown formatting.
            
            REQUIRED JSON STRUCTURE:
            [
              {
                "question": "Question text here?",
                "type": "mcq", 
                "difficulty": "medium", 
                "subject": "General", 
                "topic": "Extracted Topic", 
                "options": [{ "text": "Option A", "isCorrect": true }, { "text": "Option B", "isCorrect": false }],
                "correctAnswer": "Option A",
                "marks": 5
              }
            ]
            
            Text to analyze:
            "${textChunk}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return safeJSONParse(response.text());

    } catch (error) {
        console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
        return []; 
    }
}

class PDFService {
    static async extractQuestions(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            let data = await pdf(dataBuffer);
            let text = data.text.trim();

            // Check if PDF is text-readable (not just scanned images)
            if (text.length < 50) {
                console.warn("Warning: PDF text is very short. It might be a scanned image.");
                // If you had OCR setup, you would call it here. 
                // For now, we return a warning question so the user knows.
                return [{
                    question: "Error: The uploaded PDF appears to be a scanned image or empty. Please upload a text-based PDF.",
                    type: "short-answer",
                    difficulty: "easy",
                    subject: "System",
                    topic: "Error",
                    correctAnswer: "N/A"
                }];
            }

            const chunks = chunkText(text);
            console.log(`Split PDF into ${chunks.length} chunks.`);

            // Process chunks in parallel
            const chunkPromises = chunks.map((chunk, index) => 
                callAIToExtractQuestions(chunk, index, chunks.length)
            );
            
            const results = await Promise.all(chunkPromises);
            
            // Combine all questions
            const allQuestions = results.flat();
            
            if (allQuestions.length === 0) {
                throw new Error("AI successfully processed the text but returned 0 questions.");
            }

            console.log(`Successfully generated ${allQuestions.length} questions.`);
            return allQuestions;

        } catch (error) {
            console.error("PDF Processing Fatal Error:", error);
            throw new Error(`PDF processing failed: ${error.message}`);
        }
    }
}

module.exports = PDFService;

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
