// عناصر DOM
const chapterList = document.getElementById('chapter-list');
const mainTitle = document.getElementById('main-title');
const welcomeScreen = document.getElementById('welcome-screen');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const errorScreen = document.getElementById('error-screen');
const loadingScreen = document.getElementById('loading-screen');
const startFatihaBtn = document.getElementById('start-fatiha-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const testChapterTitle = document.getElementById('test-chapter-title');
const questionCounter = document.getElementById('question-counter');
const testProgress = document.getElementById('test-progress');
const questionTextStart = document.getElementById('question-start');
const questionTextEnd = document.getElementById('question-end');
const optionsContainer = document.getElementById('options-container');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const feedbackMessage = document.getElementById('feedback-message');
const resultsText = document.getElementById('results-text');
const restartTestBtn = document.getElementById('restart-test-btn');
const goHomeBtn = document.getElementById('go-home-btn');
const errorGoHomeBtn = document.getElementById('error-go-home-btn');
const errorMessage = document.getElementById('error-message');
const toastContainer = document.getElementById('toast-container');
const menuToggle = document.getElementById('menu-toggle');

// متغيرات التطبيق
let currentChapterId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let showingResult = false;
let selectedOptionIndex = null;

// فصول الأسئلة
const questionChapters = [
    { id: 1, name: "تشريح وفسيولوجيا", description: "أسئلة في التشريح والفسيولوجيا الأساسية" },
    { id: 2, name: "فحوصات تشخيصية", description: "اختبارات وفحوصات تشخيصية" },
    { id: 3, name: "أمراض الأذن الوسطى", description: "التهابات وأمراض الأذن الوسطى" },
    { id: 4, name: "اضطرابات السمع", description: "الصمم وضعف السمع بأنواعه" },
    { id: 5, name: "أورام الأذن", description: "الأورام والأمراض الخاصة" },
    { id: 6, name: "العلاجات والجراحات", description: "العلاجات والتدخلات الجراحية" },
    { id: 7, name: "العصب السمعي", description: "أمراض العصب السمعي والدهليزي" },
    { id: 8, name: "التهابات الأذن", description: "التهابات الأذن الخارجية" },
    { id: 9, name: "المتلازمات", description: "المتلازمات المرتبطة بالأذن" },
    { id: 10, name: "معلومات عامة", description: "أسئلة عامة في طب الأنف والأذن" }
];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // إعداد الوضع الليلي
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // تحميل القائمة
    populateChapterList();
    
    // تعيين معالجات الأحداث
    setupEventListeners();
    
    // فحص التهيئة
    initializeApp();
    
    // إظهار رسالة ترحيب
    showToast('مرحباً بك في اختبارات طب الأنف والأذن والحنجرة', 'success');
});

// دالة تهيئة التطبيق
function initializeApp() {
    // التحقق من وجود بيانات الأسئلة
    if (!entMCQQuestions || entMCQQuestions.length === 0) {
        console.error('لم يتم العثور على بيانات الأسئلة');
        showErrorScreen('لم يتم العثور على بيانات الأسئلة. يرجى تحديث الصفحة.');
        return;
    }
    
    console.log(`تم تحميل ${entMCQQuestions.length} سؤال`);
    
    // إظهار شاشة الترحيب
    showScreen('welcome');
}

// تعيين معالجات الأحداث
function setupEventListeners() {
    // زر البدء بالفصل الأول
    if (startFatihaBtn) {
        startFatihaBtn.addEventListener('click', () => {
            showToast('جارٍ تحضير الأسئلة...', 'info');
            startTest(1);
        });
    }

    // زر التحقق من الإجابة
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', checkAnswer);
    }

    // زر التالي
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', nextQuestion);
    }

    // زر إعادة الاختبار
    if (restartTestBtn) {
        restartTestBtn.addEventListener('click', restartTest);
    }

    // أزرار العودة
    [goHomeBtn, backToHomeBtn, errorGoHomeBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                showScreen('welcome');
                updateMainTitle('اختبارات طب الأنف والأذن والحنجرة');
                // إغلاق القائمة الجانبية على الجوال
                document.querySelector('.sidebar')?.classList.remove('open');
            });
        }
    });

    // زر القائمة الجانبية للجوال
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('open');
        });
    }
}

// تبديل الوضع الليلي/النهاري
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(isDark ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري', 'info');
}

// تحديث عنوان الصفحة الرئيسية
function updateMainTitle(title) {
    if (mainTitle) mainTitle.textContent = title;
}

// عرض شاشة معينة
function showScreen(screenId) {
    const screens = [welcomeScreen, testScreen, resultsScreen, errorScreen, loadingScreen];
    screens.forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) targetScreen.classList.add('active');
}

// ملء قائمة الفصول
function populateChapterList() {
    if (!chapterList) return;
    
    chapterList.innerHTML = '';
    
    questionChapters.forEach(chapter => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        
        const chapterNumber = document.createElement('span');
        chapterNumber.className = 'chapter-number';
        chapterNumber.textContent = chapter.id.toString().padStart(2, '0');
        
        const chapterContent = document.createElement('div');
        chapterContent.className = 'chapter-content';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'chapter-title';
        titleSpan.textContent = chapter.name;
        
        const descSpan = document.createElement('span');
        descSpan.className = 'chapter-desc';
        descSpan.textContent = chapter.description;
        
        chapterContent.appendChild(titleSpan);
        chapterContent.appendChild(descSpan);
        
        a.appendChild(chapterNumber);
        a.appendChild(chapterContent);
        a.dataset.chapterId = chapter.id;
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const chapterId = parseInt(a.dataset.chapterId);
            startTest(chapterId);
            // تفعيل العنصر النشط
            document.querySelectorAll('#chapter-list a').forEach(link => {
                link.classList.remove('active');
            });
            a.classList.add('active');
            // إغلاق القائمة على الجوال
            document.querySelector('.sidebar')?.classList.remove('open');
        });
        
        li.appendChild(a);
        chapterList.appendChild(li);
    });
}

// الحصول على فصل بالمعرف
function getChapterById(chapterId) {
    return questionChapters.find(chapter => chapter.id === chapterId);
}

// الحصول على أسئلة الفصل
function getQuestionsForChapter(chapterId) {
    const startIndex = (chapterId - 1) * 10;
    const endIndex = startIndex + 10;
    
    if (startIndex >= entMCQQuestions.length) {
        return entMCQQuestions.slice(startIndex);
    }
    
    return entMCQQuestions.slice(startIndex, Math.min(endIndex, entMCQQuestions.length));
}

// بدء الاختبار
function startTest(chapterId) {
    showScreen('loading');
    
    const chapter = getChapterById(chapterId);
    if (!chapter) {
        showErrorScreen('الفصل المطلوب غير موجود');
        return;
    }
    
    const questions = getQuestionsForChapter(chapterId);
    if (!questions || questions.length === 0) {
        showErrorScreen('لا توجد أسئلة متاحة لهذا الفصل');
        return;
    }
    
    // إعداد حالة الاختبار
    currentChapterId = chapterId;
    currentQuestions = shuffleArray([...questions]);
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    showingResult = false;
    
    // تحديث العناوين
    updateMainTitle(`اختبار ${chapter.name}`);
    if (testChapterTitle) {
        testChapterTitle.textContent = `اختبار ${chapter.name}`;
    }
    
    // تحميل السؤال الأول
    setTimeout(() => {
        loadQuestion();
        showScreen('test');
        showToast(`بدأت اختبار ${chapter.name}`, 'success');
    }, 500);
}

// خلط المصفوفة عشوائياً
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// تحميل السؤال الحالي
function loadQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultsScreen();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    selectedAnswer = null;
    selectedOptionIndex = null;
    showingResult = false;
    
    // تحديث معلومات السؤال
    if (questionCounter) {
        questionCounter.textContent = `السؤال ${currentQuestionIndex + 1} من ${currentQuestions.length}`;
    }
    if (testProgress) {
        testProgress.value = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    }
    if (questionTextStart) {
        questionTextStart.textContent = question.question;
    }
    if (questionTextEnd) {
        questionTextEnd.textContent = '';
    }
    
    // مسح الخيارات القديمة
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
    }
    
    // إعادة تعيين الزرين
    if (submitAnswerBtn) {
        submitAnswerBtn.style.display = 'inline-flex';
        submitAnswerBtn.disabled = true;
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.style.display = 'none';
    }
    if (feedbackMessage) {
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
    }
    
    // خلط وإضافة الخيارات
    const shuffledOptions = shuffleArray([...question.options]);
    
    shuffledOptions.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option-label';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question-option';
        radio.value = option;
        radio.id = `option-${index}`;
        
        radio.addEventListener('change', () => {
            // إزالة التحديد من جميع الخيارات
            document.querySelectorAll('.option-label').forEach(l => {
                l.classList.remove('selected');
            });
            
            // تحديد الخيار الحالي
            label.classList.add('selected');
            selectedAnswer = option;
            selectedOptionIndex = index;
            if (submitAnswerBtn) {
                submitAnswerBtn.disabled = false;
            }
        });
        
        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = option;
        
        label.appendChild(radio);
        label.appendChild(optionText);
        
        if (optionsContainer) {
            optionsContainer.appendChild(label);
        }
    });
    
    // التمرير إلى الأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// التحقق من الإجابة
function checkAnswer() {
    if (!selectedAnswer || showingResult) return;
    
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // تحديث النتيجة
    if (isCorrect) {
        score++;
        if (feedbackMessage) {
            feedbackMessage.textContent = 'إجابة صحيحة! 🎉';
            feedbackMessage.className = 'feedback-message success';
        }
        
        // تمييز الإجابة الصحيحة
        const correctOption = Array.from(document.querySelectorAll('.option-text'))
            .find(span => span.textContent === question.correctAnswer);
        if (correctOption) {
            correctOption.closest('.option-label').classList.add('correct');
        }
    } else {
        if (feedbackMessage) {
            feedbackMessage.textContent = `إجابة خاطئة. الإجابة الصحيحة: ${question.correctAnswer}`;
            feedbackMessage.className = 'feedback-message error';
        }
        
        // تمييز الإجابة الخاطئة والإجابة الصحيحة
        const selectedLabel = document.querySelector('.option-label.selected');
        if (selectedLabel) {
            selectedLabel.classList.add('incorrect');
        }
        
        const correctOption = Array.from(document.querySelectorAll('.option-text'))
            .find(span => span.textContent === question.correctAnswer);
        if (correctOption) {
            correctOption.closest('.option-label').classList.add('correct');
        }
    }
    
    // تعطيل جميع الخيارات
    document.querySelectorAll('.option-label').forEach(label => {
        label.classList.add('disabled');
        label.querySelector('input').disabled = true;
    });
    
    // إظهار زر التالي
    if (submitAnswerBtn) {
        submitAnswerBtn.style.display = 'none';
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.style.display = 'inline-flex';
    }
    showingResult = true;
    
    // إظهار إشعار
    if (isCorrect) {
        showToast('إجابة صحيحة! استمر في التقدم', 'success');
    } else {
        showToast('تعلم من الخطأ واستمر', 'error');
    }
}

// الانتقال إلى السؤال التالي
function nextQuestion() {
    if (!showingResult) return;
    
    currentQuestionIndex++;
    loadQuestion();
}

// عرض نتائج الاختبار
function showResultsScreen() {
    showScreen('results');
    
    const chapter = getChapterById(currentChapterId);
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    let resultMessage = `نتيجتك في اختبار ${chapter.name}: `;
    resultMessage += `${score}/${currentQuestions.length} (${percentage}%)`;
    
    // إضافة تعليق بناءً على النتيجة
    if (percentage >= 90) {
        resultMessage += "\n\nممتاز! أداء رائع 👏";
    } else if (percentage >= 75) {
        resultMessage += "\n\nجيد جداً! 👍";
    } else if (percentage >= 60) {
        resultMessage += "\n\nمقبول، يمكنك التحسن 💪";
    } else {
        resultMessage += "\n\nيحتاج إلى مزيد من الدراسة 📚";
    }
    
    if (resultsText) {
        resultsText.textContent = resultMessage;
    }
    
    // إظهار إشعار بالنتيجة
    showToast(`اكتمل الاختبار! نتيجتك: ${percentage}%`, 'success');
}

// إعادة الاختبار
function restartTest() {
    if (currentChapterId) {
        startTest(currentChapterId);
    }
}

// عرض شاشة الخطأ
function showErrorScreen(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    showScreen('error');
}

// عرض إشعار (Toast)
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = `toast-icon fas ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        'fa-info-circle'
    }`;
    
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    });
    
    content.appendChild(messageSpan);
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);
    
    // إظهار الإشعار
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إخفاء الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// إضافة CSS للفصول
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .chapter-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: var(--sidebar-accent);
            color: var(--sidebar-foreground);
            border-radius: var(--radius);
            font-weight: 700;
            font-size: 0.875rem;
            flex-shrink: 0;
        }
        
        .chapter-content {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            flex-grow: 1;
        }
        
        .chapter-title {
            font-weight: 600;
            font-size: 1rem;
            color: var(--sidebar-foreground);
        }
        
        .chapter-desc {
            font-size: 0.8125rem;
            color: var(--muted-foreground);
            line-height: 1.4;
        }
        
        #chapter-list li a {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            transition: all 0.2s ease;
        }
        
        #chapter-list li a:hover {
            background-color: var(--sidebar-accent);
        }
        
        #chapter-list li a:hover .chapter-number {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }
        
        #chapter-list li a.active {
            background-color: var(--sidebar-accent);
            color: var(--primary);
        }
        
        #chapter-list li a.active .chapter-number {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }
        
        .option-text {
            flex-grow: 1;
            text-align: right;
            margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .sidebar.open {
                transform: translateX(0);
            }
            
            .menu-toggle {
                display: flex;
            }
        }
    `;
    document.head.appendChild(style);
});