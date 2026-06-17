let currentTicketId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации и прав администратора
    checkAdminAuth();
    
    // Обновление каждые 30 секунд
    setInterval(() => {
        if (document.getElementById('ticketsList')) {
            loadStats();
            loadAllTickets();
        }
    }, 30000);
});

async function checkAdminAuth() {
    try {
        const response = await fetch('/api/users/me', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = '/pages/index.html';
            return;
        }
        
        const data = await response.json();
        if (data.user && data.user.user_type === 'admin') {
            loadStats();
            loadAllTickets();
        } else {
            alert('Доступ запрещен. Только для администраторов.');
            window.location.href = '/pages/index.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/pages/index.html';
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/support/admin/stats', {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalCount').textContent = data.stats.total || 0;
            document.getElementById('pendingCount').textContent = data.stats.pending || 0;
            document.getElementById('inProgressCount').textContent = data.stats.in_progress || 0;
            document.getElementById('resolvedCount').textContent = data.stats.resolved || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadAllTickets() {
    const container = document.getElementById('ticketsList');
    
    try {
        const response = await fetch('/api/support/admin/tickets', {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.tickets.length > 0) {
            container.innerHTML = data.tickets.map(ticket => `
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-lg font-bold text-primary">#${ticket.id} ${escapeHtml(ticket.subject)}</h3>
                                <span class="px-3 py-1 rounded-full text-sm ${getStatusClass(ticket.status)}">
                                    ${getStatusText(ticket.status)}
                                </span>
                                <span class="px-3 py-1 rounded-full text-sm ${getPriorityClass(ticket.priority)}">
                                    ${getPriorityText(ticket.priority)}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 mb-2">
                                От: ${escapeHtml(ticket.user_name)} (${escapeHtml(ticket.user_email)})
                            </p>
                            <p class="text-sm text-gray-500 mb-3">
                                Создано: ${new Date(ticket.created_at).toLocaleString('ru-RU')}
                            </p>
                            <p class="text-gray-700 mb-4">${escapeHtml(ticket.description)}</p>
                            ${ticket.admin_response ? `
                                <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div class="font-semibold text-blue-700 mb-2">Ответ:</div>
                                    <p class="text-gray-700">${escapeHtml(ticket.admin_response)}</p>
                                    <p class="text-xs text-gray-500 mt-2">
                                        Отвечено: ${new Date(ticket.admin_responded_at).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                        <div class="ml-4 flex flex-col gap-2">
                            ${ticket.status !== 'resolved' ? `
                                <select id="status-${ticket.id}" class="px-3 py-1 border rounded-lg text-sm">
                                    <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                                    <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>В работе</option>
                                    <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Решена</option>
                                </select>
                                <button onclick="updateStatus(${ticket.id})" 
                                        class="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600">
                                    Обновить статус
                                </button>
                            ` : ''}
                            ${!ticket.admin_response ? `
                                <button onclick="openResponseModal(${ticket.id}, '${escapeHtml(ticket.subject)}', '${escapeHtml(ticket.user_name)}')" 
                                        class="btn-primary px-4 py-2 text-sm">
                                    Ответить
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    Нет заявок в поддержку
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

async function updateStatus(ticketId) {
    const statusSelect = document.getElementById(`status-${ticketId}`);
    const status = statusSelect.value;
    
    try {
        const response = await fetch(`/api/support/admin/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Статус обновлен');
            loadStats();
            loadAllTickets();
        } else {
            alert(data.error || 'Ошибка при обновлении статуса');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Ошибка при обновлении статуса');
    }
}

function openResponseModal(ticketId, subject, userName) {
    currentTicketId = ticketId;
    const modal = document.getElementById('responseModal');
    const info = document.getElementById('modalTicketInfo');
    info.innerHTML = `
        <div><strong>Заявка #${ticketId}</strong></div>
        <div><strong>Тема:</strong> ${subject}</div>
        <div><strong>От:</strong> ${userName}</div>
    `;
    document.getElementById('responseText').value = '';
    modal.classList.remove('hidden');
}

async function sendResponse() {
    const response = document.getElementById('responseText').value.trim();
    if (!response) {
        alert('Введите текст ответа');
        return;
    }
    
    try {
        const apiResponse = await fetch(`/api/support/admin/tickets/${currentTicketId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ response })
        });
        
        const data = await apiResponse.json();
        
        if (data.success) {
            alert('Ответ отправлен пользователю');
            closeModal();
            loadStats();
            loadAllTickets();
        } else {
            alert(data.error || 'Ошибка при отправке ответа');
        }
    } catch (error) {
        console.error('Error sending response:', error);
        alert('Ошибка при отправке ответа');
    }
}

function closeModal() {
    const modal = document.getElementById('responseModal');
    modal.classList.add('hidden');
    currentTicketId = null;
}

function logout() {
    // Здесь нужно реализовать выход через вашу систему
    window.location.href = '/pages/index.html';
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