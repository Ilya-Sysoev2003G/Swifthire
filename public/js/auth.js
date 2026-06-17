/**
 * auth.js - Скрипт для авторизации и регистрации
 */

/**
 * Модальное окно регистрации
 */
function showRegisterModal() {
    const modalHTML = `
        <div id="registerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 class="text-2xl font-bold text-primary mb-6">Регистрация</h2>
                <form id="registerForm">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                            <input type="text" id="regName" name="name" required class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="regEmail" name="email" required class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                            <input type="password" id="regPassword" name="password" required class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Тип пользователя</label>
                            <select id="userType" name="userType" required class="w-full">
                                <option value="">Выберите тип</option>
                                <option value="customer">Заказчик</option>
                                <option value="performer">Исполнитель</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary w-full">Зарегистрироваться</button>
                        <button type="button" id="closeRegister" class="w-full text-gray-600 hover:text-gray-800">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Обработчики
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('closeRegister').addEventListener('click', () => {
        document.getElementById('registerModal').remove();
    });
}

/**
 * Модальное окно входа
 */
function showLoginModal() {
    const modalHTML = `
        <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 class="text-2xl font-bold text-primary mb-6">Вход</h2>
                <form id="loginForm">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="loginEmail" name="email" required class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                            <input type="password" id="loginPassword" name="password" required class="w-full">
                        </div>
                        <button type="submit" class="btn-primary w-full">Войти</button>
                        <button type="button" id="closeLogin" class="w-full text-gray-600 hover:text-gray-800">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Обработчики
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('closeLogin').addEventListener('click', () => {
        document.getElementById('loginModal').remove();
    });
}

/**
 * Обработка регистрации
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        userType: document.getElementById('userType').value
    };
    
    try {
        const result = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Регистрация успешна!', 'success');
        document.getElementById('registerModal').remove();
        
        // Перенаправление на дашборд
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
    }
}

/**
 * Обработка входа
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Вход выполнен успешно!', 'success');
        document.getElementById('loginModal').remove();
        
        // Перенаправление на дашборд
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
    }
}

/**
 * Инициализация обработчиков
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtnMobile = document.getElementById('loginBtnMobile');
    const registerBtnMobile = document.getElementById('registerBtnMobile');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    
    // Мобильные кнопки
    if (loginBtnMobile) {
        loginBtnMobile.addEventListener('click', showLoginModal);
    }
    
    if (registerBtnMobile) {
        registerBtnMobile.addEventListener('click', showRegisterModal);
    }
    
    // Загрузка данных пользователя для дашборда
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardData();
    }
});

/**
 * Загрузка данных для дашборда
 */
async function loadDashboardData() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = '/pages/index.html';
            return;
        }
        
        // Обновление данных на странице
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userType').textContent = 
            user.userType === 'customer' ? 'Заказчик' : 'Исполнитель';
        
        // Показ кнопок в зависимости от типа пользователя
        const createOrderBtn = document.getElementById('createOrderBtn');
        const createServiceBtn = document.getElementById('createServiceBtn');
        
        if (user.userType === 'customer') {
            // Показываем кнопку "Создать заказ" только для заказчиков
            if (createOrderBtn) createOrderBtn.style.display = 'block';
        } else if (user.userType === 'performer') {
            // Показываем кнопку "Создать услугу" только для исполнителей
            if (createServiceBtn) createServiceBtn.style.display = 'block';
        }
        
        // Форматирование даты регистрации
        const regDateElement = document.getElementById('regDate');
        if (regDateElement && user.created_at) {
            regDateElement.textContent = formatDate(user.created_at);
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

