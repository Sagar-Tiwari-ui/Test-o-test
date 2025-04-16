// DOM Elements
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorModal = document.getElementById('errorModal');
const successModal = document.getElementById('successModal');

// Form Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const registerEmailInput = document.getElementById('rEmail');
const registerPasswordInput = document.getElementById('rPassword');
const mobileInput = document.getElementById('MNumber');

// Form Switching Animation
function switchForm(hideForm, showForm) {
    hideForm.style.opacity = '0';
    setTimeout(() => {
        hideForm.style.display = 'none';
        showForm.style.display = 'block';
        setTimeout(() => {
            showForm.style.opacity = '1';
        }, 50);
    }, 300);
}

// Event Listeners for Form Switching
signUpButton.addEventListener('click', function() {
    switchForm(signInForm, signUpForm);
});

signInButton.addEventListener('click', function() {
    switchForm(signUpForm, signInForm);
});

// Form Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}

function validateMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

// Input Validation Feedback
function showInputError(input, message) {
    const parentDiv = input.parentElement;
    const errorDiv = parentDiv.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    if (!parentDiv.querySelector('.error-message')) {
        parentDiv.appendChild(errorDiv);
    }
    input.classList.add('error');
}

function removeInputError(input) {
    const parentDiv = input.parentElement;
    const errorDiv = parentDiv.querySelector('.error-message');
    if (errorDiv) {
        parentDiv.removeChild(errorDiv);
    }
    input.classList.remove('error');
}

// Real-time Input Validation
emailInput.addEventListener('input', function() {
    if (!validateEmail(this.value)) {
        showInputError(this, 'Please enter a valid email address');
    } else {
        removeInputError(this);
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value.length < 8) {
        showInputError(this, 'Password must be at least 8 characters long');
    } else {
        removeInputError(this);
    }
});

registerEmailInput.addEventListener('input', function() {
    if (!validateEmail(this.value)) {
        showInputError(this, 'Please enter a valid email address');
    } else {
        removeInputError(this);
    }
});

registerPasswordInput.addEventListener('input', function() {
    if (!validatePassword(this.value)) {
        showInputError(this, 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers');
    } else {
        removeInputError(this);
    }
});

mobileInput.addEventListener('input', function() {
    if (!validateMobile(this.value)) {
        showInputError(this, 'Please enter a valid 10-digit mobile number');
    } else {
        removeInputError(this);
    }
});

// Remember Me Functionality
const rememberMeCheckbox = document.getElementById('rememberMe');

rememberMeCheckbox.addEventListener('change', function() {
    if (this.checked) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
    }
});

// Check if user was remembered
window.addEventListener('load', function() {
    if (localStorage.getItem('rememberMe') === 'true') {
        rememberMeCheckbox.checked = true;
        // You can also auto-fill the email if stored
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            emailInput.value = savedEmail;
        }
    }
});

// Modal Handling
function showModal(modal, message) {
    const messageElement = modal.querySelector('p');
    messageElement.textContent = message;
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Close button functionality for modals
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Loading Spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Password Visibility Toggle
function addPasswordToggle(passwordInput) {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'password-toggle';
    toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    
    passwordInput.parentElement.appendChild(toggleButton);
    
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
}

// Add password visibility toggle to both password fields
addPasswordToggle(passwordInput);
addPasswordToggle(registerPasswordInput);

// Add necessary styles
const style = document.createElement('style');
style.textContent = `
    .input-group { position: relative; }
    .error-message { 
        color: red; 
        font-size: 0.8em; 
        margin-top: 5px; 
    }
    .error { 
        border-color: red !important; 
    }
    .password-toggle {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
    }
    .container {
        transition: opacity 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);
