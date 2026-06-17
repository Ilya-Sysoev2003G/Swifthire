/**
 * order.js - Скрипт для работы с заказами
 */

// Глобальная переменная для хранения информации о текущем заказе
let currentOrderData = null;

/**
 * Загрузка списка заказов
 */
async function loadOrders() {
    try {
        const orders = await apiRequest('/orders');
        displayOrders(orders);
    } catch (error) {
        console.error('Load orders error:', error);
    }
}

/**
 * Отображение заказов
 */
function displayOrders(orders) {
    const container = document.getElementById('ordersResults');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="text-6xl mb-4">📋</div>
                <h3 class="text-2xl font-bold text-gray-600 mb-2">Заказы пока не добавлены</h3>
                <p class="text-gray-500">Будьте первым, кто создаст заказ!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(createOrderCard).join('');
}

/**
 * Поиск заказов
 */
async function searchOrders() {
    const query = document.getElementById('searchQuery')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const minBudget = document.getElementById('minBudget')?.value || '';
    const maxBudget = document.getElementById('maxBudget')?.value || '';
    
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (minBudget) params.append('minBudget', minBudget);
    if (maxBudget) params.append('maxBudget', maxBudget);
    
    try {
        const orders = await apiRequest(`/orders/search?${params}`);
        displaySearchResults(orders);
    } catch (error) {
        console.error('Search orders error:', error);
    }
}

/**
 * Отображение результатов поиска заказов
 */
function displaySearchResults(orders) {
    const container = document.getElementById('ordersResults');
    const noResults = document.getElementById('noResults');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    container.innerHTML = orders.map(createOrderCard).join('');
}

/**
 * Создание нового заказа
 */
async function createOrder(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        budget: document.getElementById('budget').value,
        description: document.getElementById('description').value,
    };
    
    try {
        await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Заказ успешно создан!', 'success');
        
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Create order error:', error);
    }
}

/**
 * Загрузка информации о заказе
 */
async function loadOrderDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showError('ID заказа не указан');
            return;
        }
        
        const [order, currentUser, responses] = await Promise.all([
            apiRequest(`/orders/${orderId}`),
            getCurrentUser(),
            apiRequest(`/orders/${orderId}/responses`)
        ]);
        
        // Сохраняем данные о заказе глобально
        currentOrderData = { order, currentUser };
        
        displayOrderDetails(order, currentUser, responses);
        displayOrderResponses(responses, currentUser, order);
        
    } catch (error) {
        console.error('Load order details error:', error);
        showError('Ошибка загрузки заказа');
    }
}

/**
 * Отображение информации о заказе
 */
function displayOrderDetails(order, currentUser, responses = []) {
    const loading = document.getElementById('loading');
    const orderInfo = document.getElementById('orderInfo');
    
    if (loading) loading.classList.add('hidden');
    if (orderInfo) orderInfo.classList.remove('hidden');
    
    // Заполняем данные
    document.getElementById('orderTitle').textContent = order.title;
    document.getElementById('orderDescription').textContent = order.description;
    document.getElementById('orderCategory').textContent = getCategoryName(order.category);
    document.getElementById('orderBudget').textContent = `${order.budget} ₽`;
    document.getElementById('orderDate').textContent = formatDate(order.created_at);
    
    // Отображаем заказчика и исполнителя с кликабельными ссылками
    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) {
        let customerHtml = order.customer_name 
            ? `<a href="/pages/profile.html?id=${order.customer_id}" class="text-primary hover:underline cursor-pointer">${order.customer_name}</a>`
            : 'Не указан';
        
        // Если выбран исполнитель, показываем его
        if (order.performer_id && order.performer_name) {
            customerHtml += `<br><span class="text-sm text-gray-500">Исполнитель: <a href="/pages/profile.html?id=${order.performer_id}" class="text-primary font-semibold hover:underline cursor-pointer">${order.performer_name}</a></span>`;
        }
        
        customerNameEl.innerHTML = customerHtml;
    }
    
    // Статус
    const statusElement = document.getElementById('orderStatus');
    statusElement.textContent = getStatusName(order.status);
    statusElement.className = `px-3 py-1 rounded-full text-white ${getStatusClass(order.status)}`;
    
    // Проверяем роли и статус
    const isOwner = !!currentUser && Number(order.customer_id) === Number(currentUser.id);
    const isOrderPerformer = !!currentUser && order.performer_id && Number(order.performer_id) === Number(currentUser.id);
    const isPerformer = !!currentUser && currentUser.userType === 'performer';
    const orderOpen = order.status === 'open';
    const alreadyResponded = !!currentUser && Array.isArray(responses) && responses.some(r => Number(r.performer_id) === Number(currentUser.id));
    
    // Скрываем все кнопки сначала
    hideAllControls();
    
    // Владелец видит ownerControls только если заказ в работе
    const ownerControls = document.getElementById('ownerControls');
    if (ownerControls && isOwner && order.status === 'in_progress') {
        ownerControls.classList.remove('hidden');
    }
    
    // Кнопка "Закрыть задачу" для заказчика (только для открытых заказов)
    const closeOrderControls = document.getElementById('closeOrderControls');
    if (closeOrderControls && isOwner && orderOpen) {
        closeOrderControls.classList.remove('hidden');
    }
    
    // Кнопка отклика показывается только не владельцу-исполнителю, если заказ открыт и он ещё не откликался
    const responseControls = document.getElementById('responseControls');
    if (responseControls && !isOwner && isPerformer && orderOpen && !alreadyResponded) {
        responseControls.classList.remove('hidden');
    }
    
    // Кнопка "Сдать работу" для исполнителя (статус in_progress)
    const performerControls = document.getElementById('performerControls');
    if (performerControls && isOrderPerformer && order.status === 'in_progress') {
        performerControls.classList.remove('hidden');
    }
    
    // Кнопки "Принять"/"Вернуть" для заказчика (статус pending)
    const customerPendingControls = document.getElementById('customerPendingControls');
    if (customerPendingControls && isOwner && order.status === 'pending') {
        customerPendingControls.classList.remove('hidden');
    }
    
    // Кнопка "Оставить отзыв" (статус completed) - проверяем, не оставлен ли отзыв уже
    if (order.status === 'completed' && (isOwner || isOrderPerformer)) {
        checkAndShowReviewButton(order, isOwner, isOrderPerformer);
    }
}

/**
 * Скрыть все кнопки управления
 */
function hideAllControls() {
    const controls = [
        'ownerControls', 
        'closeOrderControls',
        'responseControls', 
        'performerControls', 
        'customerPendingControls', 
        'reviewControls'
    ];
    
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

/**
 * Проверить и показать кнопку отзыва, если отзыв еще не был оставлен
 */
async function checkAndShowReviewButton(order, isOwner, isOrderPerformer) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        // Получаем все отзывы по этому заказу
        const reviews = await apiRequest(`/reviews/order/${orderId}`);
        const currentUserId = currentOrderData?.currentUser?.id;
        
        if (!currentUserId) return;
        
        // Проверяем, оставлял ли текущий пользователь уже отзыв
        const hasReviewed = reviews && reviews.some(review => 
            Number(review.reviewer_id) === Number(currentUserId)
        );
        
        // Если отзыв уже оставлен, не показываем кнопку
        if (hasReviewed) return;
        
        // Показываем кнопку отзыва
        const reviewControls = document.getElementById('reviewControls');
        if (reviewControls) {
            // Сохраняем информацию о том, кому оставляем отзыв
            if (isOwner && order.performer_id) {
                reviewControls.dataset.revieweeId = order.performer_id;
                reviewControls.dataset.revieweeName = order.performer_name;
                reviewControls.classList.remove('hidden');
            } else if (isOrderPerformer && order.customer_id) {
                reviewControls.dataset.revieweeId = order.customer_id;
                reviewControls.dataset.revieweeName = order.customer_name;
                reviewControls.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Check review error:', error);
    }
}

/**
 * Загрузка откликов на заказ
 */
async function loadOrderResponses(orderId) {
    try {
        const responses = await apiRequest(`/orders/${orderId}/responses`);
        displayOrderResponses(responses);
    } catch (error) {
        console.error('Load responses error:', error);
    }
}

/**
 * Отображение откликов
 */
function displayOrderResponses(responses, currentUser = null, order = null) {
    const responsesList = document.getElementById('responsesList');
    const noResponses = document.getElementById('noResponses');
    
    if (responses.length === 0) {
        if (responsesList) responsesList.innerHTML = '';
        if (noResponses) noResponses.classList.remove('hidden');
        return;
    }
    
    if (noResponses) noResponses.classList.add('hidden');
    if (responsesList) {
        const isOwner = !!currentUser && !!order && Number(order.customer_id) === Number(currentUser.id);
        const hasPerformer = !!order && !!order.performer_id;
        
        responsesList.innerHTML = responses.map(response => createResponseCard(response, isOwner, hasPerformer)).join('');
        
        // Добавляем обработчики для кнопок
        if (isOwner) {
            responses.forEach(response => {
                // Обработчик для кнопки "Написать"
                const contactBtn = document.getElementById(`contactPerformer_${response.id}`);
                if (contactBtn) {
                    contactBtn.addEventListener('click', () => contactPerformer(response.performer_id, response.performer_name));
                }
                
                // Обработчик для кнопки "Выбрать"
                const selectBtn = document.getElementById(`selectPerformer_${response.id}`);
                if (selectBtn) {
                    selectBtn.addEventListener('click', () => selectPerformer(response.performer_id));
                }
            });
        }
    }
}

/**
 * Выбор исполнителя для заказа
 */
async function selectPerformer(performerId) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showNotification('Ошибка: ID заказа не найден', 'error');
            return;
        }
        
        // Подтверждение выбора
        if (!confirm('Вы уверены, что хотите выбрать этого исполнителя? Заказ перейдет в статус "В работе".')) {
            return;
        }
        
        // Вызываем API для назначения исполнителя
        await apiRequest(`/orders/${orderId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ performerId: parseInt(performerId) })
        });
        
        showNotification('Исполнитель успешно выбран!', 'success');
        
        // Перезагружаем страницу для отображения обновленной информации
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Select performer error:', error);
        showNotification('Ошибка при выборе исполнителя', 'error');
    }
}

/**
 * Создание отклика
 */
async function createResponse(e) {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    const formData = {
        message: document.getElementById('responseMessage').value,
        price: document.getElementById('responsePrice').value,
        countDays: document.getElementById('responseDays').value
    };
    
    try {
        await apiRequest(`/orders/${orderId}/responses`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Отклик успешно отправлен!', 'success');
        closeResponseModal();
        
        // Перезагружаем отклики и обновляем отображение
        const [responses, currentUser] = await Promise.all([
            apiRequest(`/orders/${orderId}/responses`),
            getCurrentUser()
        ]);
        
        // Обновляем отображение откликов
        displayOrderResponses(responses, currentUser, currentOrderData?.order);
        
        // Обновляем отображение деталей заказа (скроет кнопку "Откликнуться")
        if (currentOrderData?.order) {
            displayOrderDetails(currentOrderData.order, currentUser, responses);
        }
        
    } catch (error) {
        console.error('Create response error:', error);
        showNotification('Ошибка отправки отклика', 'error');
    }
}

/**
 * Изменение статуса заказа
 */
async function changeOrderStatus(e) {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const newStatus = document.getElementById('newStatus').value;
    
    try {
        await apiRequest(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        showNotification('Статус заказа изменен!', 'success');
        closeStatusModal();
        
        // Перезагружаем страницу
        location.reload();
        
    } catch (error) {
        console.error('Change status error:', error);
        showNotification('Ошибка изменения статуса', 'error');
    }
}

/**
 * Показать модальное окно отклика
 */
function showResponseModal() {
    const modal = document.getElementById('responseModal');
    if (modal) modal.classList.remove('hidden');
}

/**
 * Закрыть модальное окно отклика
 */
function closeResponseModal() {
    const modal = document.getElementById('responseModal');
    if (modal) modal.classList.add('hidden');
    
    // Очищаем форму
    const form = document.getElementById('responseForm');
    if (form) form.reset();
}

/**
 * Показать модальное окно изменения статуса
 */
function showStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.classList.remove('hidden');
}

/**
 * Закрыть модальное окно изменения статуса
 */
function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.classList.add('hidden');
}

/**
 * Показать ошибку
 */
function showError(message) {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (loading) loading.classList.add('hidden');
    if (errorMessage) errorMessage.classList.remove('hidden');
    if (errorText) errorText.textContent = message;
}

/**
 * Закрыть задачу (заказчик: open -> cancelled)
 */
async function closeOrder() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showNotification('Ошибка: ID заказа не найден', 'error');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите закрыть задачу? Это действие нельзя отменить.')) {
            return;
        }
        
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        showNotification('Задача закрыта', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Close order error:', error);
        showNotification('Ошибка при закрытии задачи', 'error');
    }
}

/**
 * Сдать работу (исполнитель: in_progress -> pending)
 */
async function submitWork() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showNotification('Ошибка: ID заказа не найден', 'error');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите сдать работу на проверку?')) {
            return;
        }
        
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'pending' })
        });
        
        showNotification('Работа отправлена на проверку!', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Submit work error:', error);
        showNotification('Ошибка при отправке работы', 'error');
    }
}

/**
 * Принять работу (заказчик: pending -> completed)
 */
async function acceptWork() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showNotification('Ошибка: ID заказа не найден', 'error');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите принять работу? Заказ будет завершён.')) {
            return;
        }
        
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'completed' })
        });
        
        showNotification('Работа принята! Заказ завершён.', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Accept work error:', error);
        showNotification('Ошибка при принятии работы', 'error');
    }
}

/**
 * Вернуть работу на доработку (заказчик: pending -> in_progress)
 */
async function returnWork() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        
        if (!orderId) {
            showNotification('Ошибка: ID заказа не найден', 'error');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите вернуть работу на доработку?')) {
            return;
        }
        
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'in_progress' })
        });
        
        showNotification('Работа возвращена на доработку', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Return work error:', error);
        showNotification('Ошибка при возврате работы', 'error');
    }
}

/**
 * Показать модальное окно для отзыва
 */
function showReviewModal() {
    const reviewControls = document.getElementById('reviewControls');
    const reviewModal = document.getElementById('reviewModal');
    const revieweeName = document.getElementById('revieweeName');
    
    if (reviewControls && reviewModal && revieweeName) {
        const name = reviewControls.dataset.revieweeName;
        revieweeName.textContent = name || 'пользователя';
        reviewModal.classList.remove('hidden');
    }
}

/**
 * Закрыть модальное окно отзыва
 */
function closeReviewModal() {
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) reviewModal.classList.add('hidden');
    
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    
    // Сброс отображения рейтинга
    const ratingDisplay = document.getElementById('ratingDisplay');
    if (ratingDisplay) ratingDisplay.textContent = '★★★★★';
}

/**
 * Отправить отзыв
 */
async function submitReview(e) {
    e.preventDefault();
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        const reviewControls = document.getElementById('reviewControls');
        
        if (!orderId || !reviewControls) {
            showNotification('Ошибка: недостаточно данных для отправки отзыва', 'error');
            return;
        }
        
        const revieweeId = reviewControls.dataset.revieweeId;
        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value;
        
        await apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify({
                orderId: parseInt(orderId),
                revieweeId: parseInt(revieweeId),
                rating: parseInt(rating),
                comment: comment
            })
        });
        
        showNotification('Отзыв успешно отправлен!', 'success');
        closeReviewModal();
        
        // Скрываем кнопку "Оставить отзыв"
        reviewControls.classList.add('hidden');
        
    } catch (error) {
        console.error('Submit review error:', error);
        showNotification('Ошибка при отправке отзыва', 'error');
    }
}

/**
 * Создание чата с исполнителем
 */
async function contactPerformer(performerId, performerName) {
    try {
        if (!currentOrderData || !currentOrderData.order) {
            showNotification('Ошибка: информация о заказе не найдена', 'error');
            return;
        }
        
        const orderId = currentOrderData.order.id;
        
        // Создаем чат с исполнителем
        const response = await apiRequest('/chats/create-with-order-performer', {
            method: 'POST',
            body: JSON.stringify({
                orderId: orderId,
                performerId: performerId
            })
        });
        
        if (response && response.chatId) {
            // Перенаправляем на страницу чата
            window.location.href = `/pages/chat.html?id=${response.chatId}`;
        }
    } catch (error) {
        console.error('Contact performer error:', error);
        showNotification('Ошибка создания чата с исполнителем', 'error');
    }
}

/**
 * Вспомогательные функции
 */
function getCategoryName(category) {
    const categories = {
        'design': 'Дизайн',
        'development': 'Разработка',
        'marketing': 'Маркетинг',
        'writing': 'Копирайтинг'
    };
    return categories[category] || category;
}

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createResponseCard(response, isOwner = false, hasPerformer = false) {
    const performerNameHtml = response.performer_name 
        ? `<a href="/pages/profile.html?id=${response.performer_id}" class="text-primary hover:underline cursor-pointer">${response.performer_name}</a>`
        : 'Исполнитель';
        
    return `
        <div class="border rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold">${performerNameHtml}</h4>
                    <p class="text-sm text-gray-600">${formatDate(response.created_at)}</p>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-primary">${response.price} ₽</div>
                    <div class="text-sm text-gray-600">${response.count_days} дней</div>
                </div>
            </div>
            <p class="text-gray-700 mb-3">${response.message}</p>
            ${isOwner ? `
                <div class="flex justify-end space-x-2">
                    <button id="contactPerformer_${response.id}" 
                            class="btn-secondary text-sm px-4 py-2">
                        Написать
                    </button>
                    ${!hasPerformer ? `
                        <button id="selectPerformer_${response.id}" 
                                data-performer-id="${response.performer_id}"
                                class="btn-primary text-sm px-4 py-2">
                            Выбрать
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    // Страница поиска заказов
    if (window.location.pathname.includes('search-orders.html')) {
        loadOrders();
        
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', searchOrders);
        }
    }
    
    // Страница создания заказа
    if (window.location.pathname.includes('edit-order.html')) {
        const form = document.getElementById('orderForm');
        if (form) {
            form.addEventListener('submit', createOrder);
        }
    }
    
    // Страница просмотра заказа
    if (window.location.pathname.includes('order.html')) {
        loadOrderDetails();
        
        // Обработчики основных кнопок
        const respondBtn = document.getElementById('respondBtn');
        if (respondBtn) {
            respondBtn.addEventListener('click', showResponseModal);
        }
        
        // Обработчик кнопки закрытия задачи
        const closeOrderBtn = document.getElementById('closeOrderBtn');
        if (closeOrderBtn) {
            closeOrderBtn.addEventListener('click', closeOrder);
        }
        
        // Обработчики кнопок управления статусом
        const submitWorkBtn = document.getElementById('submitWorkBtn');
        if (submitWorkBtn) {
            submitWorkBtn.addEventListener('click', submitWork);
        }
        
        const acceptWorkBtn = document.getElementById('acceptWorkBtn');
        if (acceptWorkBtn) {
            acceptWorkBtn.addEventListener('click', acceptWork);
        }
        
        const returnWorkBtn = document.getElementById('returnWorkBtn');
        if (returnWorkBtn) {
            returnWorkBtn.addEventListener('click', returnWork);
        }
        
        // Обработчик кнопки отзыва
        const leaveReviewBtn = document.getElementById('leaveReviewBtn');
        if (leaveReviewBtn) {
            leaveReviewBtn.addEventListener('click', showReviewModal);
        }
        
        // Обработчики модальных окон
        const responseForm = document.getElementById('responseForm');
        if (responseForm) {
            responseForm.addEventListener('submit', createResponse);
        }
        
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', submitReview);
        }
        
        const cancelResponseBtn = document.getElementById('cancelResponseBtn');
        if (cancelResponseBtn) {
            cancelResponseBtn.addEventListener('click', closeResponseModal);
        }
        
        const cancelReviewBtn = document.getElementById('cancelReviewBtn');
        if (cancelReviewBtn) {
            cancelReviewBtn.addEventListener('click', closeReviewModal);
        }
        
        // Обработчик для обновления отображения звезд рейтинга
        const reviewRating = document.getElementById('reviewRating');
        const ratingDisplay = document.getElementById('ratingDisplay');
        if (reviewRating && ratingDisplay) {
            reviewRating.addEventListener('input', () => {
                const value = parseInt(reviewRating.value);
                ratingDisplay.textContent = '★'.repeat(value) + '☆'.repeat(5 - value);
            });
        }
        
        // Закрытие модальных окон по клику вне их
        const responseModal = document.getElementById('responseModal');
        const reviewModal = document.getElementById('reviewModal');
        
        if (responseModal) {
            responseModal.addEventListener('click', (e) => {
                if (e.target === responseModal) {
                    closeResponseModal();
                }
            });
        }
        
        if (reviewModal) {
            reviewModal.addEventListener('click', (e) => {
                if (e.target === reviewModal) {
                    closeReviewModal();
                }
            });
        }
    }
});
