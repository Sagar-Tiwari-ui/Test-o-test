// Show/Hide Auth Modal
function showLoginModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('signIn').style.display = 'block';
    document.getElementById('signup').style.display = 'none';
}

// Close Modal
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('authModal').style.display = 'none';
        // Clear error messages when closing
        document.getElementById('signInMessage').style.display = 'none';
        document.getElementById('signUpMessage').style.display = 'none';
    }
});

// Switch between Sign In and Sign Up
document.getElementById('signUpButton').onclick = function() {
    document.getElementById('signIn').style.display = 'none';
    document.getElementById('signup').style.display = 'block';
    // Clear error messages when switching
    document.getElementById('signInMessage').style.display = 'none';
    document.getElementById('signUpMessage').style.display = 'none';
}

document.getElementById('signInButton').onclick = function() {
    document.getElementById('signup').style.display = 'none';
    document.getElementById('signIn').style.display = 'block';
    // Clear error messages when switching
    document.getElementById('signInMessage').style.display = 'none';
    document.getElementById('signUpMessage').style.display = 'none';
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
    btn.onclick = function(e) {
        e.preventDefault();
        const courseName = this.parentElement.querySelector('h3').textContent;
        window.location.href = `${courseName.toLowerCase().replace(/\s+/g, '-')}.html`;
    }
});

// Handle Sign In
document.getElementById('submitSignIn').onclick = function(e) {
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
            // Successful login
            const user = userCredential.user;
            showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = "student-dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            // Handle specific error cases
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
}

// Handle Sign Up
document.getElementById('submitSignUp').onclick = function(e) {
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
            // Add user details to Firestore with additional fields
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
                        // You can customize this based on your courses
                        Mathematics: 0,
                        Chemistry: 0,
                        Biology: 0,
                        Physics: 0,
                        // Add more subjects as needed
                    }
                }
            });
        })

        .then(() => {
            showMessage(messageDiv, 'Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = "homepage.html";
            }, 1500);
        })
        .catch((error) => {
            // Handle specific error cases
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
}

// Utility function to validate mobile number
function isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

// Utility function to generate student ID
function generateStudentId(course) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${course}${year}${random}`;
}

// Utility function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'messageDiv ' + type;
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById('authModal')) {
        document.getElementById('authModal').style.display = 'none';
        // Clear error messages
        document.getElementById('signInMessage').style.display = 'none';
        document.getElementById('signUpMessage').style.display = 'none';
    }
}

// Add input validation listeners
document.getElementById('mobile').addEventListener('input', function(e) {
    const mobile = e.target.value;
    if (mobile && !isValidMobile(mobile)) {
        e.target.setCustomValidity('Please enter a valid 10-digit mobile number');
    } else {
        e.target.setCustomValidity('');
    }
});

// Prevent non-numeric input in mobile field
document.getElementById('mobile').addEventListener('keypress', function(e) {
    if (e.key < '0' || e.key > '9') {
        e.preventDefault();
    }
});

// Add CSS styles
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
        // User is signed in
        console.log('User is signed in:', user.email);
    } else {
        // User is signed out
        console.log('User is signed out');
    }
});
