const Tesseract = require('tesseract.js');
const fs = require('fs');

class OCRService {
    static async extractText(imagePath) {
        try {
            const { data: { text } } = await Tesseract.recognize(
                imagePath,
                'eng',
                { logger: m => console.log(m) } // Remove in production
            );
            
            return this.cleanText(text);
        } catch (error) {
            throw new Error(`OCR processing error: ${error.message}`);
        }
    }

    static cleanText(text) {
        // Remove extra whitespace and clean up OCR artifacts
        return text
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static async preprocessImage(imagePath) {
        // In a real application, you would add image preprocessing:
        // - Noise reduction
        // - Contrast enhancement
        // - Deskewing
        // - Binarization
        
        // For now, return the original path
        return imagePath;
    }
}

module.exports = OCRService;