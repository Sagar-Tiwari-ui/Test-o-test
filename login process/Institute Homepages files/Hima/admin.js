document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const submitBtn = document.getElementById('submitBtn');
    const timeDurationInput = document.getElementById('timeDuration');
    const downloadLink = document.getElementById('downloadLink');
    const imageFilesInput = document.getElementById('imageInput');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const htmlInput = document.getElementById('htmlInput');
    const uploadHtmlBtn = document.getElementById('uploadHtmlBtn');
    let generatedBlob;

    // GitHub API configuration
    const GITHUB_TOKEN = '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'; // Replace with your PAT (use backend in production)
    const REPO_OWNER = 'Sagar Tiwari'; // Replace with your GitHub username
    const REPO_NAME = 'Sagar-Tiwari-ui'; // Replace with your repository name (e.g., username.github.io)
    const BASE_URL = `https://www.test-o-test.com`;

    // Handle Excel file submission for quiz generation
    submitBtn.addEventListener('click', function () {
        const file = fileInput.files[0];
        const duration = parseInt(timeDurationInput.value, 10);
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing File',
                text: "Please upload an Excel file."
            });
            return;
        }
        if (isNaN(duration) || duration <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Duration',
                text: "Please provide a valid quiz duration in minutes."
            });
            return;
        }
        processExcel(file, duration);
    });

    // Handle HTML file upload to GitHub
    uploadHtmlBtn.addEventListener('click', function () {
        const file = htmlInput.files[0];
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing File',
                text: "Please select an HTML file to upload."
            });
            return;
        }
        if (!file.name.endsWith('.html')) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid File',
                text: "Please select a valid HTML file."
            });
            return;
        }

        // Read file as text
        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                const content = event.target.result;
                const timestamp = new Date().toISOString().replace(/[:.]/g, '');
                const fileName = `${timestamp}_${file.name}`;
                const path = `quizzes/${fileName}`;

                // Encode content as Base64
                const base64Content = btoa(content);

                // GitHub API payload
                const payload = {
                    message: `Upload HTML file ${fileName}`,
                    content: base64Content,
                    branch: 'main' // Adjust if using a different branch
                };

                // Upload to GitHub
                const response = await fetch(`${BASE_URL}/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to upload HTML file');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Upload Successful',
                    text: `HTML file "${file.name}" uploaded to quizzes/${fileName}`
                });
                htmlInput.value = ''; // Clear input
            } catch (error) {
                console.error('HTML Upload Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: `Failed to upload HTML file: ${error.message}. Check token, permissions, or network.`
                });
            }
        };
        reader.onerror = function () {
            Swal.fire({
                icon: 'error',
                title: 'File Reading Error',
                text: 'Failed to read the HTML file.'
            });
        };
        reader.readAsText(file);
    });

    // Handle multiple image uploads to GitHub
    uploadImageBtn.addEventListener('click', function () {
        const files = imageFilesInput.files;
        if (files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Files',
                text: "Please select at least one JPG image to upload."
            });
            return;
        }

        const validFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.jpg'));
        if (validFiles.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Files',
                text: "Please select valid JPG images."
            });
            return;
        }

        let completedUploads = 0;
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = async function (event) {
                try {
                    const content = event.target.result.split(',')[1]; // Get Base64 part
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
                    const fileName = `${timestamp}_${file.name}`;
                    const path = `quizes/Saha/${fileName}`;

                    // GitHub API payload
                    const payload = {
                        message: `Upload image ${fileName}`,
                        content: content,
                        branch: 'main' // Adjust if using a different branch
                    };

                    // Upload to GitHub
                    const response = await fetch(`${BASE_URL}/${path}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Failed to upload image ${file.name}`);
                    }

                    completedUploads++;
                    if (completedUploads === validFiles.length) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Upload Successful',
                            text: `${validFiles.length} image(s) uploaded to quizzes/Saha/`
                        });
                        imageFilesInput.value = ''; // Clear input
                    }
                } catch (error) {
                    console.error('Image Upload Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        text: `Failed to upload image "${file.name}": ${error.message}. Check token, permissions, or network.`
                    });
                }
            };
            reader.onerror = function () {
                Swal.fire({
                    icon: 'error',
                    title: 'File Reading Error',
                    text: `Failed to read image "${file.name}".`
                });
            };
            reader.readAsDataURL(file); // Read as Base64
        });
    });

    // Process Excel and generate HTML
    function processExcel(file, duration) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                    header: 1,
                    defval: ''
                });

                if (!jsonData || jsonData.length < 2) {
                    throw new Error('No data found in the Excel sheet');
                }

                const htmlContent = generateHTMLFromExcel(jsonData, duration);
                createDownloadableQuiz(htmlContent);
            } catch (error) {
                console.error('Excel Processing Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Excel Processing Error',
                    text: `Failed to process the Excel file: ${error.message}. Please check the file format and ensure it contains valid data.`
                });
            }
        };
        
        reader.onerror = function (error) {
            console.error('File Reading Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'File Reading Error',
                text: `An error occurred while reading the file: ${error.message}`
            });
        };
        
        reader.readAsArrayBuffer(file);
    }

    // Create downloadable quiz HTML file
    function createDownloadableQuiz(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'quiz.html';
        downloadLink.classList.remove('d-none');
        
        Swal.fire({
            icon: 'success',
            title: 'Quiz Generated!',
            text: 'Your quiz has been successfully generated and is ready for download.',
            confirmButtonText: 'Download Quiz'
        }).then((result) => {
            if (result.isConfirmed) {
                downloadLink.click();
            }
        });
    }

    // Generate HTML from Excel data
    function generateHTMLFromExcel(data, duration) {
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Page</title>
            <link rel="stylesheet" href="quiz.css">
            <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
            <!-- Add Firebase products that you want to use -->
            <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
            <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
            <!-- Then include your marks.js -->

            <script type="module" src="Marks.js"></script>
        </head>
        <body>
            <div class="quiz-container">
                <!-- Header Section with Timer and Toggle Button -->
                <div class="quiz-header">
                    <div id="timerDuration" data-duration="${duration}:00" style="display: none;"></div>
                    <div id="timer" style="font-size: 24px; text-align: center;"></div>
                    <button id="paletteTrigger" class="palette-toggle-btn">
                        <span class="toggle-icon">☰</span>
                    </button>
                </div>
                
                <!-- Subject Toggle Buttons -->
                
                <div class="subject-toggles">
                <button class="subject-btn active" data-subject="physics">
                    Physics
                    <span class="question-count"></span>
                </button>
                
                <button class="subject-btn" data-subject="chemistry">
                    Chemistry
                    <span class="question-count"></span>
                </button>
            
                <button class="subject-btn" data-subject="biology">
                    Biology
                    <span class="question-count"></span>
                </button>
                </div>

        
                <div class="quiz-layout">
                    <!-- Question Palette -->
                    <div id="questionPalette" class="question-palette">
                        <div class="palette-header">
                            <h3>Question Palette</h3>
                            <button class="close-palette">×</button>
                        </div>
                        <div class="palette-legend">
                            <div class="legend-item">
                                <span class="answered"></span>
                                <p>Answered</p>
                            </div>
                            <div class="legend-item">
                                <span class="not-answered"></span>
                                <p>Not Answered</p>
                            </div>
                            <div class="legend-item">
                                <span class="marked-review"></span>
                                <p>Marked for Review</p>
                            </div>
                            <div class="legend-item">
                                <span class="not-visited"></span>
                                <p>Not Visited</p>
                            </div>
                        </div>
                        <div id="paletteButtons" class="palette-buttons"></div>
                    </div>
        
                    <!-- Main Quiz Form -->
                    <form id="quizForm" onsubmit="calculateScore(event)">
                        <div class="question-section-container">
            `;
        
            // Start from second row (index 1) to skip headers
            data.slice(1).forEach((row, index) => {
                 // Safely extract values with fallback
                const questionText = row[0] || 'No Question Text';
                const questionType = row[7] || 'MCQ';
                const subjectType = row[8] || ''; // Added subject type from Excel
                const options = row.slice(1, 5).filter(opt => opt && opt.trim() !== '');
                const correctAnswer = row[5] || '';
                const msqCorrectAnswer = row[9] || ''; // Adjusted index
                const natRange = row[10] || ''; // Adjusted index
                const imagePath = row[6] || '';

            // Skip rows with no question text or options
            if (!questionText || options.length === 0) return;

            let questionBlock = `
            <div class="question-section" 
                data-type="${questionType}"
                data-subject="${subjectType.toLowerCase()}"
                ${questionType === 'MCQ' ? `data-correct="${correctAnswer}"` : ''}
                ${questionType === 'MSQ' ? `data-correct="${msqCorrectAnswer}"` : ''}
                ${questionType === 'NAT' ? `data-range="${natRange}"` : ''}
            >

            <div class="question-header">
                <span class="question-type">${questionType}</span>
                <span class="subject-type">${subjectType}</span>
                <span class="question-number">Q.${index + 1}</span>
            </div>
            <div class="question-content">
                <p>${questionText}</p>
            `;

            if (imagePath) {
                questionBlock += `
                <img src="${imagePath}" alt="Question Image" style="max-width: 100%; height: auto;">
            `;
            }

            // Generate options based on question type
            if (questionType === 'MCQ' || questionType === 'MSQ') {
                const inputType = questionType === 'MCQ' ? 'radio' : 'checkbox';
                const optionLabels = ['Option A', 'Option B', 'Option C', 'Option D'];

                questionBlock += '<ul class="question-options">';
                options.forEach((option, idx) => {
                questionBlock += `
                    <li>
                        <input type="${inputType}" 
                            name="question${index + 1}" 
                            id="q${index + 1}_${String.fromCharCode(97 + idx)}" 
                            value="${optionLabels[idx]}">
                        <label for="q${index + 1}_${String.fromCharCode(97 + idx)}">${option}</label>
                    </li>
                `;
            });
            questionBlock += '</ul>';
        } else if (questionType === 'NAT') {
            questionBlock += `
                <div class="nat-input">
                    <input type="number" name="question${index + 1}" step="1">
                </div>
            `;
        }

        questionBlock += `
                </div>
            </div>
        `;

        htmlContent += questionBlock;
    });
        
            htmlContent += `
                        </div>
                        <div class="button-section">
                            <div class="primary-buttons">
                                <button type="button" onclick="previousQuestion()" id="prevButton">Previous</button>
                                <button type="button" onclick="saveAndNext()" id="saveNextButton">Save & Next</button>
                                <button type="button" onclick="nextQuestion()" id="nextButton">Next</button>
                            </div>
                            <div class="secondary-buttons">
                                <button type="button" onclick="clearResponse()" id="clearButton">Clear</button>
                                <button type="button" onclick="markForReview()" id="markForReviewButton">Mark for Review</button>
                            </div>
                            <div class="submit-button">
                                <button type="submit" id="submitButton">Submit Test</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <script src="quiz.js"></script>
        </body>
        </html>
            `;
        
            return htmlContent;
    }
});

// student update //

document.addEventListener('DOMContentLoaded', function () {
    function fetchStudentPerformance() {
        const tableBody = document.getElementById('studentTableBody');
        
        if (!tableBody) {
            console.error('Student table body not found');
            return;
        }

        // Clear existing table rows
        tableBody.innerHTML = '';

        // Fetch students from Firestore
        firebase.firestore().collection('Hima')
            .get()
            .then((querySnapshot) => {
                let performanceRows = [];

                querySnapshot.forEach((doc) => {
                    const studentData = doc.data();

                    // Check if student has Score property (from quiz submission)
                    if (studentData.Score !== undefined) {
                        // Create table row
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${studentData.firstName || 'N/A'} ${studentData.lastName || ''}</td>
                            <td>${studentData.Score || '0'}</td>
                            <td>${studentData.course || 'N/A'}</td>
                            <td>${studentData.correctAnswers || '0'}</td>
                            <td>${studentData.wrongAnswers || '0'}</td>
                            <td>${studentData.timeTaken || 'N/A'}</td>
                        `;

                        performanceRows.push(row);
                    }
                });

                // Populate table or show no data message
                if (performanceRows.length > 0) {
                    performanceRows.forEach(row => tableBody.appendChild(row));
                } else {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">
                                No student performance data available. 
                                <br>Possible reasons:
                                <br>- No quizzes have been taken
                                <br>- Scores not recorded
                                <br>- Data retrieval issue
                            </td>
                        </tr>
                    `;
                }

                console.log('Performance Rows:', performanceRows.length);
            })
            .catch((error) => {
                console.error("Error fetching student performance: ", error);
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger">
                            Error fetching performance data
                            <br>Details: ${error.message}
                            <br>Check console for more information
                        </td>
                    </tr>
                `;
            });
    }

    // Course Filter Function
    function filterStudentsByCourse(course) {
        const tableBody = document.getElementById('studentTableBody');
        
        tableBody.innerHTML = '';

        firebase.firestore().collection('Hima')
            .where('course', '==', course)
            .get()
            .then((querySnapshot) => {
                let performanceRows = [];

                querySnapshot.forEach((doc) => {
                    const studentData = doc.data();
                    
                    if (studentData.Score !== undefined) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${studentData.firstName || 'N/A'} ${studentData.lastName || ''}</td>
                            <td>${studentData.Score || '0'}</td>
                            <td>${studentData.course || 'N/A'}</td>
                            <td>${studentData.correctAnswers || '0'}</td>
                            <td>${studentData.wrongAnswers || '0'}</td>
                            <td>${studentData.timeTaken || 'N/A'}</td>
                        `;

                        performanceRows.push(row);
                    }
                });

                if (performanceRows.length > 0) {
                    performanceRows.forEach(row => tableBody.appendChild(row));
                } else {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">
                                No student performance data for this course
                            </td>
                        </tr>
                    `;
                }

                console.log('Filtered Performance Rows:', performanceRows.length);
            })
            .catch((error) => {
                console.error("Error filtering students: ", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unable to filter student performance data'
                });
            });
    }

    // Course Filter Dropdown
    function populateCourseFilter() {
        const performanceCard = document.querySelector('.col-md-4 .card');
        
        if (!performanceCard) {
            console.error('Performance card not found');
            return;
        }

        const filterDropdown = document.createElement('select');
        filterDropdown.className = 'form-select mb-3';
        filterDropdown.innerHTML = `
            <option value="">All Courses</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="Board">Board</option>
        `;

        filterDropdown.addEventListener('change', (e) => {
            const selectedCourse = e.target.value;
            if (selectedCourse) {
                filterStudentsByCourse(selectedCourse);
            } else {
                fetchStudentPerformance();
            }
        });

        performanceCard.querySelector('.card-body').insertBefore(
            filterDropdown, 
            performanceCard.querySelector('.table-responsive')
        );
    }

    // Initialize
    fetchStudentPerformance();
    populateCourseFilter();
});
