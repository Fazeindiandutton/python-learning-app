// Python Learning App JavaScript

class PythonLearningApp {
    constructor() {
        this.storageKey = 'python-learning-app-progress';
        this.currentStreak = 0;
        this.lessonsCompleted = [];
        this.exercisesCompleted = [];
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
        }
    }

    saveProgress() {
        const progress = {
            currentStreak: this.currentStreak,
            lessonsCompleted: this.lessonsCompleted,
            exercisesCompleted: this.exercisesCompleted,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(progress));
    }

    updateProgressDisplay() {
        document.getElementById('completed-lessons').textContent = this.lessonsCompleted.length;
        document.getElementById('exercises-completed').textContent = this.exercisesCompleted.length;
        document.getElementById('streak').textContent = this.currentStreak;
        this.updateContinueLearningSection();
    }

    markLessonCompleted(lessonId) {
        if (!this.lessonsCompleted.includes(lessonId)) {
            this.lessonsCompleted.push(lessonId);
            this.saveProgress();
            this.updateProgressDisplay();
            this.showNotification('Lesson completed! Keep up the great work!');
            this.updateStreak();
        }
    }

    markExerciseCompleted(exerciseId) {
        if (!this.exercisesCompleted.includes(exerciseId)) {
            this.exercisesCompleted.push(exerciseId);
            this.saveProgress();
            this.updateProgressDisplay();
            this.showNotification('Exercise completed! Your coding skills are improving!');
            this.updateStreak();
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
            this.showNotification('Awesome! You have a 7-day streak!', true);
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
                
                continueSection.innerHTML = `
                    <div class="lesson-card">
                        <div class="card-icon"><i class="fas fa-redo"></i></div>
                        <div class="card-content">
                            <h4>Continue Learning</h4>
                            <p>You're on track! Complete Lesson ${nextLesson}: ${nextTitle}</p>
                            <a href="lessons.html#${lessonTitles[nextLesson]?.toLowerCase().replace(/\s+/g, '-')}" class="card-btn">Continue Learning</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    showNotification(message, isStreak = false) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isStreak ? '#48bb78' : '#667eea'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;

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
                this.showNotification(`Starting Lesson ${lessonNumber}: ${lessonName}...`);
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
    }

    startDailyReminder() {
        const lastReminder = localStorage.getItem('python-last-reminder');
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (!lastReminder || (hours === 19 && minutes === 0)) {
            this.showNotification('Time to code! Keep practicing Python daily!');
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
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PythonLearningApp();
});