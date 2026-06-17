/**
 * chat.js - Скрипт для работы с чатом
 */

let messageUpdateInterval = null;
let selectedFiles = [];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_COUNT = 5;

/**
 * Загрузка списка чатов
 */
async function loadChatList() {
    const container = document.getElementById('chatList');
    const chats = await apiRequest('/chats');

    if (!container) return;
    
    if (chats.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">💬</div>
                <p>Нет активных чатов</p>
            </div>
        `;
        return;
    }

    container.innerHTML = chats.map(chat => `
        <div class="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition" 
             onclick="openChat(${chat.id}, '${escapeHtml(chat.userName)}')"
             data-chat-id="${chat.id}">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    ${escapeHtml(chat.userName.charAt(0))}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-sm">${escapeHtml(chat.userName)}</div>
                    <div class="text-xs text-gray-500 truncate">
                        ${escapeHtml(chat.lastMessage)}
                        ${chat.hasAttachments ? ' 📎' : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Загрузка информации о конкретном чате по ID
 */
async function loadChatById(chatId) {
    try {
        // Получаем список всех чатов
        const chats = await apiRequest('/chats');
        
        // Ищем чат с нужным ID
        const targetChat = chats.find(chat => chat.id == chatId);
        
        if (targetChat) {
            // Открываем найденный чат
            openChat(targetChat.id, targetChat.userName);
            return true;
        } else {
            showNotification('Чат не найден или у вас нет доступа к нему', 'error');
            return false;
        }
    } catch (error) {
        console.error('Load chat by ID error:', error);
        showNotification('Ошибка загрузки чата', 'error');
        return false;
    }
}

/**
 * Открытие чата
 */
function openChat(chatId, userName) {
    currentChatId = chatId;
    
    // Остановка предыдущего интервала обновления, если есть
    if (messageUpdateInterval) {
        clearInterval(messageUpdateInterval);
    }
    
    // Обновление заголовка
    document.getElementById('chatHeader').innerHTML = `
        <h3 class="text-xl font-bold text-primary">${escapeHtml(userName)}</h3>
    `;
    
    // Загрузка сообщений
    loadMessages(chatId);
    
    // Автообновление сообщений каждые 5 секунд
    messageUpdateInterval = setInterval(() => {
        loadMessages(chatId, true);
    }, 5000);
    
    // Показ формы ввода
    document.getElementById('chatInputArea').classList.remove('hidden');
    
    // Выделение активного чата в списке
    highlightActiveChat(chatId);
    
    // Очистка выбранных файлов
    selectedFiles = [];
    updateFileList();
}

/**
 * Выделение активного чата в списке
 */
function highlightActiveChat(chatId) {
    // Убираем выделение со всех чатов
    const chatItems = document.querySelectorAll('#chatList > div');
    chatItems.forEach(item => {
        item.classList.remove('bg-primary', 'text-white');
        item.classList.add('hover:bg-gray-100');
    });
    
    // Выделяем активный чат
    const activeChat = document.querySelector(`#chatList > div[data-chat-id="${chatId}"]`);
    if (activeChat) {
        activeChat.classList.add('bg-primary', 'text-white');
        activeChat.classList.remove('hover:bg-gray-100');
    }
}

/**
 * Загрузка сообщений чата
 * @param {number} chatId - ID чата
 * @param {boolean} silent - Тихая загрузка (без прокрутки, если пользователь читает старые сообщения)
 */
async function loadMessages(chatId, silent = false) {
    const container = document.getElementById('chatMessages');
    
    if (!container) return;
    
    // Сохраняем текущую позицию скролла
    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    const currentScrollTop = container.scrollTop;
    
    try {
        const messages = await apiRequest(`/chats/${chatId}`);
        
        container.innerHTML = messages.map(msg => `
            <div class="flex ${msg.isOwn ? 'justify-end' : 'justify-start'} mb-3">
                <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.isOwn ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
                }">
                    ${!msg.isOwn && msg.senderName ? `
                        <a href="/pages/profile.html?id=${msg.senderId}" 
                           class="font-bold text-primary hover:underline cursor-pointer text-sm block mb-1"
                           onclick="event.stopPropagation()">
                            ${escapeHtml(msg.senderName)}
                        </a>
                    ` : ''}
                    <p>${escapeHtml(msg.text)}</p>
                    
                    <!-- Отображение файлов -->
                    ${msg.hasAttachments && msg.files && msg.files.length > 0 ? `
                        <div class="mt-2 border-t ${msg.isOwn ? 'border-white/20' : 'border-gray-300'} pt-2">
                            ${msg.files.map(file => renderFileAttachment(file, msg.isOwn)).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="text-xs mt-1 ${msg.isOwn ? 'text-gray-200' : 'text-gray-500'}">
                        ${formatTime(msg.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Восстанавливаем позицию скролла
        if (silent) {
            container.scrollTop = currentScrollTop;
        } else if (wasAtBottom) {
            // Прокрутка вниз только если пользователь был внизу
            container.scrollTop = container.scrollHeight;
        }
    } catch (error) {
        if (error.message.includes('403') || error.message.includes('Доступ запрещен')) {
            showNotification('Доступ к чату запрещен', 'error');
            // Останавливаем автообновление
            if (messageUpdateInterval) {
                clearInterval(messageUpdateInterval);
            }
            // Скрываем чат
            currentChatId = null;
            document.getElementById('chatInputArea').classList.add('hidden');
        } else {
            console.error('Load messages error:', error);
        }
    }
}

/**
 * Отображение вложения файла
 */
function renderFileAttachment(file, isOwn) {
    const isImage = file.fileType.startsWith('image/');
    const fileSize = formatFileSize(file.fileSize);
    const icon = getFileIcon(file.fileType);
    
    return `
        <div class="file-attachment ${isOwn ? 'text-white' : 'text-gray-700'} mb-1 last:mb-0">
            <div class="flex items-start">
                ${isImage ? `
                    <div class="mr-2">
                        <img src="/api/chats/files/${file.id}/preview" 
                             alt="${escapeHtml(file.originalName)}"
                             class="w-16 h-16 object-cover rounded cursor-pointer"
                             onclick="showImagePreview('/api/chats/files/${file.id}/preview', '${escapeHtml(file.originalName)}')">
                    </div>
                ` : `
                    <div class="mr-2 text-lg">${icon}</div>
                `}
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${escapeHtml(file.originalName)}</div>
                    <div class="text-xs ${isOwn ? 'text-gray-200' : 'text-gray-500'}">${fileSize}</div>
                    <a href="/api/chats/files/${file.id}/download" 
                       class="text-xs ${isOwn ? 'text-gray-200 hover:text-white' : 'text-primary hover:text-purple-700'} underline"
                       download="${escapeHtml(file.originalName)}">
                        Скачать
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Иконка для типа файла
 */
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('text')) return '📃';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📎';
}

/**
 * Форматирование размера файла
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Просмотр изображения в полном размере
 */
function showImagePreview(src, alt) {
    // Создаем модальное окно для просмотра изображения
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="relative max-w-full max-h-full">
            <img src="${src}" alt="${escapeHtml(alt)}" class="max-w-full max-h-[90vh] object-contain">
            <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <div class="absolute bottom-4 left-0 right-0 text-center text-white text-sm">${escapeHtml(alt)}</div>
        </div>
    `;
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

/**
 * Отправка сообщения
 */
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text && selectedFiles.length === 0) {
        showNotification('Введите сообщение или прикрепите файл', 'warning');
        return;
    }
    
    if (!currentChatId) {
        showNotification('Выберите чат для отправки сообщения', 'warning');
        return;
    }
    
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    if (text) {
        formData.append('message', text);
    }
    
    // Добавляем файлы
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    try {
        // Отправка сообщения на сервер с файлами
        const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка отправки сообщения');
        }
        
        // Очистка поля ввода и списка файлов
        input.value = '';
        selectedFiles = [];
        updateFileList();
        
        // Перезагрузка сообщений для отображения нового сообщения
        await loadMessages(currentChatId);
        
        showNotification('Сообщение отправлено', 'success');
    } catch (error) {
        console.error('Send message error:', error);
        if (error.message.includes('403') || error.message.includes('Доступ запрещен')) {
            showNotification('Доступ к чату запрещен', 'error');
        } else if (error.message.includes('Недопустимый тип файла')) {
            showNotification(error.message, 'error');
        } else if (error.message.includes('Файл слишком большой')) {
            showNotification(error.message, 'error');
        } else {
            showNotification(error.message || 'Ошибка отправки сообщения', 'error');
        }
    }
}

/**
 * Обработка выбора файлов
 */
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    // Проверка количества файлов
    if (selectedFiles.length + files.length > MAX_FILES_COUNT) {
        showNotification(`Можно прикрепить максимум ${MAX_FILES_COUNT} файлов`, 'warning');
        event.target.value = '';
        return;
    }
    
    // Проверка размера файлов
    const tooLargeFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (tooLargeFiles.length > 0) {
        showNotification(`Файл "${tooLargeFiles[0].name}" слишком большой. Максимальный размер: 10MB`, 'warning');
        event.target.value = '';
        return;
    }
    
    // Проверка типов файлов
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
        showNotification(`Файл "${invalidFiles[0].name}" имеет недопустимый тип`, 'warning');
        event.target.value = '';
        return;
    }
    
    // Добавляем файлы в список
    selectedFiles.push(...files);
    updateFileList();
    
    // Очищаем input для возможности выбора тех же файлов снова
    event.target.value = '';
}

/**
 * Обновление списка файлов в интерфейсе
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    const attachFileBtn = document.getElementById('attachFileBtn');
    
    if (!fileList) return;
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        if (attachFileBtn) {
            attachFileBtn.textContent = '📎 Прикрепить файл';
        }
        return;
    }
    
    fileList.innerHTML = `
        <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Прикрепленные файлы (${selectedFiles.length}/${MAX_FILES_COUNT}):</span>
                <button onclick="clearAllFiles()" class="text-xs text-red-600 hover:text-red-800">Очистить все</button>
            </div>
            <div class="space-y-1">
                ${selectedFiles.map((file, index) => `
                    <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                        <div class="flex items-center truncate">
                            <span class="mr-2">${getFileIcon(file.type)}</span>
                            <span class="truncate">${escapeHtml(file.name)}</span>
                            <span class="text-gray-500 text-xs ml-2">(${formatFileSize(file.size)})</span>
                        </div>
                        <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700 ml-2">
                            ×
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    if (attachFileBtn) {
        attachFileBtn.textContent = `📎 Добавить еще (${MAX_FILES_COUNT - selectedFiles.length} доступно)`;
    }
}

/**
 * Удаление файла из списка
 */
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

/**
 * Очистка всех файлов
 */
function clearAllFiles() {
    selectedFiles = [];
    updateFileList();
}

/**
 * Форматирование времени
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Экранирование HTML для предотвращения XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('chat.html')) {
        // Загружаем список чатов
        await loadChatList();
        
        // Проверяем, есть ли параметр id в URL
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('id');
        
        if (chatId) {
            // Если есть ID чата в URL, открываем его
            await loadChatById(parseInt(chatId));
        }
        
        // Создаем input для выбора файлов
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.multiple = true;
        fileInput.accept = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', handleFileSelect);
        document.body.appendChild(fileInput);
        
        // Кнопка прикрепления файла
        const attachFileBtn = document.createElement('button');
        attachFileBtn.id = 'attachFileBtn';
        attachFileBtn.type = 'button';
        attachFileBtn.className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition mr-2';
        attachFileBtn.textContent = '📎 Прикрепить файл';
        attachFileBtn.onclick = () => fileInput.click();
        
        // Вставляем кнопку прикрепления файла перед полем ввода
        const inputArea = document.getElementById('chatInputArea');
        if (inputArea) {
            const formContainer = inputArea.querySelector('.flex');
            if (formContainer) {
                formContainer.insertBefore(attachFileBtn, formContainer.firstChild);
            }
        }
        
        // Создаем контейнер для списка файлов
        const fileListContainer = document.createElement('div');
        fileListContainer.id = 'fileList';
        fileListContainer.className = 'mb-2';
        
        // Вставляем контейнер для файлов перед формой ввода
        if (inputArea) {
            const formContainer = inputArea.querySelector('.flex');
            if (formContainer) {
                inputArea.insertBefore(fileListContainer, formContainer);
            }
        }
        
        // Обработчик отправки сообщения
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        // Отправка по Ctrl+Enter
        const input = document.getElementById('messageInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        // Очистка интервала при выходе со страницы
        window.addEventListener('beforeunload', () => {
            if (messageUpdateInterval) {
                clearInterval(messageUpdateInterval);
            }
        });
    }
});