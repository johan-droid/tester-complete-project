// frontend/src/js/api.js

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
        
        if (response.status === 401) {
            removeToken();
            if (window.TesterApp) {
                window.TesterApp.currentUser = null;
                window.TesterApp.authToken = null;
            }
            window.dispatchEvent(new Event('authChange'));
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// --- ✅ FIX: Updated Endpoints to match Backend ---

// Auth functions
async function loginUser(email, password) {
    // Changed /users/login -> /auth/login
    return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function registerUser(userData) {
    // Changed /users/register -> /auth/register
    return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function getCurrentUser() {
    // Changed /users/me -> /auth/me
    return await apiRequest('/auth/me');
}

async function updateUserProfile(profileData) {
    // Changed /users/profile -> /auth/profile
    return await apiRequest('/auth/profile', {
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
    return await apiRequest(`/tests/${testId}`, {
        method: 'DELETE'
    });
}

// Question functions
async function extractQuestionsFromPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);

    const token = getToken();
    
    try {
        // Changed /ats/extract-pdf -> /questions/extract-pdf
        const response = await fetch(`${API_BASE_URL}/questions/extract-pdf`, {
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
    // Changed /ats -> /questions
    return await apiRequest('/questions', {
        method: 'POST',
        body: JSON.stringify(questionData)
    });
}

async function getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    // Changed /ats -> /questions
    return await apiRequest(`/questions?${queryString}`);
}

// Evaluation functions
async function submitTest(testData) {
    // Changed /evaluations -> /evaluation
    return await apiRequest('/evaluation/submit', {
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
        // Changed /evaluations -> /evaluation
        const response = await fetch(`${API_BASE_URL}/evaluation/handwritten`, {
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
    // Changed /evaluations -> /evaluation
    return await apiRequest(`/evaluation/results?${queryString}`);
}

// Demo data fallback
async function getDemoData() {
    return {
        success: true,
        data: {
            message: 'Demo data loaded',
            status: 'Backend connected'
        }
    };
}

// Utility functions
function getToken() {
    return localStorage.getItem('tester_token');
}

function setToken(token) {
    localStorage.setItem('tester_token', token);
    window.dispatchEvent(new Event('authChange'));
}

function removeToken() {
    localStorage.removeItem('tester_token');
    window.dispatchEvent(new Event('authChange'));
}

function isAuthenticated() {
    return !!getToken();
}

async function healthCheck() {
    try {
        // Ensure this matches the route in app.js
        const response = await fetch('http://localhost:5000/api/auth/me'); 
        // 401 is actually a success here, it means the server is running and protected the route
        if(response.status === 401 || response.ok) {
             return { success: true, message: "Backend is running" };
        }
    } catch (error) {
        return { success: false };
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('API Initialized');
});

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