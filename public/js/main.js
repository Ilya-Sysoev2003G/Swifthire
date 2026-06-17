/**
 * main.js - Основной клиентский скрипт для SwiftHire
 * Содержит общие функции и утилиты
 */

// API базовый URL
const API_URL = '/api';

/**
 * Утилита для выполнения fetch-запросов
 */
async function apiRequest(endpoint, options = {}) {
    try {
        // Если isFormData === true, не устанавливаем Content-Type
        // Браузер автоматически установит multipart/form-data с boundary
        const fetchOptions = {
            ...options
        };
        
        if (!options.isFormData) {
            fetchOptions.headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
        }
        
        // Удаляем флаг isFormData перед отправкой
        delete fetchOptions.isFormData;

        const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Произошла ошибка');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

/**
 * Утилита для выполнения fetch-запросов с файлами (FormData)
 */
async function apiRequestFile(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options
            // НЕ устанавливаем Content-Type, браузер сам установит multipart/form-data с boundary
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Произошла ошибка');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Показ уведомлений
 */
function showNotification(message, type = 'info') {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transition-all ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Форматирование даты
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Получение текущего пользователя
 */
async function getCurrentUser() {
    try {
        const user = await apiRequest('/auth/me');
        return user;
    } catch (error) {
        return null;
    }
}

/**
 * Проверка авторизации
 */
async function checkAuth() {
    const user = await getCurrentUser();
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    const profileLink = document.getElementById('profileLink');
    const chatLink = document.getElementById('chatLink');
    const dashboardLinkMobile = document.getElementById('dashboardLinkMobile');
    const profileLinkMobile = document.getElementById('profileLinkMobile');
    const chatLinkMobile = document.getElementById('chatLinkMobile');

    if (user) {
        // Пользователь авторизован
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'inline';
        if (profileLink) profileLink.style.display = 'inline';
        if (chatLink) chatLink.style.display = 'inline';
        if (dashboardLinkMobile) dashboardLinkMobile.style.display = 'block';
        if (profileLinkMobile) profileLinkMobile.style.display = 'block';
        if (chatLinkMobile) chatLinkMobile.style.display = 'block';
    } else {
        // Пользователь не авторизован
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
        if (chatLink) chatLink.style.display = 'none';
        if (dashboardLinkMobile) dashboardLinkMobile.style.display = 'none';
        if (profileLinkMobile) profileLinkMobile.style.display = 'none';
        if (chatLinkMobile) chatLinkMobile.style.display = 'none';
    }

    return user;
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Обработчик выхода
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    const handleLogout = async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
            showNotification('Вы успешно вышли из системы', 'success');
            setTimeout(() => {
                window.location.href = '/pages/index.html';
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }
});

/**
 * Создание карточки услуги
 */
function createServiceCard(service) {
    const imageHtml = service.image_url 
        ? `<img src="${service.image_url}" alt="${service.title}" class="w-full h-48 object-cover rounded-lg mb-4">` 
        : '';
    
    return `
        <div class="card">
            ${imageHtml}
            <h3 class="text-xl font-bold text-primary mb-2">${service.title}</h3>
            <p class="text-gray-600 mb-4 line-clamp-3">${service.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-primary">${formatPrice(service.price)}</span>
                <a href="/pages/service.html?id=${service.id}" class="btn-primary">Подробнее</a>
            </div>
        </div>
    `;
}

/**
 * Откликнуться на заказ
 */
function respondToOrder(orderId) {
    window.location.href = `/pages/order.html?id=${orderId}`;
}

/**
 * Создание карточки заказа
 */
function createOrderCard(order) {
    return `
        <div class="card">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-primary mb-2">${order.title}</h3>
                    <p class="text-gray-600 mb-2">${order.description}</p>
                    <span class="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        ${order.category}
                    </span>
                </div>
                <div class="text-right ml-4">
                    <div class="text-2xl font-bold text-primary">${formatPrice(order.budget)}</div>
                    <div class="text-sm text-gray-500">${formatDate(order.created_at)}</div>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="btn-primary flex-1" onclick="respondToOrder(${order.id})">Откликнуться</button>
                <a href="/pages/order.html?id=${order.id}" class="text-primary border-2 border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition text-center">
                    Подробнее
                </a>
            </div>
        </div>
    `;
}

// Добавить в существующий файл
async function checkUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (data.user && data.user.user_type === 'admin') {
            // Добавляем ссылку на админ-панель в навигацию
            const navDesk = document.querySelector('.nav-desktop');
            if (navDesk && !document.querySelector('.admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = '/pages/admin/support.html';
                adminLink.className = 'nav-link text-red-600 font-bold';
                adminLink.textContent = 'Админ панель';
                navDesk.appendChild(adminLink);
            }
        }
    } catch (error) {
        console.error('Error checking user role:', error);
    }
}

// Вызывать после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    checkUserRole();
});

// Функция для проверки прав администратора
async function checkIfAdmin() {
    try {
        const response = await fetch('/api/users/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('User data:', data); // Для отладки
            
            if (data.user && data.user.user_type === 'admin') {
                console.log('Admin detected, adding admin link');
                
                // Добавляем ссылку в десктопную навигацию
                const navDesk = document.querySelector('.nav-desktop');
                if (navDesk && !document.querySelector('.admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.href = '/pages/admin/support.html';
                    adminLink.className = 'nav-link text-red-600 font-bold';
                    adminLink.textContent = '👑 Админ панель';
                    navDesk.appendChild(adminLink);
                }
                
                // Добавляем ссылку в мобильное меню
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu && !document.querySelector('.admin-link-mobile')) {
                    const mobileLinks = mobileMenu.querySelector('.space-y-4');
                    if (mobileLinks) {
                        const adminLinkMobile = document.createElement('a');
                        adminLinkMobile.href = '/pages/admin/support.html';
                        adminLinkMobile.className = 'block py-3 px-4 text-red-600 font-bold hover:bg-gray-100 rounded';
                        adminLinkMobile.textContent = '👑 Админ панель';
                        mobileLinks.insertBefore(adminLinkMobile, mobileLinks.querySelector('.border-t'));
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkIfAdmin();
});

