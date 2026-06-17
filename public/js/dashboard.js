/**
 * dashboard.js - Скрипт для личного кабинета
 */

/**
 * Загрузка последней активности пользователя
 */
async function loadRecentActivity() {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return;
        }

        // Загрузка полных данных пользователя для получения даты регистрации
        const userData = await apiRequest(`/users/${user.id}`);
        if (userData && userData.created_at) {
            const regDateElement = document.getElementById('regDate');
            if (regDateElement) {
                regDateElement.textContent = formatDate(userData.created_at);
            }
        }

        const activityContainer = document.getElementById('recentActivity');
        const activityTitle = document.getElementById('activityTitle');
        
        if (user.userType === 'customer') {
            // Загрузка заказов заказчика
            activityTitle.textContent = 'Мои заказы';
            await loadUserOrders(user.id, activityContainer);
        } else if (user.userType === 'performer') {
            // Загрузка услуг исполнителя
            activityTitle.textContent = 'Мои услуги';
            await loadUserServices(user.id, activityContainer);
            
            // Загрузка статистики заказов исполнителя по performer_id
            await loadPerformerOrderStats(user.id);
            
            // Загрузка рейтинга исполнителя
            await loadUserRating(user.id);
            
            // Загрузка активных заказов для исполнителя
            await loadActiveOrders(user.id);
        }
    } catch (error) {
        console.error('Load recent activity error:', error);
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = '<p class="text-red-500 text-center py-8">Ошибка загрузки данных</p>';
    }
}

/**
 * Загрузка рейтинга пользователя
 */
async function loadUserRating(userId) {
    try {
        const data = await apiRequest(`/reviews/user/${userId}`);
        
        const ratingElement = document.getElementById('userRating');
        const ratingCountElement = document.getElementById('userRatingCount');
        
        if (data.rating && data.rating.averageRating > 0) {
            ratingElement.textContent = data.rating.averageRating;
            ratingCountElement.textContent = `(${data.rating.totalReviews} отзывов)`;
        } else {
            ratingElement.textContent = '—';
            ratingCountElement.textContent = '(нет отзывов)';
        }
    } catch (error) {
        console.error('Load rating error:', error);
        const ratingElement = document.getElementById('userRating');
        const ratingCountElement = document.getElementById('userRatingCount');
        if (ratingElement) ratingElement.textContent = '—';
        if (ratingCountElement) ratingCountElement.textContent = '(нет отзывов)';
    }
}

/**
 * Загрузка заказов пользователя
 */
async function loadUserOrders(userId, container) {
    try {
        const orders = await apiRequest(`/orders/user/${userId}`);
        
        if (!orders || orders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">У вас пока нет заказов</p>';
            return;
        }

        // Получаем статистику
        updateOrderStats(orders);

        // Отображаем последние 5 заказов
        const recentOrders = orders.slice(0, 5);
        container.innerHTML = recentOrders.map(order => createOrderActivityCard(order)).join('');
    } catch (error) {
        console.error('Load user orders error:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-8">Ошибка загрузки заказов</p>';
    }
}

/**
 * Загрузка услуг пользователя
 */
async function loadUserServices(userId, container) {
    try {
        const services = await apiRequest(`/services/user/${userId}`);
        
        if (!services || services.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">У вас пока нет услуг</p>';
            return;
        }

        // Обновляем статистику (используем услуги как "заказы" для статистики)
        updateServiceStats(services);

        // Отображаем последние 5 услуг
        const recentServices = services.slice(0, 5);
        container.innerHTML = recentServices.map(service => createServiceActivityCard(service)).join('');
    } catch (error) {
        console.error('Load user services error:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-8">Ошибка загрузки услуг</p>';
    }
}

/**
 * Обновление статистики заказов
 */
function updateOrderStats(orders) {
    const total = orders.length;
    const active = orders.filter(o => o.status === 'open' || o.status === 'in_progress').length;
    const completed = orders.filter(o => o.status === 'completed').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('activeOrders').textContent = active;
    document.getElementById('completedOrders').textContent = completed;
}

/**
 * Обновление статистики услуг
 */
function updateServiceStats(services) {
    const total = services.length;
    const active = services.filter(s => s.status === 'active').length;
    const inactive = services.filter(s => s.status === 'inactive').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('activeOrders').textContent = active;
    document.getElementById('completedOrders').textContent = inactive;
}

/**
 * Загрузка статистики заказов для исполнителя (по performer_id)
 */
async function loadPerformerOrderStats(performerId) {
    try {
        const orders = await apiRequest(`/orders/performer/${performerId}`);
        
        if (orders && orders.length > 0) {
            const total = orders.length;
            const active = orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length;
            const completed = orders.filter(o => o.status === 'completed').length;

            document.getElementById('totalOrders').textContent = total;
            document.getElementById('activeOrders').textContent = active;
            document.getElementById('completedOrders').textContent = completed;
        }
    } catch (error) {
        console.error('Load performer order stats error:', error);
    }
}

/**
 * Создание карточки заказа для активности
 */
function createOrderActivityCard(order) {
    const statusText = getStatusName(order.status);
    const statusColor = getStatusClass(order.status);
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <h4 class="font-bold text-primary text-lg mb-1">${order.title}</h4>
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">${order.description}</p>
                    <div class="flex items-center space-x-2">
                        <span class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            ${order.category}
                        </span>
                        <span class="inline-block ${statusColor} px-2 py-1 rounded text-xs">
                            ${statusText}
                        </span>
                    </div>
                </div>
                <div class="text-right ml-4">
                    <div class="text-xl font-bold text-primary mb-1">${formatPrice(order.budget)}</div>
                    <div class="text-xs text-gray-500">${formatDate(order.created_at)}</div>
                </div>
            </div>
            <div class="flex justify-end mt-3">
                <a href="/pages/order.html?id=${order.id}" class="btn-primary text-sm">
                    Перейти
                </a>
            </div>
        </div>
    `;
}

/**
 * Создание карточки услуги для активности
 */
function createServiceActivityCard(service) {
    const statusText = service.status === 'active' ? 'Активна' : 'Неактивна';
    const statusColor = service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <h4 class="font-bold text-primary text-lg mb-1">${service.title}</h4>
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">${service.description}</p>
                    <div class="flex items-center space-x-2">
                        <span class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            ${service.category}
                        </span>
                        <span class="inline-block ${statusColor} px-2 py-1 rounded text-xs">
                            ${statusText}
                        </span>
                    </div>
                </div>
                <div class="text-right ml-4">
                    <div class="text-xl font-bold text-primary mb-1">${formatPrice(service.price)}</div>
                    <div class="text-xs text-gray-500">${formatDate(service.created_at)}</div>
                </div>
            </div>
            <div class="flex justify-end mt-3">
                <a href="/pages/service.html?id=${service.id}" class="btn-primary text-sm">
                    Перейти
                </a>
            </div>
        </div>
    `;
}

/**
 * Получение текста статуса заказа
 */
function getStatusName(status) {
    const statuses = {
        'open': 'Открыт',
        'in_progress': 'В работе',
        'pending': 'Ожидает приёмки',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

function getStatusClass(status) {
    const classes = {
        'open': 'bg-green-500',
        'in_progress': 'bg-blue-500',
        'pending': 'bg-yellow-500',
        'completed': 'bg-gray-500',
        'cancelled': 'bg-red-500'
    };
    return classes[status] || 'bg-gray-500';
}

/**
 * Загрузка активных заказов для исполнителя
 */
async function loadActiveOrders(performerId) {
    try {
        const orders = await apiRequest(`/orders/performer/${performerId}`);
        
        // Фильтруем только активные заказы (pending и in_progress)
        const activeOrders = orders.filter(order => 
            order.status === 'pending' || order.status === 'in_progress'
        );
        
        const activeOrdersSection = document.getElementById('activeOrdersSection');
        const activeOrdersList = document.getElementById('activeOrdersList');
        
        if (activeOrders.length === 0) {
            activeOrdersList.innerHTML = '<p class="text-gray-500 text-center py-8">У вас пока нет активных заказов</p>';
            activeOrdersSection.classList.remove('hidden');
            return;
        }
        
        // Показываем секцию
        activeOrdersSection.classList.remove('hidden');
        
        // Отображаем активные заказы в виде таблицы
        activeOrdersList.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="text-left p-3 font-semibold text-gray-700">ID</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Название</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Категория</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Бюджет</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Статус</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Дата</th>
                            <th class="text-left p-3 font-semibold text-gray-700">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeOrders.map(order => createActiveOrderRow(order)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Load active orders error:', error);
        const activeOrdersList = document.getElementById('activeOrdersList');
        activeOrdersList.innerHTML = '<p class="text-red-500 text-center py-8">Ошибка загрузки активных заказов</p>';
    }
}

/**
 * Создание строки таблицы для активного заказа
 */
function createActiveOrderRow(order) {
    const statusText = getStatusName(order.status);
    const statusColor = getStatusClass(order.status);

    return `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="p-3 text-gray-700">#${order.id}</td>
            <td class="p-3">
                <div class="font-medium text-primary">${order.title}</div>
                ${order.customer_name ? `<div class="text-xs text-gray-500">Заказчик: ${order.customer_name}</div>` : ''}
            </td>
            <td class="p-3 text-gray-600">${order.category}</td>
            <td class="p-3 font-bold text-primary">${formatPrice(order.budget)}</td>
            <td class="p-3">
                <span class="inline-block ${statusColor} px-2 py-1 rounded text-xs">
                    ${statusText}
                </span>
            </td>
            <td class="p-3 text-gray-600 text-sm">${formatDate(order.created_at)}</td>
            <td class="p-3">
                <a href="/pages/order.html?id=${order.id}" class="btn-primary text-sm py-1 px-3">
                    Открыть
                </a>
            </td>
        </tr>
    `;
}

/**
 * Открыть модальное окно редактирования профиля
 */
async function openEditProfileModal() {
    try {
        const user = await getCurrentUser();
        if (!user) return;

        // Загружаем полные данные пользователя
        const userData = await apiRequest(`/users/${user.id}`);
        
        document.getElementById('editName').value = userData.name || '';
        document.getElementById('editEmail').value = userData.email || '';
        document.getElementById('editPassword').value = '';
        document.getElementById('editPasswordConfirm').value = '';
        
        document.getElementById('editProfileModal').classList.remove('hidden');
    } catch (error) {
        console.error('Open edit profile modal error:', error);
        showNotification('Ошибка загрузки данных профиля', 'error');
    }
}

/**
 * Закрыть модальное окно редактирования профиля
 */
function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.add('hidden');
    document.getElementById('editProfileForm').reset();
}

/**
 * Обработка формы редактирования профиля
 */
async function handleEditProfileSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;
    const passwordConfirm = document.getElementById('editPasswordConfirm').value;

    // Валидация
    if (!name || !email) {
        showNotification('Имя и Email обязательны', 'error');
        return;
    }

    // Проверка паролей, если введены
    if (password || passwordConfirm) {
        if (password !== passwordConfirm) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
    }

    try {
        const user = await getCurrentUser();
        if (!user) {
            showNotification('Пользователь не авторизован', 'error');
            return;
        }

        const updates = { name, email };
        if (password) {
            updates.password = password;
        }

        await apiRequest(`/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        showNotification('Профиль успешно обновлен', 'success');
        
        // Обновляем отображение данных на странице
        document.getElementById('userName').textContent = name;
        document.getElementById('userEmail').textContent = email;

        closeEditProfileModal();
        
        // Если изменили пароль, рекомендуем перелогиниться
        if (password) {
            setTimeout(() => {
                if (confirm('Пароль был изменен. Рекомендуем выйти и войти заново. Выйти сейчас?')) {
                    logout();
                }
            }, 500);
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification(error.message || 'Ошибка обновления профиля', 'error');
    }
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadRecentActivity();
        
        // Обработчики для редактирования профиля
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', openEditProfileModal);
        }
        
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', handleEditProfileSubmit);
        }
        
        const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
        if (cancelEditProfileBtn) {
            cancelEditProfileBtn.addEventListener('click', closeEditProfileModal);
        }
        
        // Закрытие модального окна по клику на фон
        const editProfileModal = document.getElementById('editProfileModal');
        if (editProfileModal) {
            editProfileModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeEditProfileModal();
                }
            });
        }
    }
});

