const axios = require('axios');

class AIService {
    static async evaluateAnswer(studentAnswer, correctAnswer) {
        try {
            // In a real application, you would integrate with an AI service like:
            // - OpenAI GPT
            // - Google Natural Language
            // - Hugging Face models
            
            // Mock implementation for demonstration
            const similarity = this.calculateSimilarity(studentAnswer, correctAnswer);
            const isCorrect = similarity > 0.7;
            const marks = isCorrect ? 1 : similarity * 0.8;
            
            let feedback = '';
            if (similarity > 0.9) {
                feedback = 'Excellent answer! You have demonstrated a thorough understanding.';
            } else if (similarity > 0.7) {
                feedback = 'Good answer, but could use more detail or precision.';
            } else if (similarity > 0.5) {
                feedback = 'Partially correct. Review the key concepts.';
            } else {
                feedback = 'Needs significant improvement. Please study the topic again.';
            }

            return {
                isCorrect,
                marks: parseFloat(marks.toFixed(2)),
                similarity: parseFloat(similarity.toFixed(2)),
                feedback
            };
        } catch (error) {
            throw new Error(`AI evaluation error: ${error.message}`);
        }
    }

    static calculateSimilarity(str1, str2) {
        // Simple similarity calculation - in real app, use proper NLP
        const words1 = new Set(str1.toLowerCase().split(/\W+/));
        const words2 = new Set(str2.toLowerCase().split(/\W+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    static async identifyWeakAreas(answers) {
        // Analyze wrong answers to identify weak areas
        const wrongAnswers = answers.filter(a => !a.isCorrect);
        const weakTopics = [...new Set(wrongAnswers.map(a => a.question.topic))];
        return weakTopics.slice(0, 3); // Return top 3 weak areas
    }

    static async identifyStrengths(answers) {
        // Analyze correct answers to identify strengths
        const correctAnswers = answers.filter(a => a.isCorrect);
        const strongTopics = [...new Set(correctAnswers.map(a => a.question.topic))];
        return strongTopics.slice(0, 3); // Return top 3 strengths
    }

    static async generateRecommendations(answers) {
        const recommendations = [];
        const score = answers.filter(a => a.isCorrect).length / answers.length;

        if (score < 0.5) {
            recommendations.push('Focus on fundamental concepts');
            recommendations.push('Practice more basic questions');
            recommendations.push('Review study materials thoroughly');
        } else if (score < 0.8) {
            recommendations.push('Work on time management');
            recommendations.push('Practice advanced problems');
            recommendations.push('Focus on weak areas identified');
        } else {
            recommendations.push('Excellent performance! Maintain consistency');
            recommendations.push('Challenge yourself with higher difficulty');
            recommendations.push('Help peers with difficult concepts');
        }

        return recommendations;
    }
}

module.exports = AIService;