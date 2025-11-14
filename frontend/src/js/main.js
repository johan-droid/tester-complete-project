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
let authToken = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check authentication status
    checkAuthStatus();
    
    // Load dynamic content
    loadFeatures();
    loadObjectives();
    loadTeam();
    loadRoadmap();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize animations
    initAnimations();
    
    // Update UI based on auth status
    updateUIBasedOnAuth();
}

function checkAuthStatus() {
    const token = getToken();
    if (token) {
        authToken = token;
        // Verify token and get user data
        verifyTokenAndGetUser();
    }
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
                currentUser = data.data.user;
                updateUIBasedOnAuth();
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
    if (featuresGrid) {
        featuresGrid.innerHTML = featuresData.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
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
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading('Logging in...');
        const result = await loginUser(email, password);
        
        if (result.success) {
            showNotification('Login successful!', 'success');
            closeModals();
            currentUser = result.data.user;
            authToken = result.token;
            updateUIBasedOnAuth();
            
            // Reset form
            e.target.reset();
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Login error. Please try again.', 'error');
        console.error('Login error:', error);
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
            authToken = result.token;
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
    hideLoading
};