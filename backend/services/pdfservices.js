// backend/services/pdfservices.js

const pdf = require('pdf-parse');
const fs = require('fs');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// --- AI Model Configuration ---
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
 * Uses a Generative AI to extract structured questions from raw text.
 * @param {string} text - The raw text extracted from the PDF.
 * @returns {Promise<Array>} A promise that resolves to an array of question objects.
 */
async function callAIToExtractQuestions(text) {
    console.log('Sending PDF text to AI for extraction...');
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        
        const prompt = `
            You are an expert academic assistant. Analyze the following text extracted from an educational document. 
            Extract all questions you can find. For each question, determine its type, difficulty, subject, topic, and options (if it's an MCQ). 
            
            The question types must be one of: 'mcq', 'true-false', 'short-answer', 'descriptive'.
            The difficulty must be one of: 'easy', 'medium', 'hard'.
            
            Return the result as a VALID JSON array of objects.
            
            Here is an example of the required JSON output format:
            [
              {
                "question": "What is the capital of France?",
                "type": "short-answer",
                "difficulty": "easy",
                "subject": "Geography",
                "topic": "European Capitals",
                "correctAnswer": "Paris",
                "marks": 1
              },
              {
                "question": "The powerhouse of the cell is the...",
                "type": "mcq",
                "difficulty": "medium",
                "subject": "Biology",
                "topic": "Cellular Biology",
                "options": [
                  { "text": "Nucleus", "isCorrect": false },
                  { "text": "Ribosome", "isCorrect": false },
                  { "text": "Mitochondria", "isCorrect": true },
                  { "text": "Chloroplast", "isCorrect": false }
                ],
                "marks": 1
              }
            ]
            
            ---
            PDF TEXT TO ANALYZE:
            ---
            ${text.substring(0, 8000)} 
        `; // Truncate text to avoid exceeding token limits

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, '').trim();
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error calling AI for PDF extraction:", error);
        throw new Error('Failed to parse questions using AI.');
    }
}


class PDFService {
    static async extractQuestions(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            
            // Extract text from PDF
            const text = data.text;
            
            // NEW: Call the AI service instead of the simple parser
            const questions = await callAIToExtractQuestions(text);
            
            return questions;
        } catch (error) {
            throw new Error(`PDF processing error: ${error.message}`);
        }
    }
}

module.exports = PDFService;
