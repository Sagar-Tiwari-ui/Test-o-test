// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwA_gSgGR_5Va5kC-zEX3x-YrTgZqbqxY",
    authDomain: "test-o-test-com.firebaseapp.com",
    projectId: "test-o-test-com",
    storageBucket: "test-o-test-com.firebasestorage.app",
    messagingSenderId: "421896104184",
    appId: "1:421896104184:web:98bbea1c38f084fc9bf30d",
    measurementId: "G-3LQRVJW9GM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Predefined homepage assignments
const teacherHomepages = {
    "sgmcoaching@gmail.com": "Institute Homepages files/S.G.M. Coaching Center/homepage.html",
    "ajaycoaching@gmail.com": "Institute Homepages files/Ajay Coaching Center/homepage.html",
    "Himadrisaha420@gmail.com": "Institute Homepages files/Hima/homepage.html"
    // Add more email-homepage mappings as needed
};

// Function to display messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;

    messageDiv.style.transition = "opacity 0.5s ease-in-out";
    messageDiv.style.opacity = 1;

    setTimeout(() => {
        messageDiv.style.opacity = 0;
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 500);
    }, 5000);
}

// Sign in users
const signInButton = document.getElementById('submitSignIn');
signInButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        // Store user data in localStorage
        localStorage.setItem('loggedInUserId', user.uid);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showMessage('Login is successful', 'signInMessage');
        
        // Get assigned homepage from userData or default mapping
        let homepageURL;
        if (userData && userData.assignedHomepage) {
            homepageURL = userData.assignedHomepage;
        } else {
            homepageURL = teacherHomepages[email] || 'homepage.html'; // Default homepage if no assignment found
        }
        
        window.location.href = homepageURL;
    } catch (error) {
        console.error("Sign-in error details:", error);
        const errorCode = error.code;

        switch (errorCode) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                showMessage('Account does not exist. Please register first.', 'signInMessage');
                break;
            case 'auth/wrong-password':
                showMessage('Incorrect password. Please try again.', 'signInMessage');
                break;
            case 'auth/invalid-email':
                showMessage('Invalid email address format.', 'signInMessage');
                break;
            default:
                showMessage('An error occurred during login. Please try again.', 'signInMessage');
                break;
        }
    }
});

// Sign up new users
const signUpButton = document.getElementById('submitSignUp');
signUpButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value.trim();
    const password = document.getElementById('rPassword').value.trim();
    const firstName = document.getElementById('fName').value.trim();
    const lastName = document.getElementById('lName').value.trim();
    const CoachingSector = document.getElementById('Csector').value.trim();
    const MobileNumber = document.getElementById('MNumber').value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Assign homepage during registration
        const assignedHomepage = teacherHomepages[email] || 'homepage.html';
        
        const userData = {
            email,
            firstName,
            lastName,
            CoachingSector,
            MobileNumber,
            fullName: `${firstName} ${lastName}`,
            assignedHomepage // Store the assigned homepage in user data
        };

        await setDoc(doc(db, "users", user.uid), userData);
        showMessage('Account Created Successfully', 'signUpMessage');
        window.location.href = 'institute-login.html';
    } catch (error) {
        console.error("Sign-up error details:", error);
        const errorCode = error.code;

        if (errorCode === 'auth/email-already-in-use') {
            showMessage('Email Address Already Exists!', 'signUpMessage');
        } else if (errorCode === 'auth/weak-password') {
            showMessage('Password should be at least 6 characters.', 'signUpMessage');
        } else {
            showMessage('Unable to create User. Please try again.', 'signUpMessage');
        }
    }
});