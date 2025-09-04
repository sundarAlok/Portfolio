// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.9)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.05)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

const typewriterTexts = ['Ethical Hacker', 'Penetration Tester', 'Network Security Analyst', 'Cybersecurity Enthusiast', 'Security Researcher'];
let currentIndex = 0;
let currentText = '';
let isDeleting = false;
let typewriterElement = document.querySelector('.typewriter');

function typeWriter() {
    if (!typewriterElement) return;

    const fullText = typewriterTexts[currentIndex];

    if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
    } else {
        currentText = fullText.substring(0, currentText.length + 1);
    }

    typewriterElement.textContent = currentText + (isDeleting ? '' : ' |');

    let speed = isDeleting ? 100 : 200;

    if (!isDeleting && currentText === fullText) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % typewriterTexts.length;
        speed = 500;
    }

    setTimeout(typeWriter, speed);
}

setTimeout(typeWriter, 1000);

// Parallax effect for particles
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        const speed = 0.5 + (index * 0.1);
        particle.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Contact Form Validation and Submission
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.getElementById('btnText');
        this.btnIcon = document.getElementById('btnIcon');
        this.formStatus = document.getElementById('formStatus');

        // Rate limiting
        this.submissionCount = 0;
        this.lastSubmissionTime = 0;
        this.maxSubmissionsPerHour = 5;

        // Math captcha
        this.currentMathAnswer = null;

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupValidation();
        }
    }

    setupValidation() {
        // Real-time validation
        const inputs = ['name', 'email', 'subject', 'message'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', () => this.validateField(id));
                input.addEventListener('input', () => this.clearFieldError(id));
            }
        });

        // Add real-time email validation for indicators
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', () => this.validateEmailRealtime());
        }

        // Math answer field validation
        const mathAnswerElement = document.getElementById('mathAnswer');
        if (mathAnswerElement) {
            mathAnswerElement.addEventListener('input', () => this.clearFieldError('mathAnswer'));
        }

        // Captcha validation
        const captcha = document.getElementById('captcha');
        if (captcha) {
            captcha.addEventListener('change', () => this.validateCaptcha());
        }

        // Math captcha setup
        this.setupMathCaptcha();

        // Add refresh button functionality
        const refreshBtn = document.getElementById('refreshMathBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.setupMathCaptcha());
        }
    }

    async validateField(fieldId) {
        const input = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        let isValid = true;
        let errorMessage = '';

        if (!input || !errorDiv) return true;

        const value = input.value.trim();

        switch (fieldId) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name can only contain letters and spaces';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    // Show invalid indicator but don't fail validation
                    this.updateEmailIndicator(false);
                } else {
                    // Wait for email validation API response
                    const isFake = await this.isFakeEmail(value);
                    if (isFake) {
                        // Show invalid indicator but don't fail validation
                        this.updateEmailIndicator(false);
                    } else {
                        // Email is valid according to API
                        this.updateEmailIndicator(true);
                    }
                }
                // Always return true for email to allow form submission
                isValid = true;
                break;

            case 'subject':
                if (value.length < 5) {
                    isValid = false;
                    errorMessage = 'Subject must be at least 5 characters long';
                }
                break;

            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                }
                break;
        }

        if (!isValid) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            input.classList.add('error');
        } else {
            errorDiv.style.display = 'none';
            input.classList.remove('error');
        }

        return isValid;
    }

    validateCaptcha() {
        const captcha = document.getElementById('captcha');
        const errorDiv = document.getElementById('captchaError');

        if (!captcha.checked) {
            errorDiv.textContent = 'Please verify that you are not a robot';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
            return true;
        }
    }

    clearFieldError(fieldId) {
        const errorDiv = document.getElementById(fieldId + 'Error');
        const input = document.getElementById(fieldId);

        if (errorDiv && input) {
            errorDiv.style.display = 'none';
            input.classList.remove('error');
        }

        // Clear math error if math answer field is being edited
        if (fieldId === 'mathAnswer') {
            const mathErrorDiv = document.getElementById('mathError');
            if (mathErrorDiv) {
                mathErrorDiv.style.display = 'none';
            }
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        // Reset counter if more than an hour has passed
        if (now - this.lastSubmissionTime > oneHour) {
            this.submissionCount = 0;
        }

        if (this.submissionCount >= this.maxSubmissionsPerHour) {
            return false;
        }

        return true;
    }

    sanitizeInput(input) {
        // Basic XSS prevention
        return input
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Email validation using AbstractAPI with XMLHttpRequest
    isFakeEmail(email) {
        return new Promise((resolve) => {
            const validationUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=beb8b40e692144619ced85b5d1553a96&email=${encodeURIComponent(email)}`;
            const reputationUrl = `https://emailreputation.abstractapi.com/v1/?api_key=3fd7bb39887346f6acee8b57d2719804&email=${encodeURIComponent(email)}`;

            let validationResult = null;
            let reputationResult = null;
            let completedChecks = 0;

            const checkCompletion = () => {
                completedChecks++;
                if (completedChecks === 2) {
                    // Both APIs have responded
                    const isValid = this.processEmailValidationResults(validationResult, reputationResult);
                    this.updateEmailIndicator(isValid);
                    resolve(!isValid); // Return true if fake, false if valid
                }
            };

            // Email Validation API
            this.httpGetAsync(validationUrl, (responseText) => {
                try {
                    validationResult = JSON.parse(responseText);
                } catch (e) {
                    console.error('Email validation API parse error:', e);
                    validationResult = null;
                }
                checkCompletion();
            });

            // Email Reputation API
            this.httpGetAsync(reputationUrl, (responseText) => {
                try {
                    reputationResult = JSON.parse(responseText);
                } catch (e) {
                    console.error('Email reputation API parse error:', e);
                    reputationResult = null;
                }
                checkCompletion();
            });
        });
    }

    // XMLHttpRequest helper function
    httpGetAsync(url, callback) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    callback(xmlHttp.responseText);
                } else {
                    console.error('API request failed:', xmlHttp.status, xmlHttp.statusText);
                    callback('{"error": "API request failed"}');
                }
            }
        };
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    // Process validation results from both APIs
    processEmailValidationResults(validationData, reputationData) {
        // Check validation API results
        let isValid = false;
        if (validationData && !validationData.error) {
            // Email is valid if deliverable and not disposable
            isValid = validationData.deliverability === 'DELIVERABLE' &&
                     (!validationData.is_disposable_email || !validationData.is_disposable_email.value);
        }

        // Check reputation API results (additional validation)
        if (reputationData && !reputationData.error && isValid) {
            // If reputation score is available and low, mark as suspicious
            if (reputationData.reputation && reputationData.reputation < 0.5) {
                isValid = false;
            }
        }

        return isValid;
    }

    // Real-time email validation for indicators
    async validateEmailRealtime() {
        const emailInput = document.getElementById('email');
        if (!emailInput) return;

        const value = emailInput.value.trim();
        if (value === '') {
            // Hide indicator if field is empty
            const indicator = document.getElementById('emailIndicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            // Show invalid indicator for invalid format
            this.updateEmailIndicator(false);
        } else {
            // Show loading state or try validation
            this.updateEmailIndicator(null); // Loading state
            try {
                const isFake = await this.isFakeEmail(value);
                this.updateEmailIndicator(!isFake);
            } catch (error) {
                // If API fails, show valid by default
                this.updateEmailIndicator(true);
            }
        }
    }

    // Update email input indicator
    updateEmailIndicator(isValid) {
        const emailInput = document.getElementById('email');
        let indicator = document.getElementById('emailIndicator');

        if (!emailInput) return;

        // If indicator does not exist, create it
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.id = 'emailIndicator';
            indicator.className = 'email-indicator';
            emailInput.appendChild(indicator);
        }

        // Remove existing classes
        indicator.className = 'email-indicator';

        if (isValid === null) {
            // Loading state
            indicator.classList.add('loading');
            indicator.textContent = '⏳';
        } else if (isValid) {
            indicator.classList.add('valid');
            indicator.textContent = '✓';
        } else {
            indicator.classList.add('invalid');
            indicator.textContent = '!';
        }

        indicator.style.display = 'inline';
    }

    // Math captcha generation
    generateMathProblem() {
        const operations = ['+', '-', '*', '/'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let num1, num2, answer;

        switch (operation) {
            case '+':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                break;
            case '/':
                answer = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 9) + 2;
                num1 = answer * num2;
                break;
        }

        return {
            problem: `${num1} ${operation} ${num2}`,
            answer: answer.toString()
        };
    }

    // Validate math answer
    validateMathAnswer(userAnswer, correctAnswer) {
        return userAnswer.trim() === correctAnswer;
    }

    // Setup math captcha
    setupMathCaptcha() {
        const mathProblemElement = document.getElementById('mathProblem');
        const mathAnswerElement = document.getElementById('mathAnswer');

        if (mathProblemElement && mathAnswerElement) {
            const problem = this.generateMathProblem();
            // Remove the "Solve this math problem to prove you're human:" line by only showing the problem
            mathProblemElement.textContent = `${problem.problem}`;
            this.currentMathAnswer = problem.answer;

            // Clear previous answer
            mathAnswerElement.value = '';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check rate limiting
        if (!this.checkRateLimit()) {
            this.showStatus('Too many submissions. Please try again later.', 'error');
            return;
        }

        // Validate all fields (async for email validation)
        const fields = ['name', 'email', 'subject', 'message'];
        let isFormValid = true;

        for (const field of fields) {
            const isFieldValid = await this.validateField(field);
            if (!isFieldValid) {
                isFormValid = false;
            }
        }

        if (!this.validateCaptcha()) {
            isFormValid = false;
        }

        // Validate math captcha
        const mathAnswerElement = document.getElementById('mathAnswer');
        if (mathAnswerElement && !this.validateMathAnswer(mathAnswerElement.value, this.currentMathAnswer)) {
            isFormValid = false;
            const mathErrorDiv = document.getElementById('mathError');
            if (mathErrorDiv) {
                mathErrorDiv.textContent = 'Incorrect answer to the math problem';
                mathErrorDiv.style.display = 'block';
            }
        }

        if (!isFormValid) {
            this.showStatus('Please correct the errors above.', 'error');
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: this.sanitizeInput(formData.get('name')),
            email: this.sanitizeInput(formData.get('email')),
            subject: this.sanitizeInput(formData.get('subject')),
            message: this.sanitizeInput(formData.get('message')),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };

        // Update button state
        this.setLoadingState(true);

        try {
            // Send email using Formspree
            await this.sendEmail(data);

            this.showStatus('Message sent successfully! Thank you for contacting me.', 'success');
            this.form.reset();
            this.setupMathCaptcha(); // Reset math captcha
            this.submissionCount++;
            this.lastSubmissionTime = Date.now();

        } catch (error) {
            console.error('Email sending failed:', error);
            this.showStatus('Failed to send message. Please try again or contact me directly.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async sendEmail(data) {
        // Primary method: Web3Forms (more reliable, no template setup needed)
        console.log('Sending email via Web3Forms...');
        return await this.sendEmailWeb3Forms(data);
    }

    async sendEmailWeb3Forms(data) {
        // Web3Forms fallback - Free service for static sites
        const web3formsEndpoint = 'https://api.web3forms.com/submit';

        const formData = new FormData();
        formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'); // Get from https://web3forms.com/
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        formData.append('from_name', 'Portfolio Contact Form');
        formData.append('redirect', 'false'); // Prevent redirect

        try {
            const response = await fetch(web3formsEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Web3Forms submission successful:', result);
            return { success: true, result };
        } catch (error) {
            console.error('Web3Forms failed:', error);
            throw error;
        }
    }

    async sendEmailFallback(data) {
        // Netlify Forms fallback (if deployed on Netlify)
        const isNetlify = window.location.hostname.includes('netlify');
        if (isNetlify) {
            return await this.sendEmailNetlify(data);
        }

        // Formspree fallback as last resort
        const formspreeEndpoint = 'https://formspree.io/f/xdknqkgj';

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        formData.append('timestamp', data.timestamp);
        formData.append('userAgent', data.userAgent);
        formData.append('referrer', data.referrer);

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Formspree submission successful:', result);
            return { success: true, result };
        } catch (error) {
            console.error('All email services failed:', error);
            throw error;
        }
    }

    async sendEmailNetlify(data) {
        // Netlify Forms submission
        const formData = new FormData();
        formData.append('form-name', 'contact');
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        formData.append('timestamp', data.timestamp);

        try {
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Netlify Forms submission successful');
            return { success: true };
        } catch (error) {
            console.error('Netlify Forms failed:', error);
            throw error;
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.btnText.textContent = 'Sending...';
            this.btnIcon.className = 'fas fa-spinner fa-spin';
        } else {
            this.submitBtn.disabled = false;
            this.btnText.textContent = 'Send Message';
            this.btnIcon.className = 'fas fa-paper-plane';
        }
    }

    showStatus(message, type) {
        this.formStatus.textContent = message;
        this.formStatus.className = `form-status ${type}`;
        this.formStatus.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.formStatus.style.display = 'none';
        }, 5000);
    }
}

// Initialize contact form handler
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});

// Add hover effect to skill items
document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.05) rotate(2deg)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Add click effect to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});
