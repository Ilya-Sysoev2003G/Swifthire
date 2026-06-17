const SupportTicket = require('../models/SupportTicket');

/**
 * Создать новую заявку в поддержку
 */
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const userId = req.auth_user.id; // Изменено с req.user на req.auth_user

        if (!subject || !description) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }

        const ticketId = await SupportTicket.create({
            user_id: userId,
            subject,
            description,
            priority: priority || 'medium'
        });

        res.status(201).json({
            success: true,
            message: 'Заявка успешно создана',
            ticketId
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ error: 'Ошибка при создании заявки' });
    }
};

/**
 * Получить заявки текущего пользователя
 */
exports.getUserTickets = async (req, res) => {
    try {
        const userId = req.auth_user.id; // Изменено с req.user на req.auth_user
        const tickets = await SupportTicket.getUserTickets(userId);
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ error: 'Ошибка при получении заявок' });
    }
};

/**
 * Получить все заявки (только для админа)
 */
exports.getAllTickets = async (req, res) => {
    try {
        // Проверка прав администратора - используем userType из auth_user
        if (req.auth_user.userType !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const tickets = await SupportTicket.getAllTickets();
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ error: 'Ошибка при получении заявок' });
    }
};

/**
 * Получить детали заявки
 */
exports.getTicketDetails = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await SupportTicket.getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }

        // Проверка прав: пользователь может видеть только свои заявки, админ - все
        if (req.auth_user.userType !== 'admin' && ticket.user_id !== req.auth_user.id) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        res.status(500).json({ error: 'Ошибка при получении заявки' });
    }
};

/**
 * Ответить на заявку (только для админа)
 */
exports.respondToTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { response } = req.body;

        // Проверка прав администратора
        if (req.auth_user.userType !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        if (!response) {
            return res.status(400).json({ error: 'Введите текст ответа' });
        }

        const ticket = await SupportTicket.getTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }

        // Ответить на заявку
        await SupportTicket.respondToTicket(ticketId, response);

        res.json({
            success: true,
            message: 'Ответ отправлен пользователю'
        });
    } catch (error) {
        console.error('Error responding to ticket:', error);
        res.status(500).json({ error: 'Ошибка при отправке ответа' });
    }
};

/**
 * Обновить статус заявки (только для админа)
 */
exports.updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        // Проверка прав администратора
        if (req.auth_user.userType !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const validStatuses = ['pending', 'in_progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус' });
        }

        await SupportTicket.updateStatus(ticketId, status);

        res.json({
            success: true,
            message: 'Статус заявки обновлен'
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса' });
    }
};

/**
 * Получить статистику заявок (только для админа)
 */
exports.getStats = async (req, res) => {
    try {
        if (req.auth_user.userType !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const stats = await SupportTicket.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Ошибка при получении статистики' });
    }
};