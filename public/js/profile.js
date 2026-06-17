/**
 * profile.js - Скрипт для страницы профиля пользователя
 */

let currentUser = null; // Авторизованный пользователь
let profileUser = null; // Пользователь, чей профиль просматривается
let currentPortfolioId = null;
let isOwner = false; // Является ли авторизованный пользователь владельцем профиля

/**
 * Получение userId из URL
 */
function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    return userId ? parseInt(userId) : null;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем авторизацию
    const isLoggedIn = await checkAuth();
    if (!isLoggedIn) {
        window.location.href = '/pages/index.html';
        return;
    }
    
    // Загружаем данные профиля
    await loadProfile();
    
    // Обработчик кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Обработчик кнопки редактирования
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            alert('Функция редактирования профиля будет доступна позже');
        });
    }
});

// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch('/api/users/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                // Обновляем имя в шапке
                const userNameSpan = document.getElementById('userName');
                if (userNameSpan) {
                    userNameSpan.textContent = `Привет, ${data.user.name}`;
                }
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Загрузка профиля
async function loadProfile() {
    try {
        const response = await fetch('/api/users/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            // Заполняем данные профиля
            document.getElementById('profileName').textContent = user.name || '-';
            document.getElementById('profileEmail').textContent = user.email || '-';
            
            // Определяем тип аккаунта
            let userTypeText = '';
            switch (user.user_type) {
                case 'admin':
                    userTypeText = '👑 Администратор';
                    break;
                case 'customer':
                    userTypeText = '👤 Заказчик';
                    break;
                case 'performer':
                    userTypeText = '💼 Исполнитель';
                    break;
                default:
                    userTypeText = user.user_type || 'Пользователь';
            }
            document.getElementById('profileType').textContent = userTypeText;
            
            // Проверяем, является ли пользователь админом
            if (user.user_type === 'admin') {
                console.log('Admin detected! Showing admin panel');
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) {
                    adminPanel.classList.remove('hidden');
                }
            }
        } else {
            console.error('Failed to load profile');
            window.location.href = '/pages/index.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/pages/index.html';
    }
}

// Выход из аккаунта
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/pages/index.html';
        } else {
            console.error('Logout failed');
            window.location.href = '/pages/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/pages/index.html';
    }
}
/**
 * Загрузка данных профиля
 */
async function loadProfile() {
    try {
        // Получаем текущего авторизованного пользователя (может быть null)
        currentUser = await getCurrentUser();

        // Получаем ID пользователя, чей профиль нужно показать
        const profileUserId = getUserIdFromURL();
        
        // Определяем целевого пользователя
        let targetUserId;
        
        if (profileUserId) {
            // Если ID указан в URL, показываем этот профиль
            targetUserId = profileUserId;
        } else if (currentUser) {
            // Если ID не указан, но пользователь авторизован - показываем его профиль
            targetUserId = currentUser.id;
        } else {
            // Если ID не указан и пользователь не авторизован - редирект
            showNotification('Для просмотра своего профиля необходимо авторизоваться', 'error');
            window.location.href = '/pages/index.html';
            return;
        }

        // Определяем, является ли текущий пользователь владельцем профиля
        isOwner = currentUser ? (targetUserId === currentUser.id) : false;

        // Загружаем данные пользователя, чей профиль просматривается
        profileUser = await apiRequest(`/users/${targetUserId}`);

        if (!profileUser) {
            showNotification('Пользователь не найден', 'error');
            window.location.href = '/pages/index.html';
            return;
        }

        // Обновляем информацию о пользователе
        document.getElementById('userName').textContent = profileUser.name;
        document.getElementById('userFullName').textContent = profileUser.name;
        document.getElementById('userEmail').textContent = profileUser.email;
        document.getElementById('userType').textContent = 
            profileUser.userType === 'customer' ? 'Заказчик' : 'Исполнитель';
        document.getElementById('regDate').textContent = formatDate(profileUser.created_at);
        
        // Обновляем навыки с интерактивным отображением
        updateSkillsDisplay(profileUser.skills);

        console.log('Profile User:', profileUser);
        console.log('Current User:', currentUser);
        console.log('Is Owner:', isOwner);
        
        // Обновляем год регистрации
        const year = new Date(profileUser.created_at).getFullYear();
        document.getElementById('memberSince').textContent = year;

        // Показываем/скрываем кнопки редактирования
        updateUIForOwnership();

        // Загружаем рейтинг пользователя
        await loadUserRating();

        // Загружаем портфолио
        await loadPortfolio();

        // Загружаем отзывы
        await loadReviews();
    } catch (error) {
        console.error('Load profile error:', error);
        showNotification('Ошибка загрузки профиля', 'error');
    }
}

/**
 * Обновление отображения навыков с интерактивными тегами
 */
function updateSkillsDisplay(skillsString) {
    const skillsContainer = document.getElementById('userSkills');
    
    if (!skillsContainer) return;
    
    // Очищаем контейнер
    skillsContainer.innerHTML = '';
    
    if (!skillsString || !skillsString.trim()) {
        skillsContainer.innerHTML = '<p class="text-gray-600">Навыки не указаны</p>';
        return;
    }
    
    // Разбиваем строку навыков на массив (по запятой или пробелам)
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    if (skillsArray.length === 0) {
        skillsContainer.innerHTML = '<p class="text-gray-600">Навыки не указаны</p>';
        return;
    }
    
    // Создаем контейнер для навыков
    const skillsWrapper = document.createElement('div');
    skillsWrapper.className = 'skills-container';
    
    // Создаем теги для каждого навыка
    skillsArray.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        
        // Добавляем анимацию при наведении
        skillTag.addEventListener('mouseenter', () => {
            skillTag.style.transform = 'translateY(-2px)';
            skillTag.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        });
        
        skillTag.addEventListener('mouseleave', () => {
            skillTag.style.transform = 'translateY(0)';
            skillTag.style.boxShadow = 'none';
        });
        
        skillsWrapper.appendChild(skillTag);
    });
    
    skillsContainer.appendChild(skillsWrapper);
}

/**
 * Обновление UI в зависимости от прав владельца
 */
function updateUIForOwnership() {
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    const editSkillsBtn = document.getElementById('editSkillsBtn');
    
    if (isOwner) {
        // Владелец профиля - показываем кнопки редактирования
        addPortfolioBtn.classList.remove('hidden');
        addPortfolioBtn.style.display = 'inline-block';
        editSkillsBtn.classList.remove('hidden');
        editSkillsBtn.style.display = 'inline-block';
    } else {
        // Не владелец - скрываем кнопки редактирования
        addPortfolioBtn.classList.add('hidden');
        addPortfolioBtn.style.display = 'none';
        editSkillsBtn.classList.add('hidden');
        editSkillsBtn.style.display = 'none';
    }
}

/**
 * Загрузка рейтинга пользователя
 */
async function loadUserRating() {
    try {
        const data = await apiRequest(`/reviews/user/${profileUser.id}`);
        
        const ratingElement = document.getElementById('userRating');
        const totalReviewsElement = document.getElementById('totalReviews');
        
        if (data.rating && data.rating.averageRating > 0) {
            ratingElement.textContent = data.rating.averageRating;
            totalReviewsElement.textContent = `(${data.rating.totalReviews} отзывов)`;
        } else {
            ratingElement.textContent = '—';
            totalReviewsElement.textContent = '(нет отзывов)';
        }
    } catch (error) {
        console.error('Load rating error:', error);
    }
}

/**
 * Загрузка отзывов пользователя
 */
async function loadReviews() {
    try {
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (!reviewsContainer) return;

        const data = await apiRequest(`/reviews/user/${profileUser.id}`);
        
        if (!data.reviews || data.reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Пока нет отзывов</p>';
            return;
        }

        reviewsContainer.innerHTML = data.reviews.map(review => createReviewCard(review)).join('');
    } catch (error) {
        console.error('Load reviews error:', error);
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = '<p class="text-red-500 text-center py-8">Ошибка загрузки отзывов</p>';
        }
    }
}

/**
 * Создание карточки отзыва
 */
function createReviewCard(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    // Создаем кликабельную ссылку на автора отзыва
    const reviewerNameHtml = review.reviewer_name && review.reviewer_id
        ? `<a href="/pages/profile.html?id=${review.reviewer_id}" class="font-bold text-primary hover:underline cursor-pointer">${review.reviewer_name}</a>`
        : `<h4 class="font-bold text-primary">${review.reviewer_name || 'Пользователь'}</h4>`;
    
    // Создаем кликабельную ссылку на заказ
    const orderTitleHtml = review.order_title && review.order_id
        ? `<a href="/pages/order.html?id=${review.order_id}" class="text-primary hover:underline cursor-pointer">${review.order_title}</a>`
        : (review.order_title || 'Заказ');
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    ${reviewerNameHtml}
                    <div class="text-yellow-500 text-lg">${stars}</div>
                </div>
                <span class="text-xs text-gray-500">${formatDate(review.created_at)}</span>
            </div>
            ${review.comment ? `<p class="text-gray-700 mt-2">${review.comment}</p>` : ''}
            <p class="text-sm text-gray-500 mt-2">Заказ: ${orderTitleHtml}</p>
        </div>
    `;
}

/**
 * Загрузка портфолио пользователя
 */
async function loadPortfolio() {
    try {
        const portfolioContainer = document.getElementById('portfolioContainer');
        portfolioContainer.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">Загрузка...</p>';

        const portfolio = await apiRequest(`/portfolio/user/${profileUser.id}`);
        
        // Обновляем счетчик работ
        document.getElementById('portfolioCount').textContent = portfolio.length;

        if (!portfolio || portfolio.length === 0) {
            if (isOwner) {
                // Владелец видит кнопку добавления
                portfolioContainer.innerHTML = `
                    <div class="col-span-3 text-center py-12">
                        <p class="text-gray-500 mb-4">Портфолио пока пусто</p>
                        <button onclick="openAddModal()" class="btn-primary">Добавить первую работу</button>
                    </div>
                `;
            } else {
                // Гость видит просто сообщение
                portfolioContainer.innerHTML = `
                    <div class="col-span-3 text-center py-12">
                        <p class="text-gray-500">Портфолио пока пусто</p>
                    </div>
                `;
            }
            return;
        }

        // Отображаем портфолио
        portfolioContainer.innerHTML = portfolio.map(item => createPortfolioCard(item)).join('');
    } catch (error) {
        console.error('Load portfolio error:', error);
        const portfolioContainer = document.getElementById('portfolioContainer');
        portfolioContainer.innerHTML = '<p class="text-red-500 text-center py-8 col-span-3">Ошибка загрузки портфолио</p>';
    }
}

/**
 * Создание карточки работы портфолио
 */
function createPortfolioCard(item) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer" onclick="viewPortfolio(${item.id})">
            <div class="h-48 overflow-hidden">
                <img src="${item.image_url}" alt="${item.title}" 
                    class="w-full h-full object-cover hover:scale-110 transition duration-300"
                    onerror="this.src='https://via.placeholder.com/400x300?text=Изображение+не+найдено'">
            </div>
            <div class="p-4">
                <h4 class="font-bold text-primary text-lg mb-2 line-clamp-1">${item.title}</h4>
                <p class="text-gray-600 text-sm line-clamp-2 mb-3">${item.description || 'Без описания'}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">${formatDate(item.created_at)}</span>
                    ${item.isOwner ? `
                        <div class="flex space-x-2" onclick="event.stopPropagation()">
                            <button onclick="editPortfolio(${item.id})" 
                                class="text-primary hover:text-primary/80 text-sm font-medium">
                                Редактировать
                            </button>
                            <button onclick="deletePortfolio(${item.id})" 
                                class="text-red-500 hover:text-red-700 text-sm font-medium">
                                Удалить
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Просмотр работы портфолио
 */
async function viewPortfolio(id) {
    try {
        const item = await apiRequest(`/portfolio/${id}`);
        
        document.getElementById('viewTitle').textContent = item.title;
        document.getElementById('viewImage').src = item.image_url;
        document.getElementById('viewDescription').textContent = item.description || 'Без описания';
        
        // Показываем/скрываем кнопки действий в зависимости от владельца
        const viewActions = document.getElementById('viewActions');
        if (item.isOwner) {
            viewActions.classList.remove('hidden');
            document.getElementById('editFromViewBtn').onclick = () => {
                closeViewModal();
                editPortfolio(id);
            };
            document.getElementById('deleteFromViewBtn').onclick = () => {
                closeViewModal();
                deletePortfolio(id);
            };
        } else {
            viewActions.classList.add('hidden');
        }
        
        document.getElementById('viewModal').classList.remove('hidden');
    } catch (error) {
        console.error('View portfolio error:', error);
        showNotification('Ошибка загрузки работы', 'error');
    }
}

/**
 * Закрыть модальное окно просмотра
 */
function closeViewModal() {
    document.getElementById('viewModal').classList.add('hidden');
}

/**
 * Открыть модальное окно для добавления работы
 */
function openAddModal() {
    // Проверяем права доступа
    if (!isOwner) {
        showNotification('У вас нет прав для добавления работ в это портфолио', 'error');
        return;
    }
    
    currentPortfolioId = null;
    document.getElementById('modalTitle').textContent = 'Добавить работу';
    document.getElementById('portfolioId').value = '';
    document.getElementById('portfolioForm').reset();
    document.getElementById('imagePreview').classList.add('hidden');
    
    // Изменяем подсказку для обязательного поля
    const imageLabel = document.querySelector('label[for="portfolioImage"]');
    if (imageLabel) {
        imageLabel.innerHTML = 'Изображение *';
    }
    
    // Делаем поле обязательным
    document.getElementById('portfolioImage').required = true;
    
    document.getElementById('portfolioModal').classList.remove('hidden');
}

/**
 * Редактирование работы портфолио
 */
async function editPortfolio(id) {
    // Проверяем права доступа
    if (!isOwner) {
        showNotification('У вас нет прав для редактирования этой работы', 'error');
        return;
    }
    
    try {
        const item = await apiRequest(`/portfolio/${id}`);
        
        // Дополнительная проверка на стороне клиента
        if (!item.isOwner) {
            showNotification('У вас нет прав для редактирования этой работы', 'error');
            return;
        }
        
        currentPortfolioId = id;
        document.getElementById('modalTitle').textContent = 'Редактировать работу';
        document.getElementById('portfolioId').value = id;
        document.getElementById('portfolioTitle').value = item.title;
        document.getElementById('portfolioDescription').value = item.description || '';
        
        // Очищаем input[type="file"] (его нельзя установить программно)
        const imageInput = document.getElementById('portfolioImage');
        imageInput.value = '';
        imageInput.required = false; // При редактировании изображение необязательно
        
        // Изменяем подсказку
        const imageLabel = document.querySelector('label[for="portfolioImage"]');
        if (imageLabel) {
            imageLabel.innerHTML = 'Изображение (оставьте пустым, чтобы не менять)';
        }
        
        // Показываем превью текущего изображения
        const previewImg = document.getElementById('previewImg');
        previewImg.src = item.image_url;
        document.getElementById('imagePreview').classList.remove('hidden');
        
        document.getElementById('portfolioModal').classList.remove('hidden');
    } catch (error) {
        console.error('Edit portfolio error:', error);
        showNotification('Ошибка загрузки работы', 'error');
    }
}

/**
 * Удаление работы из портфолио
 */
async function deletePortfolio(id) {
    // Проверяем права доступа
    if (!isOwner) {
        showNotification('У вас нет прав для удаления этой работы', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить эту работу из портфолио?')) {
        return;
    }

    try {
        await apiRequest(`/portfolio/${id}`, {
            method: 'DELETE'
        });

        showNotification('Работа успешно удалена', 'success');
        await loadPortfolio();
    } catch (error) {
        console.error('Delete portfolio error:', error);
        showNotification('Ошибка удаления работы', 'error');
    }
}

/**
 * Обработка формы добавления/редактирования работы
 */
async function handlePortfolioSubmit(e) {
    e.preventDefault();

    // Проверяем права доступа
    if (!isOwner) {
        showNotification('У вас нет прав для изменения этого портфолио', 'error');
        return;
    }

    const title = document.getElementById('portfolioTitle').value.trim();
    const description = document.getElementById('portfolioDescription').value.trim();
    const imageInput = document.getElementById('portfolioImage');
    const imageFile = imageInput.files[0];

    // Валидация
    if (!title) {
        showNotification('Название обязательно', 'error');
        return;
    }

    // При создании новой работы изображение обязательно
    if (!currentPortfolioId && !imageFile) {
        showNotification('Изображение обязательно', 'error');
        return;
    }

    // Если файл выбран, проверяем его
    if (imageFile) {
        // Проверка формата
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
            showNotification('Недопустимый формат файла. Разрешены только: PNG, JPG, JPEG, WEBP', 'error');
            return;
        }

        // Проверка размера (2 МБ)
        const maxSize = 2 * 1024 * 1024; // 2 МБ в байтах
        if (imageFile.size > maxSize) {
            showNotification('Размер файла превышает 2 МБ', 'error');
            return;
        }
    }

    try {
        // Создаем FormData для отправки файла
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (currentPortfolioId) {
            // Редактирование
            await apiRequestFile(`/portfolio/${currentPortfolioId}`, {
                method: 'PUT',
                body: formData
            });
            showNotification('Работа успешно обновлена', 'success');
        } else {
            // Создание
            await apiRequestFile('/portfolio', {
                method: 'POST',
                body: formData
            });
            showNotification('Работа успешно добавлена', 'success');
        }

        closePortfolioModal();
        await loadPortfolio();
    } catch (error) {
        console.error('Save portfolio error:', error);
        showNotification(error.message || 'Ошибка сохранения работы', 'error');
    }
}

/**
 * Закрыть модальное окно портфолио
 */
function closePortfolioModal() {
    document.getElementById('portfolioModal').classList.add('hidden');
    document.getElementById('portfolioForm').reset();
    currentPortfolioId = null;
}

/**
 * Предпросмотр изображения
 */
function setupImagePreview() {
    const imageInput = document.getElementById('portfolioImage');
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            // Проверка формата
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showNotification('Недопустимый формат файла. Разрешены только: PNG, JPG, JPEG, WEBP', 'error');
                this.value = '';
                previewContainer.classList.add('hidden');
                return;
            }

            // Проверка размера
            const maxSize = 2 * 1024 * 1024; // 2 МБ
            if (file.size > maxSize) {
                showNotification('Размер файла превышает 2 МБ', 'error');
                this.value = '';
                previewContainer.classList.add('hidden');
                return;
            }

            // Создаем URL для предпросмотра
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.classList.add('hidden');
        }
    });
}

/**
 * Открыть модальное окно для редактирования навыков
 */
function openSkillsModal() {
    if (!isOwner) {
        showNotification('У вас нет прав для редактирования навыков', 'error');
        return;
    }
    
    const skillsInput = document.getElementById('skillsInput');
    skillsInput.value = profileUser.skills || '';
    document.getElementById('skillsModal').classList.remove('hidden');
}

/**
 * Закрыть модальное окно редактирования навыков
 */
function closeSkillsModal() {
    document.getElementById('skillsModal').classList.add('hidden');
    document.getElementById('skillsForm').reset();
}

/**
 * Обработка формы редактирования навыков
 */
async function handleSkillsSubmit(e) {
    e.preventDefault();

    if (!isOwner) {
        showNotification('У вас нет прав для редактирования навыков', 'error');
        return;
    }

    const skills = document.getElementById('skillsInput').value.trim();

    try {
        await apiRequest(`/users/${profileUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skills })
        });

        showNotification('Навыки успешно обновлены', 'success');
        
        // Обновляем объект profileUser
        profileUser.skills = skills;
        
        // Обновляем отображение навыков с интерактивными тегами
        updateSkillsDisplay(skills);

        closeSkillsModal();
    } catch (error) {
        console.error('Save skills error:', error);
        showNotification(error.message || 'Ошибка сохранения навыков', 'error');
    }
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();

        // Обработчики событий
        document.getElementById('addPortfolioBtn').addEventListener('click', openAddModal);
        document.getElementById('portfolioForm').addEventListener('submit', handlePortfolioSubmit);
        document.getElementById('cancelBtn').addEventListener('click', closePortfolioModal);
        document.getElementById('closeViewBtn').addEventListener('click', closeViewModal);
        
        // Обработчики для навыков
        document.getElementById('editSkillsBtn').addEventListener('click', openSkillsModal);
        document.getElementById('skillsForm').addEventListener('submit', handleSkillsSubmit);
        document.getElementById('cancelSkillsBtn').addEventListener('click', closeSkillsModal);

        // Закрытие модальных окон по клику на фон
        document.getElementById('portfolioModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePortfolioModal();
            }
        });

        document.getElementById('viewModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeViewModal();
            }
        });

        document.getElementById('skillsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeSkillsModal();
            }
        });

        // Настройка предпросмотра изображения
        setupImagePreview();
    }
});