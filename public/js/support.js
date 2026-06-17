document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации через cookies (автоматически)
    // Проверяем, авторизован ли пользователь
    checkAuth();
    
    // Обработка вкладок
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Обновляем активные вкладки
            tabs.forEach(t => t.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary'));
            tab.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            
            // Показываем соответствующий контент
            document.getElementById('newTicketTab').classList.add('hidden');
            document.getElementById('myTicketsTab').classList.add('hidden');
            
            if (tabName === 'new') {
                document.getElementById('newTicketTab').classList.remove('hidden');
            } else {
                document.getElementById('myTicketsTab').classList.remove('hidden');
                loadUserTickets();
            }
        });
    });

    // Создание заявки
    const form = document.getElementById('createTicketForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        
        try {
            const response = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Важно для отправки cookies
                body: JSON.stringify({ subject, description, priority })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Заявка успешно создана!');
                form.reset();
                // Переключаемся на вкладку "Мои заявки"
                document.querySelector('[data-tab="my"]').click();
            } else {
                alert(data.error || 'Ошибка при создании заявки');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ошибка при отправке заявки');
        }
    });
});

async function checkAuth() {
    try {
        const response = await fetch('/api/users/me', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = '/pages/index.html';
            return false;
        }
        
        const data = await response.json();
        if (data.user && data.user.user_type === 'admin') {
            // Добавляем ссылку на админ-панель
            const navDesk = document.querySelector('.nav-desktop');
            if (navDesk && !document.querySelector('.admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = '/pages/admin/support.html';
                adminLink.className = 'nav-link text-red-600 font-bold';
                adminLink.textContent = 'Админ панель';
                navDesk.appendChild(adminLink);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/pages/index.html';
        return false;
    }
}

async function loadUserTickets() {
    const container = document.getElementById('ticketsList');
    
    try {
        const response = await fetch('/api/support/tickets/my', {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.tickets.length > 0) {
            container.innerHTML = data.tickets.map(ticket => `
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="text-lg font-bold text-primary">${escapeHtml(ticket.subject)}</h3>
                            <p class="text-sm text-gray-500 mt-1">
                                Создано: ${new Date(ticket.created_at).toLocaleString('ru-RU')}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <span class="px-3 py-1 rounded-full text-sm ${getStatusClass(ticket.status)}">
                                ${getStatusText(ticket.status)}
                            </span>
                            <span class="px-3 py-1 rounded-full text-sm ${getPriorityClass(ticket.priority)}">
                                ${getPriorityText(ticket.priority)}
                            </span>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4">${escapeHtml(ticket.description)}</p>
                    ${ticket.admin_response ? `
                        <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="font-semibold text-blue-700">Ответ поддержки:</span>
                                <span class="text-xs text-gray-500">
                                    ${new Date(ticket.admin_responded_at).toLocaleString('ru-RU')}
                                </span>
                            </div>
                            <p class="text-gray-700">${escapeHtml(ticket.admin_response)}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    У вас пока нет заявок в поддержку
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        container.innerHTML = `
            <div class="text-center text-red-500 py-8">
                Ошибка при загрузке заявок
            </div>
        `;
    }
}

function getStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'resolved': 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Ожидает',
        'in_progress': 'В работе',
        'resolved': 'Решена'
    };
    return texts[status] || status;
}

function getPriorityClass(priority) {
    const classes = {
        'low': 'bg-gray-100 text-gray-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
}

function getPriorityText(priority) {
    const texts = {
        'low': 'Низкий',
        'medium': 'Средний',
        'high': 'Высокий'
    };
    return texts[priority] || priority;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}