// backend/services/pdfservices.js

const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const OCRService = require('./ocrServices');
const pdf2pic = require('pdf2pic'); // For converting PDF to images for OCR
const { v4: uuidv4 } = require('uuid'); // For generating unique filenames

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
        const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings });
        
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
    static async convertPdfToImages(pdfPath) {
        try {
            const outputDir = path.join(path.dirname(pdfPath), 'temp_images');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const options = {
                density: 300,            // Output image DPI
                saveFilename: 'page',    // Output file name
                savePath: outputDir,     // Output directory
                format: 'png',           // Output format
                width: 1654,             // Width in pixels (A4 at 300 DPI)
                height: 2339             // Height in pixels (A4 at 300 DPI)
            };

            const convert = pdf2pic.fromPath(pdfPath, options);
            const result = await convert.bulk(-1, { responseType: 'image' });
            
            return result.map(page => page.path);
        } catch (error) {
            console.error('Error converting PDF to images:', error);
            throw error;
        }
    }

    static async extractTextFromScannedPDF(pdfPath) {
        try {
            const imagePaths = await this.convertPdfToImages(pdfPath);
            let fullText = '';
            
            for (const imagePath of imagePaths) {
                const text = await OCRService.extractText(imagePath);
                fullText += text + '\n\n';
                // Clean up the temporary image file
                fs.unlinkSync(imagePath);
            }
            
            // Clean up the temp directory
            const tempDir = path.join(path.dirname(pdfPath), 'temp_images');
            if (fs.existsSync(tempDir)) {
                fs.rmdirSync(tempDir, { recursive: true });
            }
            
            return fullText.trim();
        } catch (error) {
            console.error('Error processing scanned PDF:', error);
            throw new Error('Failed to process scanned PDF');
        }
    }

    static async extractQuestions(pdfPath) {
        try {
            let text = '';
            let isScannedPDF = false;
            
            // First try to extract text directly
            try {
                const dataBuffer = fs.readFileSync(pdfPath);
                const data = await pdf(dataBuffer);
                text = data.text.trim();
                console.log(`PDF Text Length: ${text.length} characters`);
                
                if (text.length < 50) {
                    console.warn("⚠️ Text layer is empty or too small. This might be a scanned PDF. Attempting OCR...");
                    isScannedPDF = true;
                    text = await this.extractTextFromScannedPDF(pdfPath);
                    console.log(`Extracted ${text.length} characters using OCR.`);
                }
            } catch (error) {
                console.warn('Error extracting text directly, trying OCR:', error);
                isScannedPDF = true;
                text = await this.extractTextFromScannedPDF(pdfPath);
            }

            if (!text || text.trim().length === 0) {
                throw new Error('Failed to extract any text from the document');
            }

            // --- Chunking & Parallel Processing ---
            const chunks = chunkText(text);
            console.log(`Split PDF into ${chunks.length} chunks.`);

            // Process chunks in parallel (be mindful of API rate limits)
            const chunkPromises = chunks.map((chunk, index) => 
                callAIToExtractQuestions(chunk, index, chunks.length)
            );
            
            const results = await Promise.all(chunkPromises);
            
            // Flatten the array of arrays into a single list of questions
            let allQuestions = results.flat();
            
            // Remove any empty or invalid questions
            allQuestions = allQuestions.filter(q => 
                q && 
                q.question && 
                q.question.trim().length > 0 && 
                q.type && 
                q.difficulty
            );
            
            console.log(`Extracted total of ${allQuestions.length} valid questions.`);
            
            // If no questions were extracted, provide a helpful message
            if (allQuestions.length === 0) {
                allQuestions.push({
                    question: isScannedPDF ? 
                        "The document was processed but no questions could be extracted. The content might not be suitable for question generation." :
                        "No questions could be extracted from the document. The content might not be suitable for question generation.",
                    type: "short-answer",
                    difficulty: "easy",
                    subject: "System",
                    topic: "Information",
                    marks: 0
                });
            }
            
            return allQuestions;

        } catch (error) {
            throw new Error(`PDF processing error: ${error.message}`);
        }
    }
}

module.exports = PDFService;
