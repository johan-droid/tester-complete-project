// Application constants

module.exports = {
    QUESTION_TYPES: {
        MCQ: 'mcq',
        TRUE_FALSE: 'true-false',
        SHORT_ANSWER: 'short-answer',
        DESCRIPTIVE: 'descriptive'
    },
    
    DIFFICULTY_LEVELS: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    },
    
    USER_ROLES: {
        STUDENT: 'student',
        TEACHER: 'teacher',
        ADMIN: 'admin'
    },
    
    TEST_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        ARCHIVED: 'archived'
    },
    
    RESULT_STATUS: {
        IN_PROGRESS: 'in-progress',
        COMPLETED: 'completed',
        ABANDONED: 'abandoned'
    },
    
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },
    
    FILE_LIMITS: {
        PDF_MAX_SIZE: 10 * 1024 * 1024, // 10MB
        IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
        MAX_FILE_UPLOADS: 5
    },
    
    SCORING: {
        PASSING_PERCENTAGE: 60,
        EXCELLENT_PERCENTAGE: 85,
        GOOD_PERCENTAGE: 70
    }
};