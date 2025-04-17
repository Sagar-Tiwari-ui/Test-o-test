// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDzZG2MtJb244u0g4IX59tGWATK-KGht-w",
    authDomain: "testotest-b77f3.firebaseapp.com",
    projectId: "testotest-b77f3",
    storageBucket: "testotest-b77f3.appspot.com",
    messagingSenderId: "57536899329",
    appId: "1:57536899329:web:d07442630c944086171300",
    measurementId: "G-52156S4D02"
};
firebase.initializeApp(firebaseConfig);

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');
    const signInSection = document.getElementById('signIn');
    const signUpSection = document.getElementById('signup');

    if (authModal && overlay) {
        authModal.style.display = 'none';
        overlay.style.display = 'none';
        signInSection.style.display = 'block';
        signUpSection.style.display = 'none';
    }

    // Attach event listener to Student Login button
    const studentLoginBtn = document.querySelector('.btn.secondary[onclick="showLoginModal()"]');
    if (studentLoginBtn) {
        studentLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }

    // Close modal on close button click
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideLoginModal();
            clearMessages();
        });
    });

    // Switch between Sign In and Sign Up
    document.getElementById('signUpButton').addEventListener('click', () => {
        signInSection.style.display = 'none';
        signUpSection.style.display = 'block';
        clearMessages();
    });

    document.getElementById('signInButton').addEventListener('click', () => {
        signUpSection.style.display = 'none';
        signInSection.style.display = 'block';
        clearMessages();
    });

    // Close modal on overlay click
    overlay.addEventListener('click', () => {
        hideLoginModal();
        clearMessages();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideLoginModal();
            clearMessages();
        }
    });
});

// Show/Hide Auth Modal
function showLoginModal() {
    const authModal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');
    const signInSection = document.getElementById('signIn');
    const signUpSection = document.getElementById('signup');
    
    if (authModal && overlay) {
        authModal.style.display = 'block';
        overlay.style.display = 'block';
        signInSection.style.display = 'block';
        signUpSection.style.display = 'none';
        // Focus on first input for accessibility
        const firstInput = signInSection.querySelector('input');
        if (firstInput) firstInput.focus();
    }
}

function hideLoginModal() {
    const authModal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');
    if (authModal && overlay) {
        authModal.style.display = 'none';
        overlay.style.display = 'none';
    }
}

function clearMessages() {
    const signInMessage = document.getElementById('signInMessage');
    const signUpMessage = document.getElementById('signUpMessage');
    if (signInMessage) signInMessage.style.display = 'none';
    if (signUpMessage) signUpMessage.style.display = 'none';
}

// Admin Login Function
function adminLogin() {
    const correctPasscode = "1234567890"; // 10-digit passcode
    const passcode = prompt("Please enter the 10-digit admin passcode:");
    
    if (passcode === correctPasscode) {
        window.location.href = "admin.html";
    } else {
        alert("Incorrect passcode. Access denied.");
    }
}

// Course Links
document.querySelectorAll('.course-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const courseName = btn.parentElement.querySelector('h3').textContent;
        window.location.href = `${courseName.toLowerCase().replace(/\s+/g, '-')}.html`;
    });
});

// Handle Sign In
document.getElementById('submitSignIn').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('signInMessage');

    // Basic validation
    if (!email || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }

    // Firebase authentication
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Store user data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || ''
            }));
            showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = "student-dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                default:
                    errorMessage = 'Login failed. Please try again';
            }
            showMessage(messageDiv, errorMessage, 'error');
        });
});

// Handle Sign Up
document.getElementById('submitSignUp').addEventListener('click', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const mobile = document.getElementById('mobile').value;
    const course = document.getElementById('course').value;
    const messageDiv = document.getElementById('signUpMessage');

    // Enhanced validation
    if (!firstName || !lastName || !email || !password || !mobile || !course) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }

    // Validate mobile number
    if (!isValidMobile(mobile)) {
        showMessage(messageDiv, 'Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Firebase authentication
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Store user data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: `${firstName} ${lastName}`
            }));
            // Add user details to Firestore
            return firebase.firestore().collection('Hima').doc(user.uid).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobile: mobile,
                course: course,
                createdAt: new Date(),
                status: 'active',
                studentId: generateStudentId(course),
                score: {
                    total: 0,
                    quizzes: [],
                    subjects: {
                        Mathematics: 0,
                        Chemistry: 0,
                        Biology: 0,
                        Physics: 0
                    }
                }
            });
        })
        .then(() => {
            showMessage(messageDiv, 'Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = "student-dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                default:
                    errorMessage = 'Registration failed. Please try again';
            }
            showMessage(messageDiv, errorMessage, 'error');
        });
});

// Utility Functions
function isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

function generateStudentId(course) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${course}${year}${random}`;
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'messageDiv ' + type;
}

// Input Validation
document.getElementById('mobile').addEventListener('input', (e) => {
    const mobile = e.target.value;
    if (mobile && !isValidMobile(mobile)) {
        e.target.setCustomValidity('Please enter a valid 10-digit mobile number');
    } else {
        e.target.setCustomValidity('');
    }
});

document.getElementById('mobile').addEventListener('keypress', (e) => {
    if (e.key < '0' || e.key > '9') {
        e.preventDefault();
    }
});

// Inline Styles for Forms
const style = document.createElement('style');
style.textContent = `
    .messageDiv {
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        text-align: center;
    }
    .messageDiv.error {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
    }
    .messageDiv.success {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
    }
    .input-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 15px;
    }
    .input-group select:focus {
        outline: none;
        border-color: #4CAF50;
    }
    .input-group input[type="tel"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 15px;
    }
    .input-group input[type="tel"]:focus {
        outline: none;
        border-color: #4CAF50;
    }
    .input-group input:invalid,
    .input-group select:invalid {
        border-color: #ff6b6b;
    }
    .input-group select option:first-child {
        color: #757575;
    }
`;
document.head.appendChild(style);

// Check Authentication State
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
    } else {
        console.log('User is signed out');
    }
});
