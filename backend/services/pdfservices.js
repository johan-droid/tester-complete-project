// backend/services/pdfservices.js

const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const pdfPoppler = require('pdf-poppler');

// --- AI Model Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function cleanAndParseJSON(text) {
    try {
        let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = clean.indexOf('[');
        const lastBracket = clean.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            clean = clean.substring(firstBracket, lastBracket + 1);
            return JSON.parse(clean);
        }
        return [];
    } catch (e) {
        console.error("JSON Parse Failed:", e.message);
        return [];
    }
}

class PDFService {

    /**
     * Strategy 1: DIGITAL TEXT
     */
    static async processViaText(text) {
        console.log("⚡ Strategy: Processing as Digital Text");
        // FIXED: Used standard model name 'gemini-1.5-flash'
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            You are an expert teacher. Create a quiz based on the text below.
            Input Text: ${text.substring(0, 30000)}
            
            REQUIREMENTS:
            1. Generate 5-10 unique questions.
            2. Vary difficulty (Easy, Medium, Hard).
            3. Output strictly a JSON array.
        `;

        try {
            const result = await model.generateContent(prompt);
            return cleanAndParseJSON(result.response.text());
        } catch (error) {
            // FIXED: Added full error logging to debug console
            console.error("Text Processing Error - Full Details:", error);
            return []; // Return empty to trigger fallback to Vision
        }
    }

    /**
     * Strategy 2: VISION / IMAGE (Robust Poppler Method)
     */
    static async processViaVision(pdfPath) {
        console.log("👁️ Strategy: Processing as Images (Vision - Poppler)");
        
        const outputDir = path.dirname(pdfPath);
        const uniquePrefix = `img_${Date.now()}_`; 
        
        try {
            const opts = {
                format: 'jpeg',
                out_dir: outputDir,
                out_prefix: uniquePrefix,
                page: null 
            };

            // 1. Convert PDF to Images
            await pdfPoppler.convert(pdfPath, opts);

            // 2. Scan directory for the generated images
            const files = fs.readdirSync(outputDir);
            const imageFiles = files.filter(file => file.startsWith(uniquePrefix) && file.endsWith('.jpg'));

            if (imageFiles.length === 0) {
                console.warn("Poppler ran but no image files were found. Ensure poppler-utils is installed on the server.");
                return [];
            }

            // Limit to first 3 images to save AI token costs
            const imagesToProcess = imageFiles.slice(0, 3);
            const imageParts = [];

            for (const file of imagesToProcess) {
                const fullPath = path.join(outputDir, file);
                const buffer = fs.readFileSync(fullPath);
                
                imageParts.push({
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType: "image/jpeg"
                    }
                });

                // Cleanup immediately
                try { fs.unlinkSync(fullPath); } catch(e) {}
            }

            // Cleanup remaining images if any
            imageFiles.slice(3).forEach(file => {
                try { fs.unlinkSync(path.join(outputDir, file)); } catch(e) {}
            });

            // 3. Send to Gemini
            // FIXED: Used standard model name 'gemini-1.5-flash'
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
                Analyze these exam paper images.
                Extract 5 to 8 practice questions from the visible content.
                Ignore watermarks. Return valid JSON array.
            `;

            const result = await model.generateContent([prompt, ...imageParts]);
            return cleanAndParseJSON(result.response.text());

        } catch (error) {
            console.error("Vision Processing Error:", error);
            return [];
        }
    }

    /**
     * Main Entry Point
     */
    static async extractQuestions(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            const text = data.text.trim();

            let questions = [];

            // Decision Logic
            if (text.length > 100) {
                questions = await this.processViaText(text);
            }
            
            // If Text failed (returned empty array), try Vision
            if (!questions || questions.length === 0) {
                console.log("⚠️ Text extraction failed or yielded 0 questions. Switching to Vision...");
                questions = await this.processViaVision(pdfPath);
            }

            // Final check
            if (!questions || questions.length === 0) {
                return [{
                    question: "We could not extract questions. Please check server logs for API errors.",
                    type: "short-answer",
                    difficulty: "easy",
                    subject: "Error",
                    topic: "System",
                    marks: 0
                }];
            }

            return questions;

        } catch (error) {
            console.error("PDF Service Fatal Error:", error);
            return [{
                question: `Error: ${error.message}`,
                type: "short-answer",
                difficulty: "easy",
                subject: "Error",
                topic: "System",
                marks: 0
            }];
        }
    }
}

module.exports = PDFService;