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
            let data = await pdf(dataBuffer);
            let text = data.text.trim();

            // --- FIX: Scanned PDF / OCR Fallback ---
            // If text is very short/empty, it's likely a scanned image PDF.
            if (text.length < 50) {
                console.log("Text layer empty. Attempting OCR...");
                
                // NOTE: To make this work fully, you need a library like 'pdf-img-convert' 
                // to convert the PDF pages to image buffers/files first.
                // Since I cannot install packages for you, this is the logic flow:
                
                /* const pdf2pic = require('pdf-img-convert'); // You would need to install this
                const imageBuffers = await pdf2pic.convert(pdfPath);
                
                // Process images with your existing OCRService
                const ocrResults = await Promise.all(
                    imageBuffers.map(async (buffer, index) => {
                        // Save buffer to temp file or modify OCRService to accept buffers
                        const tempPath = `temp_page_${index}.png`;
                        fs.writeFileSync(tempPath, buffer);
                        const pageText = await OCRService.extractText(tempPath);
                        fs.unlinkSync(tempPath); // Clean up
                        return pageText;
                    })
                );
                text = ocrResults.join(' ');
                */
                
                // If you don't have the conversion library yet, throw a clear error
                if (text.length === 0) {
                     throw new Error("This appears to be a scanned PDF. Please install 'pdf-img-convert' to enable OCR features.");
                }
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
