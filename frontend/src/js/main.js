// Main JavaScript for Tester Web App

// Data
const featuresData = [
    {
        icon: 'fas fa-file-pdf',
        title: 'PDF-based Question Extraction',
        description: 'Automatically extract questions from PDF documents and classify them by type and difficulty level.'
    },
    {
        icon: 'fas fa-brain',
        title: 'AI-Powered Evaluation',
        description: 'Advanced OCR and semantic analysis to evaluate handwritten answer scripts with high accuracy.'
    },
    {
        icon: 'fas fa-chart-line',
        title: 'Performance Dashboard',
        description: 'Track student progress with detailed analytics, score trends, and personalized feedback.'
    },
    {
        icon: 'fas fa-cogs',
        title: 'Customizable Tests',
        description: 'Create tailored tests based on topic, difficulty level, and number of questions.'
    },
    {
        icon: 'fas fa-lightbulb',
        title: 'Instant Feedback',
        description: 'Receive immediate feedback with explanations and source citations for better learning.'
    },
    {
        icon: 'fas fa-tasks',
        title: 'Difficulty Segmentation',
        description: 'Automatically categorize questions by difficulty to create balanced and effective tests.'
    }
];

const objectivesData = [
    {
        title: 'Automate Assessment',
        description: 'Streamline the entire process of test creation and evaluation through intelligent automation.'
    },
    {
        title: 'Enhance Accuracy',
        description: 'Improve evaluation precision for both typed and handwritten answers using advanced AI.'
    },
    {
        title: 'Personalize Learning',
        description: 'Provide adaptive feedback and customized tests based on individual student performance.'
    },
    {
        title: 'Increase Efficiency',
        description: 'Reduce manual effort and time required for test creation and evaluation by educators.'
    }
];

const teamData = [
    {
        name: 'Samikhya Sahoo',
        id: '2201114026'
    },
    {
        name: 'Swastik Ray',
        id: '2217114012'
    },
    {
        name: 'Ashutosh Sahoo',
        id: '2217114004'
    },
    {
        name: 'Rakesh Kumar Barik',
        id: '2201114021'
    }
];

const roadmapData = [
    {
        icon: 'fas fa-language',
        title: 'Multilingual Support',
        description: 'Expanding Tester\'s capabilities to support multiple languages for global educational applications.'
    },
    {
        icon: 'fas fa-mobile-alt',
        title: 'Mobile Application',
        description: 'Developing a dedicated mobile app for on-the-go test taking and evaluation.'
    },
    {
        icon: 'fas fa-robot',
        title: 'Advanced AI Integration',
        description: 'Implementing more sophisticated AI models for even more accurate answer evaluation.'
    }
];

// Application State
let currentUser = null;
let authToken = getToken(); // Initialize with token from localStorage

// Token Management
function getToken() {
    return localStorage.getItem('tester_token');
}

function setToken(token) {
    localStorage.setItem('tester_token', token);
}

function removeToken() {
    localStorage.removeItem('tester_token');
}

function isAuthenticated() {
    return !!getToken();
}

// Check authentication status on app load
async function checkAuthOnLoad() {
    const token = getToken();
    if (token) {
        try {
            // Verify token and get user data
            const userData = await verifyTokenAndGetUser();
            if (userData) {
                currentUser = userData;
                authToken = token;
                updateUIBasedOnAuth();
            } else {
                // Invalid token, clear it
                removeToken();
                currentUser = null;
                authToken = null;
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            removeToken();
            currentUser = null;
            authToken = null;
        }
    }
    updateUIBasedOnAuth();
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication status first
    await checkAuthOnLoad();
    
    // Initialize the rest of the app
    initializeApp();
    
    // Initialize event listeners
    if (typeof initEventListeners === 'function') {
        initEventListeners();
    }
    
    // Initialize parser page functionality if on parser.html
    if (window.location.pathname.includes('parser.html') || window.location.pathname.endsWith('/parser')) {
        initializePDFUpload();
    }
});

function initializeApp() {
    // Load dynamic content
    loadFeatures();
    loadObjectives();
    loadTeam();
    loadRoadmap();
    
    // Initialize animations
    initAnimations();
}

async function verifyTokenAndGetUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                return data.data.user;
            }
        } else {
            // Token is invalid, remove it
            removeToken();
            authToken = null;
            currentUser = null;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        removeToken();
        authToken = null;
        currentUser = null;
    }
}

function loadFeatures() {
    const featuresGrid = document.querySelector('.features-grid');
    
    // If features grid doesn't exist on this page, exit gracefully
    if (!featuresGrid) {
        console.log('Features grid not found on this page');
        return;
    }

    try {
        const featuresHTML = featuresData.map(feature => {
            const isPdfFeature = feature.title === 'PDF-based Question Extraction';
            return `
                <div class="feature-card ${isPdfFeature ? 'clickable-feature' : ''}" 
                     ${isPdfFeature ? 'onclick="window.location.href=\'parser.html\'"' : ''}>
                    <div class="feature-icon">
                        <i class="${feature.icon}"></i>
                    </div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                    ${isPdfFeature ? 
                        '<button class="feature-btn" onclick="window.location.href=\'parser.html\'">Try Now</button>' : 
                        ''}
                </div>
            `;
        }).join('');

        featuresGrid.innerHTML = featuresHTML;
    } catch (error) {
        console.error('Error loading features:', error);
    }
}

function loadObjectives() {
    const objectivesGrid = document.querySelector('.objectives-grid');
    if (objectivesGrid) {
        objectivesGrid.innerHTML = objectivesData.map(objective => `
            <div class="objective-card">
                <h3>${objective.title}</h3>
                <p>${objective.description}</p>
            </div>
        `).join('');
    }
}

function loadTeam() {
    const teamGrid = document.querySelector('.team-grid');
    const teamList = document.getElementById('teamList');
    
    if (teamGrid) {
        teamGrid.innerHTML = teamData.map(member => `
            <div class="team-member">
                <div class="member-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <h3>${member.name}</h3>
                <p>${member.id}</p>
            </div>
        `).join('');
    }
    
    if (teamList) {
        teamList.innerHTML = teamData.map(member => `
            <li>${member.name} - ${member.id}</li>
        `).join('');
    }
}

function loadRoadmap() {
    const roadmapContent = document.querySelector('.roadmap-content');
    if (roadmapContent) {
        roadmapContent.innerHTML = roadmapData.map((item, index) => `
            <div class="roadmap-item">
                <div class="roadmap-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div class="roadmap-text">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }
}

function initAnimations() {
    // Initialize animations using Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.log('IntersectionObserver not supported, animations disabled');
        return;
    }

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Observe other elements that should animate
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

function initEventListeners() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Auth modal functionality
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const closeButtons = document.querySelectorAll('.close');

    if (loginBtn) loginBtn.addEventListener('click', () => showAuthModal('login'));
    if (registerBtn) registerBtn.addEventListener('click', () => showAuthModal('register'));
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('register');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('login');
        });
    }

    if (closeButtons) {
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeModals);
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Demo button
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) demoBtn.addEventListener('click', showDemoAlert);

    // Header background on scroll
    window.addEventListener('scroll', handleHeaderScroll);

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
}

function handleHeaderScroll() {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '';
            header.style.backdropFilter = '';
        }
    }
}

function showAuthModal(type) {
    const modalsContainer = document.querySelector('.modals-container');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (!modalsContainer || !loginModal || !registerModal) return;
    
    modalsContainer.style.display = 'block';
    
    if (type === 'login') {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    } else {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    }
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
}

function closeModals() {
    const modals = document.querySelectorAll('.modal');
    const modalsContainer = document.querySelector('.modals-container');
    
    if (modals) {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    if (modalsContainer) {
        modalsContainer.style.display = 'none';
    }
    
    // Remove body class to allow scrolling
    document.body.classList.remove('modal-open');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading('Logging in...');
        
        // Use the API wrapper which now points to the correct /api/auth/login
        const result = await window.TesterAPI.loginUser(email, password);
        
        if (result.success) {
            console.log('Login successful!', result);
            
            // ✅ CRITICAL FIX: Use 'tester_token' to match your getToken() function
            localStorage.setItem('tester_token', result.token);
            
            // Update app state
            window.TesterApp.authToken = result.token;
            window.TesterApp.currentUser = result.data.user;
            
            showNotification('Login successful!', 'success');
            closeModals();
            
            // Force UI update
            updateUIBasedOnAuth();
            
            // Reload page to ensure all auth states are fresh (optional but recommended for stability)
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    // Basic validation
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        showLoading('Creating account...');
        const result = await registerUser({ name, email, password, role });
        
        if (result.success) {
            showNotification('Registration successful!', 'success');
            closeModals();
            currentUser = result.data.user;
            if (result.token) {
                authToken = result.token;
                setToken(authToken); // Store token in localStorage
            }
            updateUIBasedOnAuth();
            
            // Reset form
            e.target.reset();
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Registration error. Please try again.', 'error');
        console.error('Registration error:', error);
    } finally {
        hideLoading();
    }
}

function updateUIBasedOnAuth() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span class="welcome-text">Welcome, ${currentUser.name}</span>
                <div class="user-dropdown">
                    <button class="user-menu-btn">
                        <i class="fas fa-user-circle"></i>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item"><i class="fas fa-user"></i> Profile</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Settings</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for dropdown
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const dropdownContent = document.querySelector('.dropdown-content');
        const logoutBtn = document.querySelector('.logout-btn');
        
        if (userMenuBtn && dropdownContent) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownContent.classList.toggle('show');
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        });
    } else {
        authButtons.innerHTML = `
            <button id="loginBtn" class="auth-btn">Login</button>
            <button id="registerBtn" class="auth-btn primary">Sign Up</button>
        `;
        
        // Re-attach event listeners to new buttons
        document.getElementById('loginBtn').addEventListener('click', () => showAuthModal('login'));
        document.getElementById('registerBtn').addEventListener('click', () => showAuthModal('register'));
    }
}

function handleLogout(e) {
    e.preventDefault();
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        removeToken();
        authToken = null;
        currentUser = null;
        updateUIBasedOnAuth();
        showNotification('Logged out successfully', 'success');
        
        // Refresh the page to reset state
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Global logout function for parser page
function logout() {
    // Clear user data and token
    currentUser = null;
    authToken = null;
    removeToken();
    
    // Update UI
    updateUIBasedOnAuth();
    
    // Force a full page reload to ensure all components reset
    window.location.reload();
    
    // Redirect to home page if not already there
    if (!window.location.href.includes('index.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html';
    }
}

function showDemoAlert() {
    if (currentUser) {
        showNotification('Redirecting to test dashboard...', 'info');
        // In a real app, this would redirect to the dashboard
        setTimeout(() => {
            // Simulate dashboard redirect
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) {
                window.scrollTo({
                    top: dashboardSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }, 1000);
    } else {
        showNotification('Please create an account or login to access the demo features!', 'info');
        showAuthModal('register');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.remove();
        }
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                max-width: 500px;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                color: white;
            }
            
            .notification.success .notification-content {
                background: #2ecc71;
            }
            
            .notification.error .notification-content {
                background: #e74c3c;
            }
            
            .notification.info .notification-content {
                background: #3498db;
            }
            
            .notification.warning .notification-content {
                background: #f39c12;
            }
            
            .notification-message {
                flex: 1;
                margin-right: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.3s ease;
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.2);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification.hide {
                animation: slideOutRight 0.3s ease forwards;
            }
            
            .modal-open {
                overflow: hidden;
            }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Loading System
function showLoading(message = 'Loading...') {
    // Remove existing loading
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('loading-styles')) {
        const loadingStyles = document.createElement('style');
        loadingStyles.id = 'loading-styles';
        loadingStyles.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .loading-spinner {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-spinner p {
                margin: 0;
                color: #333;
                font-weight: 600;
            }
        `;
        document.head.appendChild(loadingStyles);
    }
    
    document.body.appendChild(loadingOverlay);
    document.body.classList.add('loading-active');
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
    document.body.classList.remove('loading-active');
}

// PDF Upload Functions
function openPDFUploadModal() {
    if (!currentUser) {
        showNotification('Please login to use PDF extraction feature', 'warning');
        showAuthModal('login');
        return;
    }
    
    const modal = document.getElementById('pdfUploadModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        initializePDFUpload();
    }
}

function closePDFUploadModal() {
    const modal = document.getElementById('pdfUploadModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        resetPDFUpload();
    }
}

function initializePDFUpload() {
    const fileInput = document.getElementById('pdfFileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('Please upload a PDF file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    displayFileInfo(file);
}

function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const uploadArea = document.getElementById('uploadArea');
    const extractBtn = document.getElementById('extractBtn');
    
    if (fileInfo && fileName && fileSize && uploadArea && extractBtn) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        extractBtn.disabled = false;
    }
}

function removeFile() {
    const fileInput = document.getElementById('pdfFileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadArea = document.getElementById('uploadArea');
    const extractBtn = document.getElementById('extractBtn');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
    if (extractBtn) extractBtn.disabled = true;
}

function resetPDFUpload() {
    removeFile();
    const uploadProgress = document.getElementById('uploadProgress');
    if (uploadProgress) uploadProgress.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function extractQuestions() {
    const fileInput = document.getElementById('pdfFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a PDF file', 'error');
        return;
    }
    
    // Debug: Check authentication status
    console.log('Auth check - Token exists:', !!getToken());
    console.log('Auth check - Current user:', !!currentUser);
    console.log('Auth check - isAuthenticated():', isAuthenticated());
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        showNotification('Please login to use PDF extraction feature', 'warning');
        // Redirect to login or show login modal
        if (typeof showAuthModal === 'function') {
            showAuthModal('login');
        } else {
            // If on parser page, redirect to home page with login
            window.location.href = 'index.html?login=true&redirect=parser.html';
        }
        return;
    }
    
    try {
        showUploadProgress();
        
        console.log('Starting PDF extraction...');
        console.log('File:', file.name, file.size);
        console.log('Token being sent:', getToken());
        
        const result = await window.TesterAPI.extractQuestionsFromPDF(file);
        
        console.log('Extraction result:', result);
        
        if (result.success) {
            showNotification(
                `Successfully extracted ${result.data.extractedCount} questions from PDF!`, 
                'success'
            );
            closePDFUploadModal();
            
            if (result.data.questions && result.data.questions.length > 0) {
                displayExtractedQuestions(result.data.questions);
            }
        } else {
            showNotification(result.message || 'Failed to extract questions', 'error');
        }
    } catch (error) {
        console.error('PDF extraction error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message && error.message.includes('401')) {
            showNotification('Authentication required. Please login again.', 'warning');
            removeToken();
            if (typeof showAuthModal === 'function') {
                showAuthModal('login');
            } else {
                window.location.href = 'index.html?login=true&redirect=parser.html';
            }
        } else if (error.message && error.message.includes('Failed to fetch')) {
            showNotification('Cannot connect to server. Please check if the backend is running on localhost:5000', 'error');
        } else {
            showNotification('Error extracting questions from PDF: ' + error.message, 'error');
        }
    } finally {
        hideUploadProgress();
    }
}

function showUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const extractBtn = document.getElementById('extractBtn');
    
    if (uploadProgress) uploadProgress.style.display = 'block';
    if (extractBtn) extractBtn.disabled = true;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `Processing PDF... ${Math.round(progress)}%`;
        
        if (progress >= 90) {
            clearInterval(interval);
            if (progressText) progressText.textContent = 'Extracting questions...';
        }
    }, 200);
    
    window.progressInterval = interval;
}

function hideUploadProgress() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const extractBtn = document.getElementById('extractBtn');
    
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = 'Processing PDF...';
    if (extractBtn) extractBtn.disabled = false;
}

function downloadQuestions(questions) {
    const textContent = questions.map((q, index) => {
        return `Question ${index + 1}\n${q.question || q.text || 'No question text available'}\nType: ${q.type || 'Unknown'}\nDifficulty: ${q.difficulty || 'Unknown'}\n---`;
    }).join('\n\n');
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-questions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Questions downloaded successfully!', 'success');
}

function displayExtractedQuestions(questions) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (resultsContainer) {
        // Check if we're on the parser page
        if (window.location.pathname.includes('parser.html') || window.location.pathname.endsWith('/parser')) {
            resultsContainer.innerHTML = `
                <div class="questions-list">
                    ${questions.map((q, index) => `
                        <div class="question-item">
                            <div class="question-number">Question ${index + 1}</div>
                            <div class="question-text">${q.question || q.text || 'No question text available'}</div>
                            <div class="question-meta">
                                <span class="meta-badge type-badge">${q.type || 'Unknown'}</span>
                                <span class="meta-badge difficulty-badge">${q.difficulty || 'Unknown'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <button class="extract-btn" onclick="downloadQuestions(${JSON.stringify(questions).replace(/"/g, '&quot;')})">
                        <i class="fas fa-download"></i> Download Questions
                    </button>
                </div>
            `;
        } else {
            // Original modal behavior for other pages
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content questions-modal">
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    <h2>Extracted Questions</h2>
                    <div class="questions-list">
                        ${questions.map((q, index) => `
                            <div class="question-item">
                                <h4>Question ${index + 1}</h4>
                                <p>${q.question || q.text || 'No question text available'}</p>
                                <div class="question-meta">
                                    <span class="type">Type: ${q.type || 'Unknown'}</span>
                                    <span class="difficulty">Difficulty: ${q.difficulty || 'Unknown'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'block';
        }
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for global access (if needed)
window.TesterApp = {
    currentUser,
    authToken,
    showNotification,
    showLoading,
    hideLoading,
    openPDFUploadModal,
    closePDFUploadModal
};

// Make functions globally accessible
window.openPDFUploadModal = openPDFUploadModal;
window.closePDFUploadModal = closePDFUploadModal;
window.extractQuestions = extractQuestions;
window.removeFile = removeFile;