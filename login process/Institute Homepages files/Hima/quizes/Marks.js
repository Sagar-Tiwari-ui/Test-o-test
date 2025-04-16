// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzZG2MtJb244u0g4IX59tGWATK-KGht-w",
    authDomain: "testotest-b77f3.firebaseapp.com",
    projectId: "testotest-b77f3",
    storageBucket: "testotest-b77f3.appspot.com",
    messagingSenderId: "57536899329",
    appId: "1:57536899329:web:d07442630c944086171300",
    measurementId: "G-52156S4D02"
};

let db;
let auth;

// Initialize Firebase with authentication
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Firebase initialization error:", error);
        return false;
    }
}

// Anonymous authentication function
async function signInAnonymously() {
    try {
        const userCredential = await auth.signInAnonymously();
        console.log("Signed in anonymously:", userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error("Anonymous auth error:", error);
        return null;
    }
}

// Calculate score function - moved from quiz.js and modified
function calculateScore() {
    console.log("Starting score calculation");
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    const quizState = window.quizState;
    const questions = quizState.questions;
    const studentAnswers = quizState.studentAnswers;

    questions.forEach((question, index) => {
        const answer = studentAnswers[index];
        const correct = question.getAttribute('data-correct');
        const questionType = question.getAttribute('data-type');
        
        console.log(`Question ${index + 1}:`, {
            type: questionType,
            studentAnswer: answer,
            correctAnswer: correct
        });

        if (answer && correct) {
            if (questionType === 'MSQ') {
                const studentAnsArray = Array.isArray(answer) ? answer.sort() : [answer].sort();
                const correctAnsArray = correct.split(',').map(ans => ans.trim()).sort();
                
                if (JSON.stringify(studentAnsArray) === JSON.stringify(correctAnsArray)) {
                    score += 4;
                    correctAnswers++;
                }
            } else if (questionType === 'MCQ') {
                if (answer === correct) {
                    score += 4;
                    correctAnswers++;
                } else {
                    score -= 1;
                    wrongAnswers++;
                }
            } else if (questionType === 'NAT') {
                const numericAnswer = parseFloat(answer);
                const correctRange = correct.split('-').map(Number);
                
                if (correctRange.length === 1) {
                    if (numericAnswer === correctRange[0]) {
                        score += 4;
                        correctAnswers++;
                    }
                } else if (numericAnswer >= correctRange[0] && numericAnswer <= correctRange[1]) {
                    score += 4;
                    correctAnswers++;
                }
            }
        }
    });

    console.log("Score calculation complete:", {
        totalScore: score,
        correctAnswers,
        wrongAnswers
    });

    return {
        score,
        correctAnswers,
        wrongAnswers
    };
}

// Submit quiz function - modified to work with quiz.js
async function submitQuiz() {
    console.log("Submit quiz function called");
    
    try {
        if (!db || !auth) {
            throw new Error("Firebase not initialized");
        }

        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            throw new Error("No authenticated user found or email not available");
        }

        // Clear the quiz timer
        window.quizFunctions.clearInterval();

        // Calculate scores and get quiz state
        const { score, correctAnswers, wrongAnswers } = calculateScore();
        const quizState = window.quizFunctions.getQuizState();
        const timeTaken = window.quizFunctions.calculateTimeTaken();
        
        // Use current user's email instead of hardcoded email
        const userEmail = currentUser.email;

        console.log("Quiz submission details:", {
            userEmail,
            score,
            correctAnswers,
            wrongAnswers,
            timeTaken
        });

        // Prepare data for Firebase
        const quizData = {
            Score: score.toString(),
            correctAnswers: correctAnswers.toString(),
            wrongAnswers: wrongAnswers.toString(),
            timeTaken: timeTaken.toString(),
            totalQuestions: quizState.questions.length.toString(),
            attempted: Object.keys(quizState.studentAnswers).length.toString(),
            userId: currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const querySnapshot = await db.collection('Hima')
                .where('email', '==', userEmail)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    ...quizData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("Score updated successfully in Firebase");
            } else {
                await db.collection('Hima').add({
                    ...quizData,
                    email: userEmail,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("New document created successfully in Firebase");
            }

            // Store results in local storage
            localStorage.setItem('quizScore', score);
            sessionStorage.setItem('correctAnswers', correctAnswers);
            sessionStorage.setItem('wrongAnswers', wrongAnswers);
            sessionStorage.setItem('timeTaken', timeTaken);
            sessionStorage.setItem('studentAnswers', JSON.stringify(quizState.studentAnswers));

            // Redirect to results page
            setTimeout(() => {
                console.log("Redirecting to results page...");
                window.location.href = 'result.html';
            }, 1500);

        } catch (dbError) {
            console.error("Database operation failed:", dbError);
            throw dbError;
        }

    } catch (error) {
        console.error("Error in submitQuiz:", error);
        console.error("Full error details:", {
            message: error.message,
            stack: error.stack
        });
        
        // Fallback: store score locally and redirect
        const { score } = calculateScore();
        localStorage.setItem('quizScore', score);
        window.location.href = 'result.html';
    }
}

// Test database connection
async function testDatabaseConnection() {
    try {
        const testRead = await db.collection('Hima').limit(1).get();
        console.log("Read test successful");

        if (auth.currentUser) {
            const testRef = await db.collection('Hima').add({
                test: 'test',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: auth.currentUser.uid
            });
            await testRef.delete();
            console.log("Write/Delete test successful");
        }
        return true;
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.error("Firebase permission denied. Please check security rules.");
        } else {
            console.error("Database test failed:", error);
        }
        return false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM Content Loaded - Marks.js");
    
    // Initialize Firebase
    const initialized = initializeFirebase();
    if (!initialized) {
        console.error("Failed to initialize Firebase");
        return;
    }

    // Sign in anonymously at start
    try {
        await signInAnonymously();
        const dbWorking = await testDatabaseConnection();
        if (!dbWorking) {
            console.warn("Database operations not working - falling back to local storage only");
        }
    } catch (error) {
        console.error("Initial authentication failed:", error);
    }

    // Setup submit button listener
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await submitQuiz();
        });
        console.log("Submit button listener attached in marks.js");
    }

    // Listen for quiz time up event
    document.addEventListener('quizTimeUp', async () => {
        console.log("Quiz time up event received");
        await submitQuiz();
    });
});