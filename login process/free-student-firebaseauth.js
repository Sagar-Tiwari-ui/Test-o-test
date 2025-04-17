// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzZG2MtJb244u0g4IX59tGWATK-KGht-w",
    authDomain: "testotest-b77f3.firebaseapp.com",
    projectId: "testotest-b77f3",
    storageBucket: "testotest-b77f3.appspot.com",
    messagingSenderId: "57536899329",
    appId: "1:57536899329:web:d07442630c944086171300",
    measurementId: "G-52156S4D02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to display messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;

    // Reset styles before fading out
    messageDiv.style.transition = "opacity 0.5s ease-in-out";
    messageDiv.style.opacity = 1;

    setTimeout(() => {
        messageDiv.style.opacity = 0;
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 500); // Matches the transition duration
    }, 5000);
}

// Sign in users
const signInButton = document.getElementById('submitSignIn');
signInButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            showMessage('Login is successful', 'signInMessage');
            window.location.href = 'Free mock tests/Free-test-series.html';
        })
        .catch((error) => {
            // Log the error for detailed debugging
            console.error("Sign-in error details:", error);
            const errorCode = error.code;
            const errorMessage = error.message;

            // Fallback handling for unexpected errors
            if (!errorCode) {
                showMessage('An unknown error occurred. Please try again.', 'signInMessage');
                return;
            }

            // Improved error handling logic
            switch (errorCode) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential': // Handling unexpected error codes for user-not-found
                    showMessage('Account does not exist. Please register first.', 'signInMessage');
                    break;
                case 'auth/wrong-password':
                    showMessage('Incorrect password. Please try again.', 'signInMessage');
                    break;
                case 'auth/invalid-email':
                    showMessage('Invalid email address format.', 'signInMessage');
                    break;
                default:
                    console.warn("Unhandled error code:", errorCode);
                    showMessage('An error occurred during login. Please try again.', 'signInMessage');
                    break;
            }
        });
});

// Sign up new users
const signUpButton = document.getElementById('submitSignUp');
signUpButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value.trim();
    const password = document.getElementById('rPassword').value.trim();
    const firstName = document.getElementById('fName').value.trim();
    const lastName = document.getElementById('lName').value.trim();
    const MobileNumber = document.getElementById('MNumber').value.trim();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email,
                firstName,
                lastName,
                MobileNumber,
                fullName: `${firstName} ${lastName}`,
            };
            const docRef = doc(db, "users", user.uid);
            return setDoc(docRef, userData).then(() => {
                showMessage('Account Created Successfully', 'signUpMessage');
                window.location.href = 'free-student-login.html';
            });
        })
        .catch((error) => {
            console.error("Sign-up error details:", error);
            const errorCode = error.code;

            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists!', 'signUpMessage');
            } else if (errorCode === 'auth/weak-password') {
                showMessage('Password should be at least 6 characters.', 'signUpMessage');
            } else {
                showMessage('Unable to create User. Please try again.', 'signUpMessage');
            }
        });
});
