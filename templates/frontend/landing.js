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
