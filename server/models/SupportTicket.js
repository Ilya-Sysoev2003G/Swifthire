const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с заявками в техподдержку
 */
class SupportTicket {
    /**
     * Создать новую заявку
     * @param {Object} ticketData 
     * @returns {Promise<number>} ID созданной заявки
     */
    static async create({ user_id, subject, description, priority = 'medium' }) {
        const result = await query(
            `INSERT INTO support_tickets (user_id, subject, description, priority, status, created_at) 
             VALUES (?, ?, ?, ?, 'pending', NOW())`,
            [user_id, subject, description, priority]
        );
        return result.insertId;
    }

    /**
     * Получить заявки пользователя
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async getUserTickets(userId) {
        return await query(
            `SELECT id, subject, description, status, priority, admin_response, 
                    admin_responded_at, created_at, updated_at
             FROM support_tickets 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );
    }

    /**
     * Получить все заявки (для админа)
     * @returns {Promise<Array>}
     */
    static async getAllTickets() {
        return await query(
            `SELECT t.*, u.name as user_name, u.email as user_email, u.user_type
             FROM support_tickets t
             JOIN users u ON t.user_id = u.id
             ORDER BY 
                 CASE WHEN t.status = 'pending' THEN 1
                      WHEN t.status = 'in_progress' THEN 2
                      WHEN t.status = 'resolved' THEN 3
                      ELSE 4 END,
                 t.created_at DESC`
        );
    }

    /**
     * Получить заявку по ID
     * @param {number} ticketId 
     * @returns {Promise<Object|null>}
     */
    static async getTicketById(ticketId) {
        return await queryOne(
            `SELECT t.*, u.name as user_name, u.email as user_email, u.user_type
             FROM support_tickets t
             JOIN users u ON t.user_id = u.id
             WHERE t.id = ?`,
            [ticketId]
        );
    }

    /**
     * Обновить статус заявки
     * @param {number} ticketId 
     * @param {string} status 
     * @returns {Promise<boolean>}
     */
    static async updateStatus(ticketId, status) {
        await query(
            'UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, ticketId]
        );
        return true;
    }

    /**
     * Ответить на заявку
     * @param {number} ticketId 
     * @param {string} response 
     * @returns {Promise<boolean>}
     */
    static async respondToTicket(ticketId, response) {
        await query(
            `UPDATE support_tickets 
             SET admin_response = ?, 
                 admin_responded_at = NOW(), 
                 status = 'resolved',
                 updated_at = NOW()
             WHERE id = ?`,
            [response, ticketId]
        );
        return true;
    }

    /**
     * Получить статистику заявок
     * @returns {Promise<Object>}
     */
    static async getStats() {
        const stats = await queryOne(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
             FROM support_tickets`
        );
        return stats;
    }
}

module.exports = SupportTicket;