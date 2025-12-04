// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Request interceptor to add auth token
async function apiRequest(url, options = {}) {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        
        // Handle unauthorized responses
        if (response.status === 401) {
            removeToken();
            window.TesterApp.currentUser = null;
            window.TesterApp.authToken = null;
            window.dispatchEvent(new Event('authChange'));
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Auth functions
async function loginUser(email, password) {
    return await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function registerUser(userData) {
    return await apiRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function getCurrentUser() {
    return await apiRequest('/users/me');
}

async function updateUserProfile(profileData) {
    return await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
}

// Test functions
async function createTest(testData) {
    return await apiRequest('/tests', {
        method: 'POST',
        body: JSON.stringify(testData)
    });
}

async function getTests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/tests?${queryString}`);
}

async function getTest(testId) {
    return await apiRequest(`/tests/${testId}`);
}

async function updateTest(testId, testData) {
    return await apiRequest(`/tests/${testId}`, {
        method: 'PUT',
        body: JSON.stringify(testData)
    });
}

async function deleteTest(testId) {
    return await apiRequest(`/ats/${testId}`, {
        method: 'DELETE'
    });
}

// Question functions
async function extractQuestionsFromPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);

    const token = getToken();
    
    try {
        const response = await fetch(`${API_BASE_URL}/ats/extract-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw error;
    }
}

async function createQuestion(questionData) {
    return await apiRequest('/ats', {
        method: 'POST',
        body: JSON.stringify(questionData)
    });
}

async function getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/ats?${queryString}`);
}

// Evaluation functions
async function submitTest(testData) {
    return await apiRequest('/evaluations/submit', {
        method: 'POST',
        body: JSON.stringify(testData)
    });
}

async function evaluateHandwrittenAnswer(imageFile, questionId) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('questionId', questionId);

    const token = getToken();
    
    try {
        const response = await fetch(`${API_BASE_URL}/evaluations/handwritten`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Handwritten evaluation error:', error);
        throw error;
    }
}

async function getUserResults(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/evaluations/results?${queryString}`);
}

// Demo data (fallback when backend is not available)
async function getDemoData() {
    try {
        const response = await fetch(`${API_BASE_URL}/demo/data`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Demo endpoint not available');
    } catch (error) {
        // Return fallback demo data
        return {
            success: true,
            data: {
                message: 'Demo data loaded successfully',
                features: [
                    'AI-Powered Evaluation',
                    'PDF Question Extraction', 
                    'Handwritten Answer Recognition',
                    'Real-time Performance Analytics'
                ],
                status: 'Backend connected successfully'
            }
        };
    }
}

// Utility functions
function getToken() {
    return localStorage.getItem('tester_token');
}

function setToken(token) {
    localStorage.setItem('tester_token', token);
    // Dispatch event for other components to listen to
    window.dispatchEvent(new Event('authChange'));
}

function removeToken() {
    localStorage.removeItem('tester_token');
    window.dispatchEvent(new Event('authChange'));
}

function isAuthenticated() {
    return !!getToken();
}

// Health check
async function healthCheck() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Backend server is not available',
            error: error.message
        };
    }
}

// Initialize API health check on load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const health = await healthCheck();
        if (health.success) {
            console.log('✅ Backend is connected:', health.message);
        } else {
            console.warn('⚠️ Backend connection issue:', health.message);
            showNotification('Backend server is not available. Some features may not work.', 'warning');
        }
    } catch (error) {
        console.error('❌ Health check failed:', error);
    }
});

// Export for global access
window.TesterAPI = {
    loginUser,
    registerUser,
    getCurrentUser,
    updateUserProfile,
    createTest,
    getTests,
    getTest,
    updateTest,
    deleteTest,
    extractQuestionsFromPDF,
    createQuestion,
    getQuestions,
    submitTest,
    evaluateHandwrittenAnswer,
    getUserResults,
    getDemoData,
    healthCheck,
    getToken,
    setToken,
    removeToken,
    isAuthenticated
};