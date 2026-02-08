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

// الوضع الليلي
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// تقسيم الأسئلة إلى مجموعات (فصول) - لأن لدينا 100 سؤال، سنقسمها إلى 10 مجموعات
const questionGroups = [
    {
        id: 1,
        name: "التشريح والفسيولوجيا",
        description: "أسئلة في تشريح وفسيولوجيا الأذن"
    },
    {
        id: 2,
        name: "فحوصات الأذن",
        description: "أسئلة في الفحوصات والاختبارات التشخيصية"
    },
    {
        id: 3,
        name: "أمراض الأذن الوسطى",
        description: "أسئلة في التهابات وأمراض الأذن الوسطى"
    },
    {
        id: 4,
        name: "الصمم وضعف السمع",
        description: "أسئلة في أنواع الصمم وضعف السمع"
    },
    {
        id: 5,
        name: "الأورام والأمراض الخاصة",
        description: "أسئلة في أورام وأمراض خاصة بالأذن"
    },
    {
        id: 6,
        name: "الجراحات والعلاجات",
        description: "أسئلة في الجراحات والعلاجات السمعية"
    },
    {
        id: 7,
        name: "العصب السمعي والدهليزي",
        description: "أسئلة في العصب السمعي والجهاز الدهليزي"
    },
    {
        id: 8,
        name: "التهابات الأذن الخارجية",
        description: "أسئلة في التهابات الأذن الخارجية"
    },
    {
        id: 9,
        name: "متلازمات وأمراض جهازية",
        description: "أسئلة في المتلازمات والأمراض الجهازية المرتبطة بالأذن"
    },
    {
        id: 10,
        name: "معلومات عامة",
        description: "أسئلة عامة في طب الأذن"
    }
];

// الحالة العامة للتطبيق
let currentChapterId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let showingResult = false;

// دالة بناء قائمة المجموعات
function populateChapterList() {
    if (!chapterList) return;

    chapterList.innerHTML = ''; // مسح المحتوى القديم

    questionGroups.forEach(chapter => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        
        const span = document.createElement('span');
        span.className = 'chapter-name';
        span.textContent = `${chapter.id}. ${chapter.name}`;
        
        a.appendChild(span);
        
        const desc = document.createElement('span');
        desc.className = 'chapter-desc';
        desc.textContent = chapter.description;
        a.appendChild(desc);
        
        a.dataset.chapterId = chapter.id;

        a.addEventListener('click', (event) => {
            event.preventDefault();
            startTest(chapter.id);
            // تفعيل النمط النشط في القائمة
            document.querySelectorAll('#chapter-list a').forEach(link => link.classList.remove('active'));
            a.classList.add('active');
        });

        li.appendChild(a);
        chapterList.appendChild(li);
    });
}

// الحصول على مجموعة الأسئلة حسب المعرف
function getChapterById(id) {
    return questionGroups.find(chapter => chapter.id === id) || null;
}

// الحصول على أسئلة المجموعة
function getQuestionsForChapter(chapterId) {
    // تقسيم الأسئلة الـ 100 إلى 10 مجموعات (10 أسئلة لكل مجموعة)
    const startIndex = (chapterId - 1) * 10;
    const endIndex = startIndex + 10;
    
    // تأكد أننا لا نتجاوز نهاية المصفوفة
    if (startIndex >= entMCQQuestions.length) {
        return [];
    }
    
    return entMCQQuestions.slice(startIndex, Math.min(endIndex, entMCQQuestions.length));
}

// عرض شاشة محددة
function showScreen(screenId) {
    [welcomeScreen, testScreen, resultsScreen, errorScreen, loadingScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    const screenToShow = document.getElementById(`${screenId}-screen`);
    if (screenToShow) screenToShow.classList.add('active');
}

// بدء الاختبار
async function startTest(chapterId) {
    showScreen('loading');
    currentChapterId = chapterId;
    const chapter = getChapterById(chapterId);

    if (!chapter) {
        showErrorScreen(`لم يتم العثور على المجموعة بالمعرف: ${chapterId}`);
        return;
    }

    try {
        // جلب الأسئلة للمجموعة المحددة
        const questionsForChapter = getQuestionsForChapter(chapterId);
        
        if (!questionsForChapter || questionsForChapter.length === 0) {
            showErrorScreen(`لم يتم العثور على أسئلة للمجموعة ${chapter.name}.`);
            return;
        }

        // تحويل الأسئلة إلى التنسيق المناسب
        currentQuestions = questionsForChapter.map(q => ({
            textStart: q.question,
            textEnd: '',
            options: q.options,
            correctAnswer: q.correctAnswer,
            id: q.id
        }));

        // خلط الأسئلة عشوائياً
        currentQuestions = shuffleArray(currentQuestions);

        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;
        showingResult = false;

        mainTitle.textContent = `اختبار ${chapter.name}`;
        testChapterTitle.textContent = `اختبار ${chapter.name}`;

        loadQuestion();
        showScreen('test');
    } catch (error) {
        console.error('Error loading questions:', error);
        showErrorScreen('حدث خطأ أثناء تحميل أسئلة الاختبار. يرجى المحاولة مرة أخرى.');
    }
}

// دالة لخلط المصفوفة عشوائياً
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// عرض سؤال
function loadQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultsScreen();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    selectedAnswer = null;
    showingResult = false;

    questionCounter.textContent = `السؤال ${currentQuestionIndex + 1} من ${currentQuestions.length}`;
    testProgress.value = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    questionTextStart.textContent = question.textStart;
    questionTextEnd.textContent = question.textEnd;
    optionsContainer.innerHTML = '';
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback-message';
    submitAnswerBtn.style.display = 'inline-flex';
    nextQuestionBtn.style.display = 'none';
    submitAnswerBtn.disabled = true;

    // خلط الخيارات عشوائياً
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option, index) => {
        const label = document.createElement('label');
        label.classList.add('option-label');
        label.htmlFor = `option-${index}`;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question';
        radio.id = `option-${index}`;
        radio.value = option;
        radio.addEventListener('change', () => {
            selectedAnswer = option;
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback-message';
            submitAnswerBtn.disabled = false;
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(option));
        optionsContainer.appendChild(label);
    });

    // التمرير إلى أعلى السؤال
    questionTextStart.scrollIntoView({ behavior: 'smooth' });
}

// التحقق من الإجابة
submitAnswerBtn.addEventListener('click', () => {
    if (!selectedAnswer) return;

    const current = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === current.correctAnswer;

    if (isCorrect) {
        score++;
        feedbackMessage.textContent = 'إجابة صحيحة ✅';
        feedbackMessage.classList.add('correct');
    } else {
        feedbackMessage.textContent = `إجابة خاطئة ❌. الصحيح: ${current.correctAnswer}`;
        feedbackMessage.classList.add('incorrect');
    }

    submitAnswerBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'inline-flex';
    showingResult = true;
});

// التالي
nextQuestionBtn.addEventListener('click', () => {
    if (!showingResult) return;
    currentQuestionIndex++;
    loadQuestion();
});

// عرض نتيجة الاختبار
function showResultsScreen() {
    showScreen('results');
    const chapter = getChapterById(currentChapterId);
    const percent = Math.round((score / currentQuestions.length) * 100);
    let message = `نتيجتك في اختبار ${chapter.name} هي ${score}/${currentQuestions.length} (${percent}%)`;
    
    // إضافة تقييم بناءً على النتيجة
    if (percent >= 90) {
        message += "\nممتاز! 👏";
    } else if (percent >= 75) {
        message += "\nجيد جداً! 👍";
    } else if (percent >= 60) {
        message += "\nمقبول، يمكنك التحسن 💪";
    } else {
        message += "\nيحتاج إلى مراجعة أكثر 📚";
    }
    
    resultsText.textContent = message;
}

// عرض شاشة الخطأ
function showErrorScreen(message) {
    showScreen('error');
    errorMessage.textContent = message;
}

// إعادة الاختبار
restartTestBtn.addEventListener('click', () => {
    if (currentChapterId) {
        startTest(currentChapterId);
    }
});

// أزرار العودة للرئيسية
[goHomeBtn, backToHomeBtn, errorGoHomeBtn].forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('welcome');
        mainTitle.textContent = 'اختبارات طب الأنف والأذن والحنجرة';
        document.querySelectorAll('#chapter-list a').forEach(link => link.classList.remove('active'));
    });
});

// زر "ابدأ بالمجموعة الأولى" (تم تغيير الاسم)
startFatihaBtn.addEventListener('click', () => {
    startTest(1);
});

// تحميل القائمة عند البداية
document.addEventListener('DOMContentLoaded', () => {
    populateChapterList();
    showScreen('welcome');
    // تغيير نص الزر
    if (startFatihaBtn) {
        startFatihaBtn.textContent = 'ابدأ بالمجموعة الأولى';
    }
    if (mainTitle) {
        mainTitle.textContent = 'اختبارات طب الأنف والأذن والحنجرة';
    }
});

// دالة لعرض إشعار (Toast)
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // إظهار التوجيه
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // إخفاء التوجيه بعد 3 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}