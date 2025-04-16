// Initialize Firebase (replace with your own config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables to store quiz data
let score, timeTaken, totalQuestions, attempted, correctAnswers, accuracy, timeFormatted;
let userAnswers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve results from sessionStorage
    score = sessionStorage.getItem('quizScore') || 0;
    timeTaken = sessionStorage.getItem('timeTaken') || 0;
    totalQuestions = sessionStorage.getItem('totalQuestions') || 0;
    attempted = sessionStorage.getItem('attempted') || 0;
    correctAnswers = sessionStorage.getItem('correctAnswers') || 0;
    userAnswers = JSON.parse(sessionStorage.getItem('userAnswers') || '[]');
    
    // Calculate accuracy
    accuracy = attempted > 0 
        ? Math.round((correctAnswers / attempted) * 100) 
        : 0;

    // Format time
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    timeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

    // Update display
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('accuracyDisplay').textContent = `${accuracy}%`;
    document.getElementById('timeDisplay').textContent = timeFormatted;
    document.getElementById('attemptedDisplay').textContent = `${attempted}/${totalQuestions}`;
    document.getElementById('correctDisplay').textContent = correctAnswers;

    // Color the score based on performance
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (accuracy >= 80) {
        scoreDisplay.style.color = '#4CAF50'; // Green for good
    } else if (accuracy >= 60) {
        scoreDisplay.style.color = '#FFC107'; // Yellow for average
    } else {
        scoreDisplay.style.color = '#f44336'; // Red for needs improvement
    }
});

function goHome() {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to home page
    window.location.href = '../Homepage.html';
}

function downloadResults() {
    // Get user answers from session storage
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers') || '[]');
    
    // Create PDF preview content
    const pdfContent = document.getElementById('pdfContent');
    pdfContent.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
        <h1>Quiz Results</h1>
        <p>Performance Report</p>
    `;
    pdfContent.appendChild(header);
    
    // Add statistics
    const stats = document.createElement('div');
    stats.className = 'pdf-stats';
    stats.innerHTML = `
        <h2>Summary</h2>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Accuracy:</strong> ${accuracy}%</p>
        <p><strong>Time Taken:</strong> ${timeFormatted}</p>
        <p><strong>Questions Attempted:</strong> ${attempted}/${totalQuestions}</p>
        <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
    `;
    pdfContent.appendChild(stats);
    
    // Add answers section if available
    if (userAnswers.length > 0) {
        const answersSection = document.createElement('div');
        answersSection.className = 'pdf-answers';
        answersSection.innerHTML = '<h2>Your Answers</h2>';
        
        userAnswers.forEach((answer, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'pdf-question';
            
            // Question
            const questionText = document.createElement('p');
            questionText.innerHTML = `<strong>Question ${index + 1}:</strong> ${answer.question}`;
            questionDiv.appendChild(questionText);
            
            // User's answer with color coding
            const userAnswerText = document.createElement('p');
            userAnswerText.className = 'pdf-answer ' + (answer.isCorrect ? 'correct-answer' : 'incorrect-answer');
            userAnswerText.innerHTML = `<strong>Your Answer:</strong> ${answer.userAnswer}`;
            questionDiv.appendChild(userAnswerText);
            
            // Show correct answer if user was wrong
            if (!answer.isCorrect) {
                const correctAnswerText = document.createElement('p');
                correctAnswerText.className = 'pdf-answer correct-answer';
                correctAnswerText.innerHTML = `<strong>Correct Answer:</strong> ${answer.correctAnswer}`;
                questionDiv.appendChild(correctAnswerText);
            }
            
            answersSection.appendChild(questionDiv);
        });
        
        pdfContent.appendChild(answersSection);
    }
    
    // Show the preview
    document.getElementById('pdfPreview').style.display = 'block';
    
    // Use html2canvas and jsPDF to generate PDF
    setTimeout(() => {
        const { jsPDF } = window.jspdf;
        
        // Create a new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Use html2canvas to capture the preview content
        html2canvas(pdfContent).then(canvas => {
            // Hide the preview
            document.getElementById('pdfPreview').style.display = 'none';
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // Add first page
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Save the PDF
            const userName = sessionStorage.getItem('userName') || 'User';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            doc.save(`Quiz_Results_${userName}_${timestamp}.pdf`);
            
            // Show success message
            showStatusMessage("Results downloaded successfully!", "success");
        });
    }, 500);
}

function closePdfPreview() {
    document.getElementById('pdfPreview').style.display = 'none';
}

function submitResults() {
    // Get user information
    const userName = sessionStorage.getItem('userName') || 'Anonymous';
    const userEmail = sessionStorage.getItem('userEmail') || '';
    
    // Create results object
    const resultsData = {
        userName: userName,
        userEmail: userEmail,
        score: Number(score),
        accuracy: accuracy,
        timeTaken: timeTaken,
        totalQuestions: Number(totalQuestions),
        attempted: Number(attempted),
        correctAnswers: Number(correctAnswers),
        userAnswers: userAnswers,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Submit to Firestore
    db.collection("quizResults").add(resultsData)
        .then((docRef) => {
            console.log("Results submitted with ID: ", docRef.id);
            showStatusMessage("Results submitted successfully!", "success");
        })
        .catch((error) => {
            console.error("Error submitting results: ", error);
            showStatusMessage("Error submitting results. Please try again.", "error");
        });
}

function showStatusMessage(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}