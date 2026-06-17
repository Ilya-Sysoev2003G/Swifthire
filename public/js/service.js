/**
 * service.js - Скрипт для работы с услугами
 */

/**
 * Загрузка списка услуг
 */
async function loadServices() {
    try {
        const services = await apiRequest('/services');
        displaySearchResults(services);
    } catch (error) {
        console.error('Load services error:', error);
    }
}

/**
 * Отображение услуг на главной странице
 */
function displayServices(services) {
    const container = document.getElementById('servicesGrid');

    if (!container) return;
    
    if (services.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-16">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-2xl font-bold text-gray-600 mb-2">Услуги пока не добавлены</h3>
                <p class="text-gray-500">Будьте первым, кто создаст услугу!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = services.slice(0, 6).map(createServiceCard).join('');
}

/**
 * Поиск услуг
 */
async function searchServices() {
    const query = document.getElementById('searchQuery')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const minPrice = document.getElementById('minPrice')?.value || '';
    const maxPrice = document.getElementById('maxPrice')?.value || '';
    
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    try {
        const services = await apiRequest(`/services/search?${params}`);
        displaySearchResults(services);
    } catch (error) {
        console.error('Search services error:', error);
    }
}

/**
 * Отображение результатов поиска услуг
 */
function displaySearchResults(services) {
    const container = document.getElementById('servicesResults');
    const noResults = document.getElementById('noResults');
    
    if (!container) return;
    
    if (services.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    container.innerHTML = services.map(createServiceCard).join('');
}

/**
 * Загрузка конкретной услуги
 */
async function loadServiceDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    try {
        const service = await apiRequest(`/services/${serviceId}`);
        const currentUser = await getCurrentUser();
        await displayServiceDetails(service, currentUser);
    } catch (error) {
        console.error('Load service error:', error);
        showNotification('Не удалось загрузить услугу', 'error');
    }
}

/**
 * Отображение деталей услуги
 */
async function displayServiceDetails(service, currentUser) {
    document.getElementById('serviceTitle').textContent = service.title;
    document.getElementById('serviceCategory').textContent = service.category;
    document.getElementById('servicePrice').textContent = formatPrice(service.price);
    document.getElementById('serviceDescription').textContent = service.description;
    document.getElementById('serviceDate').textContent = formatDate(service.created_at);
    document.getElementById('serviceStatus').textContent = 
        service.status === 'active' ? 'Активна' : 'Закрыта';
    
    // Отображение изображения услуги
    if (service.image_url) {
        const serviceImageContainer = document.getElementById('serviceImageContainer');
        const serviceImage = document.getElementById('serviceImage');
        serviceImage.src = service.image_url;
        serviceImageContainer.classList.remove('hidden');
    }
    
    // Отображение информации об исполнителе
    const performerName = service.performer_name || 'Пользователь';
    const performerId = service.performer_id;
    
    // Получаем первую букву имени для аватара
    const firstLetter = performerName.charAt(0).toUpperCase() || '?';
    document.getElementById('performerAvatar').textContent = firstLetter;
    
    // Устанавливаем имя исполнителя
    const performerNameElement = document.getElementById('performerName');
    performerNameElement.textContent = performerName;
    
    // Делаем имя кликабельным для перехода на профиль
    if (performerId) {
        performerNameElement.style.cursor = 'pointer';
        performerNameElement.onclick = () => {
            window.location.href = `/pages/profile.html?id=${performerId}`;
        };
    }
    
    // Загружаем и отображаем рейтинг исполнителя
    if (performerId) {
        try {
            const ratingData = await apiRequest(`/reviews/user/${performerId}`);
            const ratingElement = document.getElementById('performerRating');
            
            if (ratingData.rating && ratingData.rating.averageRating > 0) {
                ratingElement.textContent = `Рейтинг: ⭐ ${ratingData.rating.averageRating}`;
            } else {
                ratingElement.textContent = 'Рейтинг: ⭐ —';
            }
        } catch (error) {
            console.error('Load performer rating error:', error);
            document.getElementById('performerRating').textContent = 'Рейтинг: ⭐ —';
        }
    } else {
        document.getElementById('performerRating').textContent = 'Рейтинг: ⭐ —';
    }
    
    // Показываем соответствующие кнопки в зависимости от того, владелец ли пользователь
    const ownerButtons = document.getElementById('ownerButtons');
    const clientButtons = document.getElementById('clientButtons');
    const closeBtn = document.getElementById('closeBtn');

    if (service.isOwner) {
        // Пользователь - владелец услуги
        ownerButtons.classList.remove('hidden');
        clientButtons.classList.add('hidden');
        
        // Обновляем кнопку в зависимости от статуса услуги
        if (service.status === 'active') {
            closeBtn.textContent = 'Закрыть услугу';
        } else {
            closeBtn.textContent = 'Открыть услугу';
        }
    } else {
        // Полностью удаляем элемент из DOM для не-владельцев
        ownerButtons.remove();
        
        // Показываем кнопки клиента только для авторизованных пользователей
        if (currentUser) {
            clientButtons.classList.remove('hidden');
        } else {
            clientButtons.classList.add('hidden');
        }
    }
}

/**
 * Создание чата с исполнителем услуги
 */
async function createChatWithService() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    try {
        const response = await apiRequest('/chats/create-with-service', {
            method: 'POST',
            body: JSON.stringify({ serviceId: parseInt(serviceId) })
        });
        
        if (response.isNewChat) {
            showNotification('Чат создан! Переходим к общению...', 'success');
        } else {
            showNotification('Открываем существующий чат...', 'info');
        }
        
        // Переходим к чату
        setTimeout(() => {
            window.location.href = `/pages/chat.html?id=${response.chatId}`;
        }, 1000);
        
    } catch (error) {
        console.error('Create chat error:', error);
        if (error.message.includes('самого себя')) {
            showNotification('Вы не можете связаться с самим собой', 'error');
        } else {
            showNotification('Ошибка создания чата', 'error');
        }
    }
}

/**
 * Создание новой услуги
 */
async function createService(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    
    // Добавляем файл, если он выбран
    const imageInput = document.getElementById('serviceImage');
    if (imageInput && imageInput.files.length > 0) {
        const file = imageInput.files[0];
        
        // Валидация файла
        if (!validateImageFile(file)) {
            return;
        }
        
        formData.append('image', file);
    }
    
    try {
        await apiRequest('/services', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
        
        showNotification('Услуга успешно создана!', 'success');
        
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Create service error:', error);
        showNotification(error.message || 'Ошибка создания услуги', 'error');
    }
}

/**
 * Редактирование услуги
 */
async function editService() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    // Переходим на страницу редактирования
    window.location.href = `/pages/edit-service.html?id=${serviceId}`;
}

/**
 * Закрытие/открытие услуги
 */
async function toggleServiceStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    // Получаем текущий статус услуги
    const serviceStatus = document.getElementById('serviceStatus').textContent;
    const isActive = serviceStatus === 'Активна';
    
    const action = isActive ? 'закрыть' : 'открыть';
    const actionText = isActive ? 'закрыта' : 'открыта';
    
    if (!confirm(`Вы уверены, что хотите ${action} эту услугу?`)) {
        return;
    }
    
    try {
        const endpoint = isActive ? 'close' : 'open';
        await apiRequest(`/services/${serviceId}/${endpoint}`, {
            method: 'PUT'
        });
        
        showNotification(`Услуга успешно ${actionText}!`, 'success');
        
        // Перезагружаем страницу для обновления статуса
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Toggle service status error:', error);
        showNotification(`Ошибка ${action} услуги`, 'error');
    }
}

/**
 * Показать модальное окно подтверждения удаления
 */
function showDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('hidden');
}

/**
 * Скрыть модальное окно подтверждения удаления
 */
function hideDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('hidden');
}

/**
 * Удаление услуги
 */
async function deleteService() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    try {
        await apiRequest(`/services/${serviceId}`, {
            method: 'DELETE'
        });
        
        showNotification('Услуга успешно удалена!', 'success');
        
        // Скрываем модальное окно
        hideDeleteModal();
        
        // Переходим на страницу dashboard
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Delete service error:', error);
        showNotification(error.message || 'Ошибка удаления услуги', 'error');
        hideDeleteModal();
    }
}

/**
 * Обновление услуги
 */
async function updateService(e) {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    
    // Добавляем файл, если он выбран
    const imageInput = document.getElementById('serviceImage');
    if (imageInput && imageInput.files.length > 0) {
        const file = imageInput.files[0];
        
        // Валидация файла
        if (!validateImageFile(file)) {
            return;
        }
        
        formData.append('image', file);
    }
    
    try {
        await apiRequest(`/services/${serviceId}`, {
            method: 'PUT',
            body: formData,
            isFormData: true
        });
        
        showNotification('Услуга успешно обновлена!', 'success');
        
        setTimeout(() => {
            window.location.href = `/pages/service.html?id=${serviceId}`;
        }, 1500);
    } catch (error) {
        console.error('Update service error:', error);
        showNotification(error.message || 'Ошибка обновления услуги', 'error');
    }
}

/**
 * Загрузка данных услуги для редактирования
 */
async function loadServiceForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showNotification('Услуга не найдена', 'error');
        return;
    }
    
    try {
        const service = await apiRequest(`/services/${serviceId}`);
        
        // Заполняем форму данными услуги
        document.getElementById('title').value = service.title;
        document.getElementById('category').value = service.category;
        document.getElementById('price').value = service.price;
        document.getElementById('description').value = service.description;
        
        // Отображаем текущее изображение, если оно есть
        if (service.image_url) {
            const currentImageContainer = document.getElementById('currentImageContainer');
            const currentImage = document.getElementById('currentImage');
            currentImage.src = service.image_url;
            currentImageContainer.classList.remove('hidden');
        }
        
        // Меняем заголовок страницы и текст кнопки
        document.querySelector('h1').textContent = 'Редактирование услуги';
        document.getElementById('submitBtn').textContent = 'Сохранить изменения';
        
    } catch (error) {
        console.error('Load service for edit error:', error);
        showNotification('Не удалось загрузить данные услуги', 'error');
    }
}

/**
 * Валидация файла изображения
 */
function validateImageFile(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2 МБ
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Недопустимый формат файла. Разрешены только: .png, .jpg, .jpeg, .webp', 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showNotification('Размер файла превышает 2 МБ', 'error');
        return false;
    }
    
    return true;
}

/**
 * Обработчик выбора файла изображения
 */
function handleImageSelect(e) {
    const file = e.target.files[0];
    
    if (!file) {
        hideImagePreview();
        return;
    }
    
    // Валидация файла
    if (!validateImageFile(file)) {
        e.target.value = '';
        hideImagePreview();
        return;
    }
    
    // Показываем предпросмотр
    showImagePreview(file);
}

/**
 * Показать предпросмотр изображения
 */
function showImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreview');
        const currentImageContainer = document.getElementById('currentImageContainer');
        
        previewImg.src = e.target.result;
        previewContainer.classList.remove('hidden');
        
        // Скрываем текущее изображение при показе предпросмотра нового
        if (currentImageContainer) {
            currentImageContainer.classList.add('hidden');
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * Скрыть предпросмотр изображения
 */
function hideImagePreview() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreview');
    const currentImageContainer = document.getElementById('currentImageContainer');
    
    if (previewContainer) {
        previewContainer.classList.add('hidden');
        previewImg.src = '';
    }
    
    // Показываем обратно текущее изображение, если оно было
    if (currentImageContainer && currentImageContainer.querySelector('img').src) {
        currentImageContainer.classList.remove('hidden');
    }
}

/**
 * Удалить выбранное изображение
 */
function removeSelectedImage() {
    const imageInput = document.getElementById('serviceImage');
    if (imageInput) {
        imageInput.value = '';
    }
    hideImagePreview();
}

/**
 * Инициализация обработчиков изображений
 */
function initImageHandlers() {
    const imageInput = document.getElementById('serviceImage');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', removeSelectedImage);
    }
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    // Главная страница - загрузка услуг
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadServices();
    }
    
    // Страница поиска услуг
    if (window.location.pathname.includes('search-service.html')) {
        loadServices();
        
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', searchServices);
        }
    }
    
    // Страница конкретной услуги
    if (window.location.pathname.includes('/service.html')) {
        loadServiceDetails();
        
        // Обработчик кнопки "Связаться"
        document.getElementById('contactBtn')?.addEventListener('click', async () => {
            await createChatWithService();
        });
        
        // Обработчик кнопки "Заказать услугу"
        document.getElementById('orderBtn')?.addEventListener('click', async () => {
            await createChatWithService();
        });
        
        // Обработчики для владельца услуги
        document.getElementById('editBtn')?.addEventListener('click', editService);
        document.getElementById('closeBtn')?.addEventListener('click', toggleServiceStatus);
        document.getElementById('deleteBtn')?.addEventListener('click', showDeleteModal);
        
        // Обработчики для модального окна удаления
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', hideDeleteModal);
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', deleteService);
    }
    
    // Страница создания/редактирования услуги
    if (window.location.pathname.includes('edit-service.html')) {
        // Инициализируем обработчики изображений
        initImageHandlers();
        
        const form = document.getElementById('serviceForm');
        if (form) {
            // Проверяем, есть ли ID в URL (режим редактирования)
            const urlParams = new URLSearchParams(window.location.search);
            const serviceId = urlParams.get('id');
            
            if (serviceId) {
                // Режим редактирования
                loadServiceForEdit();
                form.addEventListener('submit', updateService);
            } else {
                // Режим создания
                form.addEventListener('submit', createService);
            }
        }
    }
});

