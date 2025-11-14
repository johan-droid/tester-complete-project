// Animation functionality
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                
                // Add specific animations for different elements
                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                } else if (entry.target.classList.contains('team-member')) {
                    entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                } else {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .objective-card, .team-member, .roadmap-item').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
    
    // Add hover effects programmatically
    addHoverEffects();
    
    // Add loading animation
    addLoadingAnimation();
}

function addHoverEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.cta-button, .auth-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Only create ripple for primary buttons, not close buttons
            if (this.classList.contains('close') || this.classList.contains('notification-close')) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function addLoadingAnimation() {
    // Add CSS for animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .cta-button, .auth-btn {
            position: relative;
            overflow: hidden;
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Fade in animation for page load */
        .hero-content, .section-title {
            animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Pulse animation for demo button */
        .cta-button.secondary {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
        }
    `;
    document.head.appendChild(animationStyles);
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are loaded
    setTimeout(initAnimations, 100);
});