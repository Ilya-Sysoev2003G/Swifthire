// Обновленные данные уроков
const lessons = [
    {
        id: 1,
        title: "Вы — не только исполнитель, но и бизнес",
        content: `Это самый важный ментальный сдвиг. Вы больше не просто дизайнер, копирайтер или программист. Вы — директор, менеджер по продажам, бухгалтер и служба поддержки в одном лице.

Почему это важно? Если думать только как исполнитель, вы будете брать первый попавшийся заказ, занижать цену, работать без договора и "гореть" на втором месяце.`,
        practicalSteps: [
            {
                title: "Бухгалтерия",
                description: "Заведите отдельную банковскую карту для бизнеса. С первого дня записывайте всё: доходы с каждого проекта, расходы на программы (например, Figma, Adobe), курсы, рекламу, даже чашку кофе на встрече с клиентом."
            },
            {
                title: "Продажи и маркетинг",
                description: "Создайте профили на 2-3 ключевых фриланс-биржах (FL.ru, Upwork) и соцсетях (LinkedIn, Telegram-канал, Behance для дизайнеров)."
            },
            {
                title: "Портфолио",
                description: "Соберите портфолио сразу, даже если работ нет. Сделайте 2-3 тестовых проекта «для себя» или помогите знакомому за отзыв."
            }
        ],
        questions: [
            {
                question: "Почему важно думать о себе как о бизнесе, а не только как об исполнителе?",
                options: [
                    "Чтобы брать больше заказов",
                    "Чтобы избежать выгорания и работать системно",
                    "Чтобы производить впечатление на клиентов"
                ],
                correct: 1
            },
            {
                question: "Что из перечисленного важно вести с первого дня фриланса?",
                options: [
                    "Только доходы от проектов",
                    "Все финансовые операции: доходы и расходы",
                    "Только расходы на дорогое оборудование"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 2,
        title: "Цена = ценность, а не только потраченные часы",
        content: `Часы — это ваш внутренний ресурс, а не ценность для клиента. Клиенту все равно, потратите вы на логотип 3 часа или 3 дня. Ему важен результат: узнаваемый бренд, который привлечет клиентов.

Почему это важно? Почасовая оплата наказывает вас за опыт и эффективность (сделал быстрее — получил меньше). Она также не защищает от бесконечных мелких правок.`,
        example: {
            title: "Пример оценки проекта: Сайт для юриста",
            scenario: "Вам нужно оценить создание сайта-визитки для юриста.",
            hourlyApproach: "По часам: «Я делаю такой за 40 часов, моя ставка 500 руб./час. Итого 20 000 руб.»",
            valueApproach: "По ценности: «Господин юрист, качественный сайт для вас — это инструмент привлечения доверия и новых клиентов. Он будет работать на вас 24/7. С моим опытом в юридической нише, я создам для вас структурированный, убедительный сайт с формой заявки. Его стоимость — 40 000 руб.»",
            formula: "Формула ценообразования: Базовая стоимость (ваша экспертиза и время) + ценность результата для клиента + срочность"
        },
        questions: [
            {
                question: "Почему почасовая оплата может быть невыгодной для опытного фрилансера?",
                options: [
                    "Клиенты не любят платить за часы",
                    "Чем быстрее вы работаете, тем меньше получаете",
                    "Сложно вести учет времени"
                ],
                correct: 1
            },
            {
                question: "Что должно входить в техническое задание (ТЗ)?",
                options: [
                    "Только сроки и стоимость",
                    "Подробное описание объема работ и количества правок",
                    "Только общее описание задачи"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 3,
        title: "Резерв и договор — ваша главная защита",
        content: `Доверие — это хорошо, но бумага (даже в электронном виде) — лучше. Финансовая подушка спасает в моменты затишья, а договор спасает от недобросовестных клиентов.

Почему это важно? Без резерва вы в панике возьмете любой низкооплачиваемый заказ. Без договора вам могут не заплатить, потребовать бесконечные доработки или украсть вашу работу.`,
        steps: [
            {
                title: "Финансовый резерв",
                description: "Стремитесь накопить сумму, которой вам хватит на 3-6 месяцев жизни без заказов. Копите с каждого платежа (например, 10-20%)."
            },
            {
                title: "Электронный договор",
                description: "В ответ на обсуждение условий напишите: «[Имя клиента], подытожу наши договоренности... Вы согласны?». Его «Да, согласен» — это ваша защита."
            },
            {
                title: "Предоплата — правило №1",
                description: "30-50% — стандарт. Это фильтр от несерьезных клиентов и ваша гарантия, что вы не работаете впустую."
            }
        ],
        questions: [
            {
                question: "На какой срок рекомендуется иметь финансовый резерв?",
                options: [
                    "1-2 месяца",
                    "3-6 месяцев",
                    "Только на текущий месяц"
                ],
                correct: 1
            },
            {
                question: "Какой размер предоплаты считается стандартным?",
                options: [
                    "100% вперед",
                    "30-50% от суммы",
                    "10% после выполнения"
                ],
                correct: 1
            }
        ]
    },
    {
        id: 4,
        title: "Не ждите вдохновения. Дисциплина и процессы решают всё",
        content: `Романтика «свободного графика» заканчивается в первую же пятницу, когда вы понимаете, что вместо работы смотрели сериалы, а дедлайн — завтра.

Почему это важно? Хаос убивает продуктивность и приводит к выгоранию. Вы будете либо прокрастинировать, либо работать 24/7, без отдыха.`,
        techniques: [
            {
                title: "Метод Pomodoro",
                description: "25 минут фокусированной работы + 5 минут отдыха. После 4 циклов — длинный перерыв 15-30 минут."
            },
            {
                title: "Рабочая среда",
                description: "Отдельный стол, минимум отвлекающих факторов. Рабочее пространство должно настраивать на продуктивность."
            },
            {
                title: "Планирование",
                description: "Каждое воскресенье вечером планируйте неделю. Каждый вечер — список задач на завтра."
            },
            {
                title: "Автоматизация",
                description: "Шаблоны писем, откликов, счетов, договоров. Это экономит колоссальное количество энергии."
            }
        ],
        questions: [
            {
                question: "Что такое техника Pomodoro?",
                options: [
                    "Работа без перерывов весь день",
                    "25 минут работы / 5 минут отдыха",
                    "Работа только по вдохновению"
                ],
                correct: 1
            },
            {
                question: "Что важно автоматизировать в работе фрилансера?",
                options: [
                    "Только счета",
                    "Только письма клиентам",
                    "Все рутинные процессы: письма, отклики, счета"
                ],
                correct: 2
            }
        ]
    },
    {
        id: 5,
        title: "Репутация — ваш главный актив",
        content: `Во фрилансе вас нет в штате. Клиент покупает «кота в мешке» — ваше портфолио и рекомендации. Его уверенность в вас — это ваша валюта.

Почему это важно? Хорошая репутация позволяет повышать ставки, выбирать интересные проекты и получать заказы по рекомендациям, без борьбы на биржах.`,
        reputationBuilders: [
            {
                title: "Управление ожиданиями",
                description: "Лучше чуть занизить срок и сдать раньше, чем пообещать «завтра» и подвести."
            },
            {
                title: "Проактивная коммуникация",
                description: "Если случилась задержка (заболели, техническая проблема), сразу сообщите клиенту. Честность в проблемах повышает доверие."
            },
            {
                title: "Сбор доказательств успеха",
                description: "После завершения проекта попросите отзыв (текст + видео, если возможно). Ведите кейсы с цифровыми результатами."
            },
            {
                title: "Умение отказывать",
                description: "Если проект смущает (неадекватный клиент, слишком низкая цена), вежливо откажитесь. Один проблемный клиент отнимет время и нервы."
            }
        ],
        questions: [
            {
                question: "Что делать, если произошла задержка в работе?",
                options: [
                    "Молчать и надеяться, что клиент не заметит",
                    "Сразу сообщить клиенту и предложить новый срок",
                    "Работать ночами, чтобы успеть к сроку"
                ],
                correct: 1
            },
            {
                question: "Что является главным активом фрилансера?",
                options: [
                    "Дорогое оборудование",
                    "Большое количество выполненных проектов",
                    "Репутация и доверие клиентов"
                ],
                correct: 2
            }
        ]
    }
];

// Класс для уведомлений (остается без изменений)
class NotificationManager {
    constructor() {
        this.notificationId = 0;
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);

        const confirmContainer = document.createElement('div');
        confirmContainer.id = 'confirm-container';
        document.body.appendChild(confirmContainer);
    }

    showNotification({ title, message, type = 'info', duration = 4000 }) {
        const id = ++this.notificationId;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: '✓',
            warning: '⚠',
            info: 'ℹ',
            error: '✕'
        };

        notification.innerHTML = `
            <button class="notification-close">&times;</button>
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;

        document.getElementById('notification-container').appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        notification.querySelector('.notification-close').addEventListener('click', () => this.closeNotification(id));

        if (duration > 0) {
            setTimeout(() => this.closeNotification(id), duration);
        }

        return id;
    }

    closeNotification(id) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }

    showConfirm({ title, message, confirmText = 'Подтвердить', cancelText = 'Отмена', type = 'warning' }) {
        return new Promise((resolve) => {
            const confirmId = ++this.notificationId;
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.dataset.id = confirmId;

            const icons = {
                warning: '⚠',
                success: '✓',
                info: 'ℹ',
                error: '✕'
            };

            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-icon">${icons[type]}</div>
                    <div class="confirm-title">${title}</div>
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-buttons">
                        <button class="confirm-btn cancel">${cancelText}</button>
                        <button class="confirm-btn ${type}">${confirmText}</button>
                    </div>
                </div>
            `;

            document.getElementById('confirm-container').appendChild(overlay);
            setTimeout(() => overlay.classList.add('show'), 10);

            const cancelBtn = overlay.querySelector('.confirm-btn.cancel');
            const confirmBtn = overlay.querySelector(`.confirm-btn.${type}`);

            const cleanup = () => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            };

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }
}

class CourseProgress {
    constructor() {
        this.userId = this.getUserId();
        this.progressKey = `course_progress_${this.userId}`;
        this.loadProgress();
    }

    getUserId() {
        const userId = localStorage.getItem('user_id') || 'guest_' + Math.random().toString(36).substr(2, 9);
        if (!localStorage.getItem('user_id')) {
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    loadProgress() {
        const saved = localStorage.getItem(this.progressKey);
        if (saved) {
            this.progress = JSON.parse(saved);
        } else {
            this.progress = {
                completedLessons: [],
                quizAnswers: {},
                lastAccess: new Date().toISOString(),
                startedAt: new Date().toISOString()
            };
            this.saveProgress();
        }
    }

    saveProgress() {
        this.progress.lastAccess = new Date().toISOString();
        localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
    }

    completeLesson(lessonId) {
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.saveProgress();
            return true;
        }
        return false;
    }

    saveQuizAnswer(lessonId, questionIndex, answer) {
        if (!this.progress.quizAnswers[lessonId]) {
            this.progress.quizAnswers[lessonId] = {};
        }
        this.progress.quizAnswers[lessonId][questionIndex] = answer;
        this.saveProgress();
    }

    isLessonCompleted(lessonId) {
        return this.progress.completedLessons.includes(lessonId);
    }

    getCompletedCount() {
        return this.progress.completedLessons.length;
    }

    getProgressPercentage() {
        return Math.round((this.getCompletedCount() / lessons.length) * 100);
    }

    resetProgress() {
        this.progress = {
            completedLessons: [],
            quizAnswers: {},
            lastAccess: new Date().toISOString(),
            startedAt: new Date().toISOString()
        };
        this.saveProgress();
        return true;
    }
}

class CourseUI {
    constructor() {
        this.progressManager = new CourseProgress();
        this.notification = new NotificationManager();
        this.currentLesson = null;
        this.init();
    }

    init() {
        this.renderLessons();
        this.updateProgressBar();
        this.setupEventListeners();
        this.showWelcomeNotification();
    }

    showWelcomeNotification() {
        const completedCount = this.progressManager.getCompletedCount();
        if (completedCount === 0) {
            this.notification.showNotification({
                title: '🎓 Добро пожаловать на курс по фрилансу!',
                message: '5 практических уроков, которые изменят ваш подход к работе. Начните с первого урока!',
                type: 'info',
                duration: 5000
            });
        } else if (completedCount < lessons.length) {
            this.notification.showNotification({
                title: 'Продолжаем обучение!',
                message: `Вы завершили ${completedCount} из ${lessons.length} уроков.`,
                type: 'info',
                duration: 4000
            });
        }
    }

    renderLessons() {
        const container = document.getElementById('lessonsContainer');
        container.innerHTML = '';

        lessons.forEach(lesson => {
            const isCompleted = this.progressManager.isLessonCompleted(lesson.id);
            const completedQuestions = this.progressManager.progress.quizAnswers[lesson.id] || {};
            const questionCount = lesson.questions.length;
            const answeredCount = Object.keys(completedQuestions).length;
            
            const lessonElement = document.createElement('div');
            lessonElement.className = `bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isCompleted ? 'border-l-4 border-green-500' : ''}`;
            
            // Генерируем контент урока в зависимости от типа данных
            let lessonContentHTML = this.generateLessonContent(lesson);
            
            lessonElement.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-primary text-white'} flex items-center justify-center font-bold">
                                    ${lesson.id}
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">${lesson.title}</h3>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-sm ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}">
                                            ${isCompleted ? '✓ Завершено' : 'Не начато'}
                                        </span>
                                        ${questionCount > 0 ? `
                                            <span class="text-sm text-gray-400">•</span>
                                            <span class="text-sm text-gray-500">
                                                ${answeredCount}/${questionCount} вопросов
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="lesson-toggle-btn ${isCompleted ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-primary text-white hover:bg-purple-700'} px-5 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm"
                                data-lesson-id="${lesson.id}">
                            ${isCompleted ? 'Повторить' : 'Начать урок'}
                        </button>
                    </div>
                    
                    ${questionCount > 0 ? `
                        <div class="lesson-progress-indicator mb-4">
                            ${Array.from({ length: questionCount }, (_, i) => `
                                <div class="progress-dot ${completedQuestions[i] !== undefined ? 'completed' : ''} ${i === 0 ? 'current' : ''}"></div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div id="lesson-content-${lesson.id}" class="hidden mt-4 border-t pt-4">
                        ${lessonContentHTML}
                        
                        ${questionCount > 0 ? `
                            <div class="mb-6 mt-8">
                                <h4 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Проверка знаний</h4>
                                <div class="space-y-6">
                                    ${lesson.questions.map((q, qIndex) => {
                                        const isAnswered = completedQuestions[qIndex] !== undefined;
                                        return `
                                            <div class="bg-white p-5 rounded-xl border ${isAnswered ? 'border-green-200 bg-green-50' : 'border-gray-200'} transition-all duration-200">
                                                <p class="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                    <span class="w-6 h-6 rounded-full ${isAnswered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} flex items-center justify-center text-sm">
                                                        ${qIndex + 1}
                                                    </span>
                                                    ${q.question}
                                                </p>
                                                <div class="space-y-3">
                                                    ${q.options.map((option, oIndex) => {
                                                        const isSelected = completedQuestions[qIndex] === oIndex;
                                                        const isCorrect = q.correct === oIndex;
                                                        return `
                                                            <label class="flex items-center cursor-pointer group">
                                                                <input type="radio" 
                                                                       name="lesson-${lesson.id}-q${qIndex}" 
                                                                       value="${oIndex}"
                                                                       class="mr-3 w-5 h-5 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                                                                       ${isSelected ? 'checked' : ''}>
                                                                <span class="flex-1 p-3 rounded-lg transition-all duration-200 ${isSelected ? 
                                                                    (isCorrect ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800') : 
                                                                    'bg-gray-50 hover:bg-gray-100 border border-gray-200'}">
                                                                    ${option}
                                                                    ${isSelected && isCorrect ? ' ✓' : ''}
                                                                    ${isSelected && !isCorrect ? ' ✗' : ''}
                                                                </span>
                                                            </label>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="flex justify-between items-center mt-8 pt-6 border-t">
                            <button class="save-answers-btn text-primary border-2 border-primary px-5 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-200 font-medium flex items-center gap-2"
                                    data-lesson-id="${lesson.id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Сохранить ответы
                            </button>
                            <button class="complete-lesson-btn bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-md flex items-center gap-2"
                                    data-lesson-id="${lesson.id}">
                                ${isCompleted ? 'Обновить прогресс' : 'Завершить урок'}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(lessonElement);
        });

        this.setupLessonButtons();
    }

    generateLessonContent(lesson) {
        let contentHTML = `
            <div class="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div class="flex items-start gap-3">
                    <div class="text-primary text-lg">💡</div>
                    <div>
                        <p class="text-gray-700 leading-relaxed whitespace-pre-line">${lesson.content}</p>
                    </div>
                </div>
            </div>
        `;

        // Добавляем практические шаги, если они есть
        if (lesson.practicalSteps) {
            contentHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="text-green-600">✅</span>
                        Конкретные шаги:
                    </h4>
                    <div class="grid md:grid-cols-${Math.min(lesson.practicalSteps.length, 3)} gap-4">
                        ${lesson.practicalSteps.map(step => `
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div class="font-medium text-primary mb-2">${step.title}</div>
                                <p class="text-gray-600 text-sm">${step.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Добавляем пример, если он есть
        if (lesson.example) {
            contentHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="text-blue-600">📊</span>
                        ${lesson.example.title}
                    </h4>
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded-lg border border-blue-100">
                            <div class="font-medium text-gray-700 mb-2">Сценарий:</div>
                            <p class="text-gray-600">${lesson.example.scenario}</p>
                        </div>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div class="font-medium text-red-700 mb-2 flex items-center gap-2">
                                    <span>❌</span>
                                    Неправильный подход
                                </div>
                                <p class="text-red-600 text-sm">${lesson.example.hourlyApproach}</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div class="font-medium text-green-700 mb-2 flex items-center gap-2">
                                    <span>✅</span>
                                    Правильный подход
                                </div>
                                <p class="text-green-600 text-sm">${lesson.example.valueApproach}</p>
                            </div>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div class="font-medium text-yellow-700 mb-2">Формула:</div>
                            <p class="text-yellow-600">${lesson.example.formula}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Добавляем шаги, если они есть
        if (lesson.steps) {
            contentHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="text-purple-600">🛡️</span>
                        Ключевые правила:
                    </h4>
                    <div class="space-y-3">
                        ${lesson.steps.map(step => `
                            <div class="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                                <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                    ${lesson.steps.indexOf(step) + 1}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800 mb-1">${step.title}</div>
                                    <p class="text-gray-600 text-sm">${step.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Добавляем техники, если они есть
        if (lesson.techniques) {
            contentHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="text-indigo-600">⚙️</span>
                        Практические техники:
                    </h4>
                    <div class="grid md:grid-cols-${Math.min(lesson.techniques.length, 2)} gap-4">
                        ${lesson.techniques.map(tech => `
                            <div class="bg-white p-4 rounded-lg border border-indigo-100">
                                <div class="font-medium text-indigo-700 mb-2">${tech.title}</div>
                                <p class="text-gray-600 text-sm">${tech.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Добавляем строители репутации, если они есть
        if (lesson.reputationBuilders) {
            contentHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span class="text-amber-600">⭐</span>
                        Как строить репутацию:
                    </h4>
                    <div class="space-y-4">
                        ${lesson.reputationBuilders.map(builder => `
                            <div class="bg-white p-4 rounded-lg border border-amber-100">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                        ${lesson.reputationBuilders.indexOf(builder) + 1}
                                    </div>
                                    <div class="font-medium text-gray-800">${builder.title}</div>
                                </div>
                                <p class="text-gray-600 text-sm pl-11">${builder.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return contentHTML;
    }

    setupLessonButtons() {
        // Кнопки открытия/закрытия уроков
        document.querySelectorAll('.lesson-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = parseInt(e.target.dataset.lessonId);
                const content = document.getElementById(`lesson-content-${lessonId}`);
                
                if (this.currentLesson && this.currentLesson !== lessonId) {
                    const prevContent = document.getElementById(`lesson-content-${this.currentLesson}`);
                    if (prevContent) {
                        prevContent.classList.add('hidden');
                        const prevBtn = document.querySelector(`.lesson-toggle-btn[data-lesson-id="${this.currentLesson}"]`);
                        if (prevBtn) {
                            const isCompleted = this.progressManager.isLessonCompleted(this.currentLesson);
                            prevBtn.textContent = isCompleted ? 'Повторить' : 'Начать урок';
                        }
                    }
                }
                
                const isOpening = content.classList.contains('hidden');
                content.classList.toggle('hidden');
                
                const isCompleted = this.progressManager.isLessonCompleted(lessonId);
                btn.textContent = isOpening ? (isCompleted ? 'Свернуть' : 'Свернуть урок') : (isCompleted ? 'Повторить' : 'Начать урок');
                
                this.currentLesson = isOpening ? lessonId : null;
                
                if (isOpening && !isCompleted) {
                    this.notification.showNotification({
                        title: 'Урок открыт! 📚',
                        message: 'Внимательно изучите материал. Каждый пункт — это практический инструмент для вашей работы.',
                        type: 'info',
                        duration: 3000
                    });
                }
            });
        });

        // Кнопки сохранения ответов
        document.querySelectorAll('.save-answers-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = parseInt(e.target.dataset.lessonId);
                this.saveQuizAnswers(lessonId);
            });
        });

        // Кнопки завершения уроков
        document.querySelectorAll('.complete-lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = parseInt(e.target.dataset.lessonId);
                this.completeLesson(lessonId);
            });
        });
    }

    saveQuizAnswers(lessonId) {
        const lesson = lessons.find(l => l.id === lessonId);
        let savedCount = 0;
        let correctCount = 0;
        
        lesson.questions.forEach((q, qIndex) => {
            const selected = document.querySelector(`input[name="lesson-${lessonId}-q${qIndex}"]:checked`);
            if (selected) {
                const answer = parseInt(selected.value);
                this.progressManager.saveQuizAnswer(lessonId, qIndex, answer);
                savedCount++;
                if (answer === q.correct) {
                    correctCount++;
                }
            }
        });

        if (savedCount > 0) {
            const percentage = Math.round((correctCount / lesson.questions.length) * 100);
            this.notification.showNotification({
                title: savedCount === lesson.questions.length ? 'Все ответы сохранены! ✅' : 'Ответы сохранены',
                message: savedCount === lesson.questions.length ? 
                    `Правильных ответов: ${correctCount}/${lesson.questions.length} (${percentage}%)` :
                    `Сохранено ${savedCount} из ${lesson.questions.length} ответов`,
                type: savedCount === lesson.questions.length ? 'success' : 'info',
                duration: 3000
            });
            
            setTimeout(() => this.renderLessons(), 500);
        } else {
            this.notification.showNotification({
                title: 'Выберите ответы',
                message: 'Ответьте на вопросы перед сохранением.',
                type: 'warning',
                duration: 3000
            });
        }
    }

    async completeLesson(lessonId) {
        // Сначала сохраняем ответы
        this.saveQuizAnswers(lessonId);
        
        const wasCompleted = this.progressManager.isLessonCompleted(lessonId);
        const isNowCompleted = this.progressManager.completeLesson(lessonId);
        
        if (isNowCompleted && !wasCompleted) {
            // Обновляем UI
            this.renderLessons();
            this.updateProgressBar();
            
            // Определяем иконку для уведомления в зависимости от урока
            const lessonIcons = ['💼', '💰', '🛡️', '⚙️', '⭐'];
            const icon = lessonIcons[lessonId - 1] || '✅';
            
            this.notification.showNotification({
                title: `Урок ${lessonId} завершен! ${icon}`,
                message: 'Отличная работа! Вы освоили важный аспект фриланса.',
                type: 'success',
                duration: 4000
            });
            
            // Если это был последний урок
            if (this.progressManager.getCompletedCount() === lessons.length) {
                setTimeout(() => {
                    this.notification.showNotification({
                        title: '🎉 Поздравляем с завершением курса!',
                        message: 'Вы освоили все ключевые принципы успешного фриланса. Теперь у вас есть практические инструменты для построения устойчивого бизнеса.',
                        type: 'success',
                        duration: 6000
                    });
                }, 1000);
            }
        } else if (wasCompleted) {
            this.notification.showNotification({
                title: 'Прогресс уже сохранен',
                message: 'Вы уже завершили этот урок ранее.',
                type: 'info',
                duration: 3000
            });
        }
    }

    updateProgressBar() {
        const completedCount = this.progressManager.getCompletedCount();
        const totalLessons = lessons.length;
        const percent = this.progressManager.getProgressPercentage();
        
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        
        progressBar.style.transition = 'width 0.8s ease-in-out';
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        
        progressPercent.style.transition = 'all 0.3s';
        progressPercent.style.transform = 'scale(1.1)';
        setTimeout(() => {
            progressPercent.style.transform = 'scale(1)';
        }, 300);
    }

    setupEventListeners() {
        document.getElementById('resetProgressBtn').addEventListener('click', async () => {
            const confirmed = await this.notification.showConfirm({
                title: 'Сбросить прогресс обучения?',
                message: 'Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить. Все ваши ответы и завершенные уроки будут удалены.',
                confirmText: 'Сбросить прогресс',
                cancelText: 'Отмена',
                type: 'warning'
            });
            
            if (confirmed) {
                this.progressManager.resetProgress();
                this.renderLessons();
                this.updateProgressBar();
                
                this.notification.showNotification({
                    title: 'Прогресс сброшен',
                    message: 'Теперь вы можете начать обучение заново с чистого листа.',
                    type: 'success',
                    duration: 4000
                });
            }
        });
        
        const resetBtn = document.getElementById('resetProgressBtn');
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.classList.add('shadow-md', 'transform', '-translate-y-1');
        });
        
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.classList.remove('shadow-md', 'transform', '-translate-y-1');
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/course.css';
    document.head.appendChild(link);
    
    new CourseUI();
});