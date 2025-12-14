let allQuestions = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer;
let timeRemaining;
let currentTopicKey = '';

// Định nghĩa các chủ đề
const topics = {
    'diagnosis': { 
        name: 'Chẩn đoán & Giải quyết vấn đề', 
        range: [1, 50],
        icon: '🔧',
        color: 'from-red-500 to-orange-500',
        description: 'Học cách phân tích và khắc phục sự cố trong IT'
    },
    'software-dev': { 
        name: 'Phát triển phần mềm', 
        range: [51, 100],
        icon: '💻',
        color: 'from-blue-500 to-cyan-500',
        description: 'Thuật ngữ lập trình và phát triển ứng dụng'
    },
    'web-design': { 
        name: 'Thiết kế Web & Lập trình', 
        range: [101, 150],
        icon: '🎨',
        color: 'from-purple-500 to-pink-500',
        description: 'HTML, CSS, JavaScript và thiết kế giao diện'
    },
    'communication': { 
        name: 'Giao tiếp & Công nghệ', 
        range: [151, 200],
        icon: '📱',
        color: 'from-green-500 to-teal-500',
        description: 'Kỹ năng giao tiếp trong môi trường công nghệ'
    },
    'hosting-costs': { 
        name: 'Web Hosting & Chi phí IT', 
        range: [201, 250],
        icon: '☁️',
        color: 'from-indigo-500 to-blue-500',
        description: 'Hosting, domain và quản lý ngân sách IT'
    },
    'spreadsheets': { 
        name: 'Bảng tính & Cơ sở dữ liệu', 
        range: [251, 300],
        icon: '📊',
        color: 'from-yellow-500 to-orange-500',
        description: 'Excel, SQL và quản lý dữ liệu'
    },
    'networks': { 
        name: 'Mạng & Thiết bị di động', 
        range: [301, 350],
        icon: '📡',
        color: 'from-cyan-500 to-blue-500',
        description: 'Networking, WiFi và công nghệ di động'
    },
    'hardware': { 
        name: 'Phần cứng & Hệ điều hành', 
        range: [351, 400],
        icon: '🖥️',
        color: 'from-gray-500 to-slate-600',
        description: 'CPU, RAM, Windows, Linux và macOS'
    },
    'workplace': { 
        name: 'Nơi làm việc IT & Quy tắc', 
        range: [401, 450],
        icon: '🏢',
        color: 'from-pink-500 to-rose-500',
        description: 'Văn hóa công ty và quy định an toàn'
    }
};

// DOM Elements
const homePage = document.getElementById('homePage');
const topicDetailPage = document.getElementById('topicDetailPage');
const quizPage = document.getElementById('quizPage');
const resultsPage = document.getElementById('resultsPage');

// Load questions
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        allQuestions = await response.json();
        console.log(`✅ Đã tải ${allQuestions.length} câu hỏi thành công!`);
        
        // Populate topics grid
        populateTopicsGrid();
    } catch (error) {
        console.error('❌ Lỗi tải câu hỏi:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tải câu hỏi. Vui lòng tải lại trang!',
            confirmButtonColor: '#3b82f6'
        });
    }
}

// Populate topics grid
function populateTopicsGrid() {
    const topicsGrid = document.getElementById('topicsGrid');
    
    Object.entries(topics).forEach(([key, topic]) => {
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-br ' + topic.color + ' p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer';
        card.innerHTML = `
            <div class="text-center text-white">
                <div class="text-5xl mb-4">${topic.icon}</div>
                <h3 class="text-xl font-bold mb-2">${topic.name}</h3>
                <p class="text-sm opacity-90 mb-4">${topic.description}</p>
                <div class="bg-white/20 rounded-lg py-2 px-4 backdrop-blur-sm">
                    <p class="text-sm font-semibold">Câu ${topic.range[0]}-${topic.range[1]}</p>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => showTopicDetail(key));
        topicsGrid.appendChild(card);
    });
}

// Show topic detail
function showTopicDetail(topicKey) {
    currentTopicKey = topicKey;
    const topic = topics[topicKey];
    
    homePage.classList.add('hidden');
    topicDetailPage.classList.remove('hidden');
    
    document.getElementById('topicTitle').textContent = topic.icon + ' ' + topic.name;
    document.getElementById('topicDescription').textContent = topic.description;
    document.getElementById('topicQuestionCount').textContent = topic.range[1] - topic.range[0] + 1;
    document.getElementById('topicSuggestedTime').textContent = '30 phút';
    
    const iconDiv = document.getElementById('topicIcon');
    iconDiv.className = 'w-20 h-20 bg-gradient-to-br ' + topic.color + ' rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg';
}

// Back to home
document.getElementById('backToHome').addEventListener('click', () => {
    topicDetailPage.classList.add('hidden');
    homePage.classList.remove('hidden');
});

// Back to home from quiz
document.getElementById('backToHomeFromQuiz').addEventListener('click', () => {
    Swal.fire({
        title: '⚠️ Xác nhận thoát',
        html: '<p class="text-gray-600">Bạn có chắc chắn muốn thoát?</p><p class="text-red-600 font-semibold mt-2">Toàn bộ tiến trình sẽ bị mất!</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Thoát',
        cancelButtonText: 'Ở lại',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            clearInterval(timer);
            quizPage.classList.add('hidden');
            homePage.classList.remove('hidden');
            
            Swal.fire({
                icon: 'info',
                title: 'Đã thoát!',
                text: 'Bạn đã quay lại trang chủ.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// Submit early button
document.getElementById('submitEarlyBtn').addEventListener('click', () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    const answered = currentQuiz.length - unanswered;
    
    let htmlContent = `
        <div class="text-left space-y-3">
            <p class="text-gray-700">📝 <strong>Tổng số câu:</strong> ${currentQuiz.length}</p>
            <p class="text-green-700">✅ <strong>Đã trả lời:</strong> ${answered} câu</p>
            ${unanswered > 0 ? `<p class="text-red-700">⚠️ <strong>Chưa trả lời:</strong> ${unanswered} câu</p>` : ''}
            <hr class="my-3">
            <p class="text-gray-800 font-semibold text-center">Bạn có chắc chắn muốn nộp bài?</p>
        </div>
    `;
    
    Swal.fire({
        title: '📋 Xác nhận nộp bài',
        html: htmlContent,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Nộp bài',
        cancelButtonText: 'Tiếp tục làm',
        reverseButtons: true,
        width: '500px'
    }).then((result) => {
        if (result.isConfirmed) {
            submitQuiz();
        }
    });
});

// Quick start - Random 50 questions
document.getElementById('quickStartBtn').addEventListener('click', () => {
    const numQuestions = parseInt(document.getElementById('customNumQuestions').value);
    const timeLimit = parseInt(document.getElementById('customTimeLimit').value);
    
    if (numQuestions < 10 || numQuestions > 450) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Vui lòng chọn số câu từ 10 đến 450!',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    if (timeLimit < 5 || timeLimit > 120) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Vui lòng chọn thời gian từ 5 đến 120 phút!',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    startQuiz(allQuestions, 50, 30);
});

// Start topic quiz
document.getElementById('startTopicQuiz').addEventListener('click', () => {
    const topic = topics[currentTopicKey];
    const filteredQuestions = allQuestions.filter(q => 
        q.id >= topic.range[0] && q.id <= topic.range[1]
    );
    
    startQuiz(filteredQuestions, filteredQuestions.length, 30);
});

// Start quiz function
function startQuiz(questions, numQuestions, timeLimit) {
    if (questions.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không có câu hỏi nào!',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Shuffle and select questions
    currentQuiz = shuffleArray([...questions]).slice(0, Math.min(numQuestions, questions.length));
    userAnswers = new Array(currentQuiz.length).fill(null);
    currentQuestionIndex = 0;
    timeRemaining = timeLimit * 60;
    
    // Hide all pages and show quiz
    homePage.classList.add('hidden');
    topicDetailPage.classList.add('hidden');
    resultsPage.classList.add('hidden');
    quizPage.classList.remove('hidden');
    
    // Update progress
    document.getElementById('progressText').textContent = `0/${currentQuiz.length}`;
    
    // Start timer
    startTimer();
    
    // Display first question
    displayQuestion();
}

// Shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Timer
function startTimer() {
    const timerElement = document.getElementById('timer');
    
    timer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 60) {
            timerElement.classList.add('text-red-600', 'pulse-animation');
        } else if (timeRemaining <= 300) {
            timerElement.classList.add('text-orange-600');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            Swal.fire({
                icon: 'warning',
                title: '⏰ Hết giờ!',
                text: 'Bài thi sẽ được nộp tự động.',
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                submitQuiz();
            });
        }
    }, 1000);
}

// Display question
function displayQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('progressText').textContent = `${currentQuestionIndex + 1}/${currentQuiz.length}`;
    document.getElementById('progressBar').style.width = `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%`;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    Object.entries(question.options).forEach(([key, value], index) => {
        const button = document.createElement('button');
        button.className = 'option-btn w-full text-left p-5 border-2 border-gray-200 rounded-2xl hover:border-purple-400 transition-all bg-white/50';
        button.style.animationDelay = `${index * 0.1}s`;
        button.classList.add('slide-in');
        button.innerHTML = `<span class="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${key}.</span> <span class="text-gray-700">${value}</span>`;
        
        if (userAnswers[currentQuestionIndex] === key) {
            button.classList.add('selected-option');
        }
        
        button.addEventListener('click', () => selectAnswer(key));
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentQuiz.length - 1) {
        document.getElementById('nextBtn').classList.add('hidden');
        document.getElementById('submitBtn').classList.remove('hidden');
    } else {
        document.getElementById('nextBtn').classList.remove('hidden');
        document.getElementById('submitBtn').classList.add('hidden');
    }
}

// Select answer
function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
    displayQuestion();
}

// Navigation
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    const answered = currentQuiz.length - unanswered;
    
    let htmlContent = `
        <div class="text-left space-y-3">
            <p class="text-gray-700">📝 <strong>Tổng số câu:</strong> ${currentQuiz.length}</p>
            <p class="text-green-700">✅ <strong>Đã trả lời:</strong> ${answered} câu</p>
            ${unanswered > 0 ? `<p class="text-red-700">⚠️ <strong>Chưa trả lời:</strong> ${unanswered} câu</p>` : ''}
            <hr class="my-3">
            <p class="text-gray-800 font-semibold text-center">Bạn có chắc chắn muốn nộp bài?</p>
        </div>
    `;
    
    Swal.fire({
        title: '📋 Xác nhận nộp bài',
        html: htmlContent,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Nộp bài',
        cancelButtonText: 'Kiểm tra lại',
        reverseButtons: true,
        width: '500px'
    }).then((result) => {
        if (result.isConfirmed) {
            submitQuiz();
        }
    });
});

// Submit quiz
function submitQuiz() {
    clearInterval(timer);
    
    let correctCount = 0;
    currentQuiz.forEach((question, index) => {
        if (userAnswers[index] === question.correct_answer) {
            correctCount++;
        }
    });
    
    const scorePercent = Math.round((correctCount / currentQuiz.length) * 100);
    
    quizPage.classList.add('hidden');
    resultsPage.classList.remove('hidden');
    resultsPage.classList.add('fade-in');
    
    document.getElementById('totalQuestions').textContent = currentQuiz.length;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('scorePercent').textContent = `${scorePercent}%`;
    
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    
    currentQuiz.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.correct_answer;
        const reviewItem = document.createElement('div');
        reviewItem.className = `p-6 border-l-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isCorrect ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500'}`;
        reviewItem.style.animationDelay = `${index * 0.05}s`;
        reviewItem.classList.add('slide-in');
        
        const optionText = question.options[userAnswers[index]] || 'Không trả lời';
        const correctOptionText = question.options[question.correct_answer];
        
        reviewItem.innerHTML = `
            <div class="flex items-start gap-3 mb-3">
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-200' : 'bg-red-200'}">
                    ${isCorrect ? 
                        '<svg class="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' :
                        '<svg class="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>'
                    }
                </div>
                <div class="flex-1">
                    <p class="font-bold text-gray-800 mb-2 text-lg">Câu ${index + 1}: ${question.question}</p>
                </div>
            </div>
            <div class="ml-11 space-y-2">
                <p class="text-sm">
                    <span class="font-semibold text-gray-700">📝 Đáp án của bạn:</span> 
                    <span class="font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}">${userAnswers[index] ? `${userAnswers[index]}. ${optionText}` : 'Không trả lời'}</span>
                </p>
                ${!isCorrect ? `
                    <p class="text-sm">
                        <span class="font-semibold text-gray-700">✅ Đáp án đúng:</span> 
                        <span class="font-medium text-green-700">${question.correct_answer}. ${correctOptionText}</span>
                    </p>
                ` : ''}
                ${question.explanation ? `
                    <div class="mt-3 p-4 bg-white/50 rounded-xl border border-gray-200">
                        <p class="text-xs font-semibold text-gray-600 mb-1">💡 Giải thích:</p>
                        <p class="text-sm text-gray-700 leading-relaxed">${question.explanation}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        reviewContainer.appendChild(reviewItem);
    });
    
    // Show success message
    Swal.fire({
        icon: scorePercent >= 80 ? 'success' : scorePercent >= 50 ? 'info' : 'warning',
        title: scorePercent >= 80 ? '🎉 Xuất sắc!' : scorePercent >= 50 ? '👍 Khá tốt!' : '💪 Cần cố gắng thêm!',
        html: `
            <div class="text-center">
                <p class="text-xl font-bold text-gray-800 mb-2">Điểm của bạn: ${scorePercent}%</p>
                <p class="text-gray-600">${correctCount}/${currentQuiz.length} câu đúng</p>
            </div>
        `,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Xem chi tiết'
    });
}

// Restart
document.getElementById('restartBtn').addEventListener('click', () => {
    resultsPage.classList.add('hidden');
    homePage.classList.remove('hidden');
    
    document.getElementById('customNumQuestions').value = 50;
    document.getElementById('customTimeLimit').value = 30;
});

// Initialize
loadQuestions();