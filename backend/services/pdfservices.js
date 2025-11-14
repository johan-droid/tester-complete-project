const pdf = require('pdf-parse');
const fs = require('fs');

class PDFService {
    static async extractQuestions(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            
            // Extract text from PDF
            const text = data.text;
            
            // Simple question extraction logic
            // In a real application, you would use more sophisticated NLP
            const questions = this.parseQuestionsFromText(text);
            
            return questions;
        } catch (error) {
            throw new Error(`PDF processing error: ${error.message}`);
        }
    }

    static parseQuestionsFromText(text) {
        const questions = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentQuestion = null;
        
        for (const line of lines) {
            // Simple pattern matching for questions
            if (this.isQuestionLine(line)) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    question: line.trim(),
                    type: this.determineQuestionType(line),
                    difficulty: 'medium',
                    subject: 'General',
                    topic: 'Mixed',
                    marks: 1
                };
            } else if (currentQuestion && this.isOptionLine(line)) {
                if (!currentQuestion.options) {
                    currentQuestion.options = [];
                }
                currentQuestion.options.push({
                    text: line.trim(),
                    isCorrect: this.isCorrectOption(line)
                });
            } else if (currentQuestion && line.trim()) {
                // Assume it's part of the question or explanation
                currentQuestion.question += ' ' + line.trim();
            }
        }
        
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        return questions;
    }

    static isQuestionLine(line) {
        return /^\d+[\.\)]\s+.+\?$/.test(line.trim()) || 
               /^Q\d*[:\.]\s+.+/.test(line.trim());
    }

    static isOptionLine(line) {
        return /^[a-dA-D][\.\)]\s+.+/.test(line.trim());
    }

    static isCorrectOption(line) {
        // Simple logic - in real application, this would be more sophisticated
        return Math.random() > 0.7; // 30% chance of being correct
    }

    static determineQuestionType(line) {
        if (line.includes('?') && line.length < 100) {
            return 'mcq';
        } else if (line.includes('True') || line.includes('False')) {
            return 'true-false';
        } else if (line.length < 200) {
            return 'short-answer';
        } else {
            return 'descriptive';
        }
    }
}

module.exports = PDFService;