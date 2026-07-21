// Python Learning App JavaScript

class PythonLearningApp {
    constructor() {
        this.storageKey = 'python-learning-app-progress';
        this.currentStreak = 0;
        this.lessonsCompleted = [];
        this.exercisesCompleted = [];
        this.quizResults = {};
        this.init();
    }

    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.updateProgressDisplay();
        this.startDailyReminder();
    }

    loadProgress() {
        const progress = localStorage.getItem(this.storageKey);
        if (progress) {
            const data = JSON.parse(progress);
            this.currentStreak = data.streak || 0;
            this.lessonsCompleted = data.lessonsCompleted || [];
            this.exercisesCompleted = data.exercisesCompleted || [];
            this.quizResults = data.quizResults || {};
        }
    }

    saveProgress() {
        const progress = {
            currentStreak: this.currentStreak,
            lessonsCompleted: this.lessonsCompleted,
            exercisesCompleted: this.exercisesCompleted,
            quizResults: this.quizResults,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(progress));
    }

    updateProgressDisplay() {
        document.getElementById('completed-lessons').textContent = this.lessonsCompleted.length;
        document.getElementById('exercises-completed').textContent = this.exercisesCompleted.length;
        document.getElementById('streak').textContent = this.currentStreak;
        this.updateContinueLearningSection();
        this.updateQuizStatus();
    }

    markLessonCompleted(lessonId) {
        if (!this.lessonsCompleted.includes(lessonId)) {
            this.lessonsCompleted.push(lessonId);
            this.saveProgress();
            this.updateProgressDisplay();
            this.showNotification('Lesson completed! Keep up the great work!', false, lessonId);
            this.updateStreak();
        }
    }

    markExerciseCompleted(exerciseId) {
        if (!this.exercisesCompleted.includes(exerciseId)) {
            this.exercisesCompleted.push(exerciseId);
            this.saveProgress();
            this.updateProgressDisplay();
            this.showNotification('Exercise completed! Your coding skills are improving!', false, null);
            this.updateStreak();
        }
    }

    checkQuizAnswer(lessonId, questionId, selectedAnswer, correctAnswer) {
        const quizResult = {
            lessonId: lessonId,
            questionId: questionId,
            selectedAnswer: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer,
            timestamp: new Date().toISOString()
        };

        if (!this.quizResults[lessonId]) {
            this.quizResults[lessonId] = [];
        }
        
        this.quizResults[lessonId].push(quizResult);
        this.saveProgress();
        
        return quizResult.isCorrect;
    }

    canAccessLesson(lessonId) {
        if (this.lessonsCompleted.includes(lessonId)) {
            return true;
        }
        
        if (lessonId === 1) return true;
        
        const previousLessonId = lessonId - 1;
        if (!this.lessonsCompleted.includes(previousLessonId)) {
            return false;
        }
        
        if (!this.quizResults[previousLessonId] || this.quizResults[previousLessonId].length === 0) {
            return false;
        }
        
        const previousQuizPassed = this.quizResults[previousLessonId].some(
            result => result.isCorrect
        );
        
        return previousQuizPassed;
    }

    getQuizScore(lessonId) {
        if (!this.quizResults[lessonId]) return 0;
        
        const totalQuestions = this.quizResults[lessonId].length;
        const correctAnswers = this.quizResults[lessonId].filter(
            result => result.isCorrect
        ).length;
        
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    getQuizStatusText(lessonId) {
        if (!this.canAccessLesson(lessonId)) {
            if (lessonId === 1) {
                return 'Ready to start';
            }
            return 'Quiz required to unlock';
        }
        
        const score = this.getQuizScore(lessonId);
        if (score === 0) {
            return 'Passed';
        } else if (score < 50) {
            return `Needs review (${score}%) - One more quiz recommended`;
        } else if (score < 80) {
            return `Failed (${score}%) - Take quiz again`;
        } else {
            return `Excellent (${score}%)`;
        }
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastSession = localStorage.getItem('python-last-session-date');
        
        if (lastSession === today) {
            return;
        }
        
        localStorage.setItem('python-last-session-date', today);
        this.currentStreak++;
        this.saveProgress();
        this.updateProgressDisplay();

        if (this.currentStreak % 7 === 0) {
            this.showNotification('Awesome! You have a 7-day streak!', true, null);
        }
    }

    updateContinueLearningSection() {
        const continueSection = document.getElementById('continue-learning');
        if (continueSection) {
            if (this.lessonsCompleted.length === 0) {
                continueSection.innerHTML = `
                    <div class="lesson-card">
                        <div class="card-icon"><i class="fas fa-book-open"></i></div>
                        <div class="card-content">
                            <h4>Introduction to Python</h4>
                            <p>Start your Python journey with basics</p>
                            <a href="lessons.html#getting-started" class="card-btn">Start Lesson</a>
                        </div>
                    </div>
                `;
            } else {
                const nextLesson = this.lessonsCompleted.length + 1;
                const lessonTitles = {
                    1: "Introduction to Python",
                    2: "Variables & Data Types", 
                    3: "Control Flow",
                    4: "Functions",
                    5: "Objects & Classes",
                    6: "Libraries & Frameworks"
                };
                const nextTitle = lessonTitles[nextLesson] || "Next Lesson";
                const canAccess = this.canAccessLesson(nextLesson);
                
                let buttonText = "Start Lesson"; let buttonClass = "card-btn";
                if (!canAccess) {
                    buttonText = "Complete Quiz to Unlock"; buttonClass = "card-btn locked"; 
                }
                
                continueSection.innerHTML = `
                    <div class="lesson-card ${!canAccess ? 'locked' : ''}">
                        <div class="card-icon"><i class="fas fa-redo"></i></div>
                        <div class="card-content">
                            <h4>Continue Learning</h4>
                            <p>You're on track! Complete Lesson ${nextLesson}: ${nextTitle}</p>
                            <p style="color: #667eea; font-size: 0.9rem; margin-top: 0.5rem;">
                                Status: ${this.getQuizStatusText(nextLesson)}
                            </p>
                            <a href="${canAccess ? 'lessons.html#' + lessonTitles[nextLesson]?.toLowerCase().replace(/\s+/g, '-') : '#'}" class="${buttonClass}" ${!canAccess ? 'onclick="return false;"' : ''} onclick="return ${!canAccess}">${buttonText}</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    updateQuizStatus() {
        document.querySelectorAll('.quiz-status').forEach(statusElement => {
            const lessonId = parseInt(statusElement.getAttribute('data-lesson-id'));
            statusElement.textContent = this.getQuizStatusText(lessonId);
            
            const statusElementParent = statusElement.closest('.lesson-card');
            if (statusElementParent) {
                statusElementParent.classList.toggle('quiz-failed', !this.canAccessLesson(lessonId) && lessonId !== 1);
            }
        });
    }

    showNotification(message, isStreak = false, lessonId = null) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isStreak ? '#48bb78' : lessonId && !this.lessonsCompleted.includes(lessonId) ? '#ed8936' : '#667eea'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;

        if (lessonId && !this.lessonsCompleted.includes(lessonId)) {
            notification.textContent = message + ' - Complete the quiz to unlock!';
        } else {
            notification.textContent = message;
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    setupEventListeners() {
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const btn = e.target.closest('.card-btn');
                if (btn) {
                    e.preventDefault();
                    const targetUrl = btn.getAttribute('href');
                    if (targetUrl) {
                        window.location.href = targetUrl;
                    }
                }
            });
        });

        document.querySelectorAll('.path-step').forEach(step => {
            step.addEventListener('click', () => {
                const lessonNumber = step.querySelector('.step-number').textContent;
                const lessonName = step.querySelector('h4').textContent;
                this.showNotification(`Starting Lesson ${lessonNumber}: ${lessonName}...`, false, null);
            });
        });

        document.querySelectorAll('.exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const exerciseId = btn.getAttribute('data-exercise-id');
                if (exerciseId) {
                    this.markExerciseCompleted(exerciseId);
                    const explanation = document.getElementById(`explanation-${exerciseId}`);
                    if (explanation) {
                        explanation.style.display = 'block';
                    }
                }
            });
        });

        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const questionElement = e.target.closest('.quiz-question');
                if (!questionElement) return;
                
                const questionId = questionElement.getAttribute('data-question-id');
                const lessonId = parseInt(questionElement.getAttribute('data-lesson-id'));
                const selectedOption = e.target.closest('.quiz-option');
                const correctAnswer = questionElement.getAttribute('data-correct-answer');
                
                if (selectedOption.classList.contains('selected')) {
                    return;
                }
                
                document.querySelectorAll('.quiz-question[data-lesson-id="' + lessonId + '"] .quiz-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                selectedOption.classList.add('selected');
                
                const isCorrect = this.checkQuizAnswer(lessonId, questionId, selectedOption.textContent.trim(), correctAnswer);
                
                const resultText = document.getElementById(`result-${lessonId}-${questionId}`);
                if (resultText) {
                    resultText.style.display = 'block';
                    if (isCorrect) {
                        resultText.innerHTML = '<span style="color: #48bb78;"><i class="fas fa-check-circle"></i> Correct! Great job!</span>';
                    } else {
                        resultText.innerHTML = `<span style="color: #e53e3e;"><i class="fas fa-times-circle"></i> Incorrect. The correct answer is: ${correctAnswer}</span>`;
                    }
                }
                
                const checkAnswerBtn = document.getElementById(`check-answer-btn-${lessonId}`);
                if (checkAnswerBtn) {
                    const hasAllAnswers = document.querySelectorAll('.quiz-question[data-lesson-id="' + lessonId + '"] .quiz-option.selected').length === 
                        document.querySelectorAll('.quiz-question[data-lesson-id="' + lessonId + '"] .quiz-option').length;
                    
                    if (hasAllAnswers) {
                        checkAnswerBtn.style.display = 'block';
                    }
                }
            });
        });

        document.querySelectorAll('.check-answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = parseInt(btn.getAttribute('data-lesson-id'));
                this.markLessonCompleted(lessonId);
                this.showNotification('Quiz completed! Lesson unlocked!', false, lessonId);
            });
        });

        document.querySelectorAll('.hint-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const hintId = toggle.getAttribute('data-hint-id');
                const hintContent = document.getElementById(`hint-content-${hintId}`);
                if (hintContent) {
                    if (hintContent.style.display === 'none' || hintContent.style.display === '') {
                        hintContent.style.display = 'block';
                        hintContent.innerHTML = '<span style="color: #718096; font-style: italic;">Hint: ' + hintContent.innerHTML + '</span>';
                        toggle.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Hint';
                    } else {
                        hintContent.style.display = 'none';
                        toggle.innerHTML = '<i class="fas fa-lightbulb"></i> Need a hint?';
                    }
                }
            });
        });
    }

    startDailyReminder() {
        const lastReminder = localStorage.getItem('python-last-reminder');
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (!lastReminder || (hours === 19 && minutes === 0)) {
            this.showNotification('Time to code! Keep practicing Python daily!', false, null);
            localStorage.setItem('python-last-reminder', now.toISOString());
        }
    }
}

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .locked {
        opacity: 0.6;
        cursor: not-allowed;
        position: relative;
    }
    
    .locked::after {
        content: '🔒';
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 1.5rem;
    }
    
    .quiz-failed {
        border-left-color: #e53e3e !important;
        background: rgba(229, 62, 62, 0.05) !important;
    }
    
    .quiz-option.selected {
        background: #667eea !important;
        color: white !important;
        border-color: #667eea !important;
    }
    
    .quiz-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .result-text {
        margin-top: 10px;
        padding: 8px;
        border-radius: 4px;
        font-size: 0.9rem;
    }
    
    .hint-toggle {
        font-size: 0.8rem;
        margin-top: 8px;
        display: inline-block;
    }
    
    .quiz-summary {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
    }
    
    .quiz-hint {
        margin-top: 10px;
        padding: 10px;
        background: #f7fafc;
        border-left: 3px solid #cbd5e0;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

function selectQuizAnswer(lessonId, questionId, element, answer) {
    const app = new PythonLearningApp();
    app.checkQuizAnswer(lessonId, questionId, answer, document.querySelector(".quiz-question[data-lesson-id='" + lessonId + "'][data-question-id='" + questionId + "']").getAttribute('data-correct-answer'));
}

function toggleHint(hintId, event) {
    event.preventDefault();
    const hintContent = document.getElementById(hintId);
    const toggle = event.target.closest('.hint-toggle');
    
    if (hintContent.style.display === 'none' || hintContent.style.display === '') {
        hintContent.style.display = 'block';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Hint';
    } else {
        hintContent.style.display = 'none';
        toggle.innerHTML = '<i class="fas fa-lightbulb"></i> Need a hint?';
    }
}

function checkLessonQuiz(lessonId) {
    const app = new PythonLearningApp();
    app.markLessonCompleted(lessonId);
    alert('Quiz completed! Lesson ' + lessonId + ' unlocked for the next lesson!');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PythonLearningApp();
});
