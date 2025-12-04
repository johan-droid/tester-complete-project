// backend/services/pdfservices.js

const pdf = require('pdf-parse');
const fs = require('fs');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const OCRService = require('./ocrServices'); // Make sure to install the required OCR service

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
 * Fixes Blind Spot B: "Happy Path" JSON Parsing
 */
function safeJSONParse(text) {
    try {
        // Attempt direct parse
        return JSON.parse(text);
    } catch (e) {
        // Fallback: Extract JSON array from text (removes markdown ```json ... ```)
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (err) {
                console.error("Failed to parse extracted JSON snippet:", err);
            }
        }
        throw new Error('AI response could not be parsed as JSON');
    }
}

/**
 * Helper to chunk text to avoid token limits
 * Fixes Blind Spot A: The "8000 Character" Data Loss
 */
function chunkText(text, chunkSize = 10000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Calls the AI to extract questions from a text chunk
 * @param {string} textChunk - The text chunk to process
 * @param {number} chunkIndex - The index of the current chunk
 * @param {number} totalChunks - Total number of chunks
 * @returns {Promise<Array>} Array of extracted questions
 */
async function callAIToExtractQuestions(textChunk, chunkIndex, totalChunks) {
    console.log(`Processing chunk ${chunkIndex + 1}/${totalChunks}...`);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        
        const prompt = `
            You are an expert academic assistant. Analyze the following text extracted from part ${chunkIndex + 1} of ${totalChunks} of a document.
            Extract all unique questions you can find. For each question, determine its type, difficulty, subject, topic, and options (if it's an MCQ).
            
            The question types must be one of: 'mcq', 'true-false', 'short-answer', 'descriptive'.
            The difficulty must be one of: 'easy', 'medium', 'hard'.
            
            Return the result as a VALID JSON array of objects. If no questions are found in this specific text chunk, return an empty array [].
            
            FORMAT:
            [
              {
                "question": "Question text?",
                "type": "mcq",
                "difficulty": "medium",
                "subject": "Subject",
                "topic": "Topic",
                "options": [{ "text": "A", "isCorrect": true }, { "text": "B", "isCorrect": false }],
                "marks": 1,
                "correctAnswer": "A"
              }
            ]
            
            ---
            TEXT CHUNK ${chunkIndex + 1} of ${totalChunks}:
            ---
            ${textChunk}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return safeJSONParse(response.text());

    } catch (error) {
        console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
        // Return empty array on error to allow other chunks to succeed
        return []; 
    }
}

class PDFService {
    static async extractQuestions(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            let text = data.text.trim();

            // ✅ DEBUG LOG: Check if text was actually found
            console.log(`PDF Text Length: ${text.length} characters`);

            // Check if PDF is empty or scanned (image-based)
            if (text.length < 50) {
                console.warn("⚠️ Text layer is empty. This might be a scanned PDF.");
                // Return a dummy question so the frontend doesn't crash/do nothing
                return [{
                    question: "Error: The uploaded PDF appears to be a scanned image. Please upload a PDF with selectable text.",
                    type: "short-answer",
                    difficulty: "easy",
                    subject: "System",
                    topic: "Error",
                    marks: 0
                }];
            }

            // --- FIX: Chunking & Parallel Processing ---
            const chunks = chunkText(text);
            console.log(`Split PDF into ${chunks.length} chunks.`);

            // Process chunks in parallel (be mindful of API rate limits)
            const chunkPromises = chunks.map((chunk, index) => 
                callAIToExtractQuestions(chunk, index, chunks.length)
            );
            
            const results = await Promise.all(chunkPromises);
            
            // Flatten the array of arrays into a single list of questions
            const allQuestions = results.flat();
            
            console.log(`Extracted total of ${allQuestions.length} questions.`);
            return allQuestions;

        } catch (error) {
            throw new Error(`PDF processing error: ${error.message}`);
        }
    }
}

module.exports = PDFService;
