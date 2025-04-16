/**
 * Global Quiz State Object
 * Contains all the necessary state variables for the quiz functionality
 */
window.quizState = {
    currentQuestionIndex: 0,      // Tracks current question
    questions: null,              // Stores all quiz questions
    studentAnswers: {},           // Stores user's answers
    timer: null,                  // Quiz timer reference
    startTime: null,              // Quiz start timestamp
    markedForReviewQuestions: new Set(), // Questions marked for review
    currentSubject: 'physics',    // Current active subject
    visitedQuestions: new Set()   // Tracks visited questions
};

/**
 * Initialize Quiz Application
 * Sets up all necessary event listeners and initial state
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz questions
    quizState.questions = document.querySelectorAll('.question-section');
    handleSubjectToggle();
    
    // Mark first question as visited
    quizState.visitedQuestions.add(0);
    
    // Set up initial question palette explicitly
    updateQuestionPalette(quizState.currentSubject);

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Update question counts for each subject
    ['physics', 'chemistry', 'biology'].forEach(subject => {
        const count = getQuestionsBySubject(subject).length;
        const countElement = document.querySelector(`.subject-btn[data-subject="${subject}"] .question-count`);
        if (countElement) {
            countElement.textContent = `(${count})`;
        }
    });

    // Initialize controls and show first question
    initializePaletteControls();
    showQuestion(0);
    initializeQuiz();

    // Handle visibility change for auto-submit
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            submitQuiz();
        }
    });
});

/**
 * Prevent Keyboard Shortcuts
 * Blocks common keyboard shortcuts to prevent cheating
 */
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'u')) {
        e.preventDefault();
    }
});

/**
 * Initialize Quiz
 * Sets up the quiz environment and controls
 */
function initializeQuiz() {
    initializePaletteControls();
    initializeTimer();
    
    // Hide submit button initially
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
    
    showQuestion(quizState.currentQuestionIndex);
}

/**
 * Timer Functions
 */
function initializeTimer() {
    const timerElement = document.getElementById('timerDuration');
    const durationString = timerElement.getAttribute('data-duration');
    if (durationString) {
        const [minutes, seconds] = durationString.split(':').map(Number);
        const durationInSeconds = minutes * 60 + seconds;
        startTimer(durationInSeconds);
    }
}

function startTimer(durationInSeconds) {
    const timerElement = document.getElementById('timer');
    let timeRemaining = durationInSeconds;
    quizState.startTime = Date.now();

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            clearInterval(quizState.timer);
            document.dispatchEvent(new Event('quizTimeUp'));
        } else {
            timeRemaining--;
        }
    }

    updateTimerDisplay();
    quizState.timer = setInterval(updateTimerDisplay, 1000);
}

/**
 * Question Navigation Functions
 */
function getQuestionsBySubject(subject) {
    if (!quizState.questions || !Array.from(quizState.questions).length) {
        return [];
    }

    return Array.from(quizState.questions).filter(question => {
        const subjectAttr = question.getAttribute('data-subject');
        return subjectAttr?.toLowerCase() === (subject || '').toLowerCase();
    });
}

/**
 * Display Question
 * Shows the question at the specified index and updates navigation buttons
 */
function showQuestion(index) {
    // Hide all questions except current
    quizState.questions.forEach((question, idx) => {
        question.style.display = (idx === index) ? 'block' : 'none';
    });

    // Update navigation buttons
    const currentSubjectQuestions = getQuestionsBySubject(quizState.currentSubject);
    const currentSubjectIndex = currentSubjectQuestions.indexOf(quizState.questions[index]);
    
    updateNavigationButtons(currentSubjectIndex, currentSubjectQuestions);
    updateQuestionPalette(quizState.currentSubject);
}

/**
 * Update Navigation Buttons
 * Controls visibility and state of navigation buttons
 */
function updateNavigationButtons(currentSubjectIndex, currentSubjectQuestions) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');

    // Update submit button visibility
    if (submitButton) {
        const isLastSubject = quizState.currentSubject === 'biology';
        const isLastQuestion = currentSubjectIndex === currentSubjectQuestions.length - 1;
        submitButton.style.display = (isLastSubject && isLastQuestion) ? 'block' : 'none';
    }

    // Update previous button
    if (prevButton) {
        const isFirstInSubject = currentSubjectIndex === 0;
        prevButton.style.display = isFirstInSubject ? 'none' : 'inline';
    }

    // Update next button
    if (nextButton) {
        const isLastInSubject = currentSubjectIndex === currentSubjectQuestions.length - 1;
        nextButton.style.display = isLastInSubject ? 'none' : 'inline';
    }
}

/**
 * Navigation Functions
 * Handle movement between questions
 */
function nextQuestion() {
    const currentSubjectQuestions = getQuestionsBySubject(quizState.currentSubject);
    const currentSubjectIndex = currentSubjectQuestions.indexOf(quizState.questions[quizState.currentQuestionIndex]);
    
    if (currentSubjectIndex < currentSubjectQuestions.length - 1) {
        const nextQuestionIndex = Array.from(quizState.questions).indexOf(currentSubjectQuestions[currentSubjectIndex + 1]);
        quizState.visitedQuestions.add(nextQuestionIndex);
        quizState.currentQuestionIndex = nextQuestionIndex;
        showQuestion(quizState.currentQuestionIndex);
        updateQuestionState();
    }
}

function previousQuestion() {
    const currentSubjectQuestions = getQuestionsBySubject(quizState.currentSubject);
    const currentSubjectIndex = currentSubjectQuestions.indexOf(quizState.questions[quizState.currentQuestionIndex]);
    
    if (currentSubjectIndex > 0) {
        const prevQuestionIndex = Array.from(quizState.questions).indexOf(currentSubjectQuestions[currentSubjectIndex - 1]);
        quizState.currentQuestionIndex = prevQuestionIndex;
        showQuestion(quizState.currentQuestionIndex);
    }
}

/**
 * Question State Verification
 * Checks if a question has been answered based on its type
 * @param {number} index - Question index to check
 * @returns {boolean} - Whether the question has been answered
 */
function checkIfQuestionAnswered(index) {
    const question = quizState.questions[index];
    if (!question) return false;

    const questionType = question.getAttribute('data-type');
    switch(questionType) {
        case 'MCQ':
            return question.querySelector('input[type="radio"]:checked') !== null;
        case 'MSQ':
            return question.querySelector('input[type="checkbox"]:checked') !== null;
        case 'NAT':
            const numInput = question.querySelector('input[type="number"]');
            return numInput && numInput.value.trim() !== '';
        default:
            return false;
    }
}

/**
 * Answer Handling Functions
 */
function saveAndNext() {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const questionType = currentQuestion.getAttribute('data-type');
    let answer = getAnswer(questionType, currentQuestion);
    
    if (answer) {
        quizState.studentAnswers[quizState.currentQuestionIndex] = answer;
        updatePaletteButtonState(getCurrentSubjectQuestionNumber(), 'answered');
        nextQuestion();
    } else {
        updatePaletteButtonState(getCurrentSubjectQuestionNumber(), 'not-answered');
        alert("Please provide an answer before proceeding.");
    }
}

/**
 * Get Answer Based on Question Type
 * @param {string} type - Question type (MCQ, MSQ, NAT)
 * @param {Element} question - Question DOM element
 * @returns {string|string[]|null} - Answer value(s)
 */
function getAnswer(type, question) {
    switch(type) {
        case 'MCQ':
            return question.querySelector('input[type="radio"]:checked')?.value;
        case 'MSQ':
            return [...question.querySelectorAll('input[type="checkbox"]:checked')]
                .map(cb => cb.value);
        case 'NAT':
            return question.querySelector('input[type="number"]').value;
        default:
            return null;
    }
}

/**
 * Clear Response
 * Resets the current question's answer
 */
function clearResponse() {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const inputs = currentQuestion.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            input.checked = false;
        } else if (input.type === 'number') {
            input.value = '';
        }
    });
    
    delete quizState.studentAnswers[quizState.currentQuestionIndex];
    updatePaletteButtonState(getCurrentSubjectQuestionNumber(), 'not-answered');
}

/**
 * Mark Question for Review
 * Flags current question for later review
 */
function markForReview() {
    quizState.markedForReviewQuestions.add(quizState.currentQuestionIndex);
    updatePaletteButtonState(getCurrentSubjectQuestionNumber(), 'marked-review');
    nextQuestion();
}

/**
 * Question Palette Functions
 */
function updateQuestionPalette(subject) {
    const container = document.getElementById('paletteButtons');
    container.innerHTML = '';
    
    const subjectQuestions = getQuestionsBySubject(subject);
    
    subjectQuestions.forEach((question, index) => {
        const globalIndex = Array.from(quizState.questions).indexOf(question);
        const button = createPaletteButton(index, globalIndex);
        container.appendChild(button);
        const state = getQuestionState(globalIndex);
        updatePaletteButtonState(index + 1, state);
    });
}

/**
 * Create Palette Button
 * @param {number} index - Local index within subject
 * @param {number} globalIndex - Global question index
 * @returns {HTMLButtonElement} - Created button element
 */
function createPaletteButton(index, globalIndex) {
    const button = document.createElement('button');
    button.className = 'palette-button not-visited';
    button.textContent = index + 1;
    button.onclick = () => {
        quizState.currentQuestionIndex = globalIndex;
        showQuestion(globalIndex);
        if (window.innerWidth <= 768) {
            toggleQuestionPalette();
        }
    };
    return button;
}

/**
 * Get Current Subject Question Number
 * @returns {number} - Current question number within subject
 */
function getCurrentSubjectQuestionNumber() {
    const currentSubjectQuestions = getQuestionsBySubject(quizState.currentSubject);
    return currentSubjectQuestions.indexOf(quizState.questions[quizState.currentQuestionIndex]) + 1;
}

/**
 * Get Question State
 * Determines the current state of a question
 * @param {number} index - Question index
 * @returns {string} - State of the question
 */
function getQuestionState(index) {
    if (quizState.markedForReviewQuestions.has(index)) {
        return 'marked-review';
    }
    if (quizState.studentAnswers[index]) {
        return 'answered';
    }
    if (quizState.visitedQuestions.has(index)) {
        return 'not-answered';
    }
    return 'not-visited';
}

/**
 * Update Palette Button State
 * Updates the visual state of a palette button
 */
function updatePaletteButtonState(index, state) {
    const button = document.querySelector(`#paletteButtons button:nth-child(${index})`);
    if (button) {
        button.classList.remove('answered', 'not-answered', 'marked-review', 'not-visited');
        button.classList.add(state);
    }
}

/**
 * Subject Handling
 * Manages subject switching and related updates
 */
function handleSubjectToggle() {
    const subjectButtons = document.querySelectorAll('.subject-btn');
    
    subjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            subjectButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            quizState.currentSubject = this.getAttribute('data-subject');
            const subjectQuestions = getQuestionsBySubject(quizState.currentSubject);
            
            if (subjectQuestions.length > 0) {
                quizState.currentQuestionIndex = Array.from(quizState.questions).indexOf(subjectQuestions[0]);
                showQuestion(quizState.currentQuestionIndex);
            }
            
            updateQuestionPalette(quizState.currentSubject);
        });
    });
}

/**
 * Mobile Palette Controls
 * Handles mobile-specific palette functionality
 */
function toggleQuestionPalette() {
    const palette = document.getElementById('questionPalette');
    const overlay = document.querySelector('.palette-overlay');
    palette.classList.toggle('show-palette');
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

function initializePaletteControls() {
    const trigger = document.getElementById('paletteTrigger');
    const close = document.querySelector('.close-palette');
    
    if (trigger) trigger.addEventListener('click', toggleQuestionPalette);
    if (close) close.addEventListener('click', toggleQuestionPalette);
}

/**
 * Export Functions and State
 * Makes functions available for external use (marks.js)
 */
window.quizFunctions = {
    getQuestionsBySubject,
    checkIfQuestionAnswered,
    getAnswer,
    clearInterval: () => clearInterval(quizState.timer),
    getQuizState: () => quizState,
    calculateTimeTaken: () => Math.floor((Date.now() - quizState.startTime) / 1000)
};
