const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all reveal elements
document.querySelectorAll('.reveal, .stat-box, .feature-card, .step').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Parallax effect for hero visual
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Counter animation for stats
const animateCounter = (element, target, suffix = '') => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 20);
};

// Dual counter animation for patterns like "24X7"
const animateDualCounter = (element, target1, separator, target2) => {
    let current1 = 0;
    let current2 = 0;
    const increment1 = target1 / 100;
    const increment2 = target2 / 100;
    const timer = setInterval(() => {
        current1 += increment1;
        current2 += increment2;
        if (current1 >= target1 && current2 >= target2) {
            element.textContent = target1 + separator + target2;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current1) + separator + Math.floor(current2);
        }
    }, 20);
};

// Trigger counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const numberElement = entry.target.querySelector('.stat-number');
            if (numberElement) {
                const text = numberElement.textContent.trim();
                
                // Check for dual number pattern like "24X7"
                const dualMatch = text.match(/^(\d+)([^\d]+)(\d+)$/);
                if (dualMatch) {
                    const num1 = parseInt(dualMatch[1]);
                    const separator = dualMatch[2];
                    const num2 = parseInt(dualMatch[3]);
                    animateDualCounter(numberElement, num1, separator, num2);
                } else {
                    // Single number with suffix pattern
                    const match = text.match(/^(\d+)(.*)$/);
                    if (match) {
                        const number = parseInt(match[1]);
                        const suffix = match[2];
                        if (!isNaN(number)) {
                            animateCounter(numberElement, number, suffix);
                        }
                    }
                }
            }
            entry.target.dataset.animated = 'true';
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-box').forEach(box => {
    statsObserver.observe(box);
});

// ===== PAGE TRANSITION ANIMATION =====

// Create transition overlay HTML
function createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
        <div class="transition-particle-container">
            <div class="transition-particle"></div>
            <div class="transition-particle"></div>
            <div class="transition-particle"></div>
            <div class="transition-particle"></div>
        </div>
        <div class="transition-content">\n            <h2 class="transition-title">Loading Your Dashboard</h2>
            
            <div class="transition-graph-container">
                <div class="transition-graph">
                    <svg viewBox="0 0 400 200" style="width: 100%; height: 100%;">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.6" />
                                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                            </linearGradient>
                        </defs>
                        
                        <!-- Graph Path -->
                        <path class="graph-path" d="M 0 160 Q 60 140, 80 120 T 160 80 T 240 50 T 320 20 L 360 10" />
                        
                        <!-- Fill area under graph -->
                        <path class="graph-fill" d="M 0 160 Q 60 140, 80 120 T 160 80 T 240 50 T 320 20 L 360 10 L 360 180 L 0 180 Z" />
                    </svg>
                    
                    <!-- Axis lines -->
                    <div class="graph-axis">
                        <div class="axis-line axis-y"></div>
                        <div class="axis-line axis-x"></div>
                        
                        <!-- Y-axis labels -->
                        <span class="graph-label-y" style="top: 0;">100%</span>
                        <span class="graph-label-y" style="top: 50%;">75%</span>
                        <span class="graph-label-y" style="bottom: 0;">50%</span>
                        
                        <!-- X-axis labels -->
                        <span class="graph-label-x" style="left: 0;">Week 1</span>
                        <span class="graph-label-x" style="left: 33%;">Week 2</span>
                        <span class="graph-label-x" style="left: 66%;">Week 3</span>
                        <span class="graph-label-x" style="right: 0;">Week 4</span>
                    </div>
                    
                    <!-- Animated dots -->
                    <div class="graph-dots">
                        <div class="graph-dot"></div>
                        <div class="graph-dot"></div>
                        <div class="graph-dot"></div>
                        <div class="graph-dot"></div>
                        <div class="graph-dot"></div>
                        <div class="graph-dot"></div>
                    </div>
                </div>
            </div>
            
            <div class="transition-insights">
                <div class="insight-item">
                    <div class="insight-icon">
                        <i class="fi fi-rr-chart-line-up"></i>
                    </div>
                    <div class="insight-text">
                        Real-time attendance tracking across all subjects
                    </div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon">
                        <i class="fi fi-rr-target"></i>
                    </div>
                    <div class="insight-text">
                        AI-powered predictions to maintain 75% attendance
                    </div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon">
                        <i class="fi fi-rr-bulb"></i>
                    </div>
                    <div class="insight-text">
                        Personalized insights and actionable recommendations
                    </div>
                </div>
            </div>
            
            <div class="transition-progress">
                <div class="progress-label">
                    <span>Initializing Dashboard...</span>
                    <span class="progress-percentage" id="progressPercentage">0%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

// Animate progress percentage
function animateProgressText(element, duration = 2500) {
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        element.textContent = Math.floor(progress) + '%';
        
        if (progress < 100) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Handle page transition
function handlePageTransition(targetUrl) {
    // Create and show overlay
    const overlay = createTransitionOverlay();
    
    // Small delay for DOM insertion
    setTimeout(() => {
        overlay.classList.add('active');
        
        // Animate progress text
        const progressText = overlay.querySelector('#progressPercentage');
        if (progressText) {
            animateProgressText(progressText, 2500);
        }
    }, 50);
    
    // Navigate after animation completes
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 3000);
}

// Add event listeners to all dashboard links
function initTransitionLinks() {
    const dashboardLinks = document.querySelectorAll('a[href="/app"]');
    
    dashboardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if it's an internal navigation
            if (this.hostname === window.location.hostname) {
                e.preventDefault();
                handlePageTransition(this.href);
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTransitionLinks();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initTransitionLinks();
}
