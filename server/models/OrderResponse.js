const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с откликами на заказы
 */
class OrderResponse {
    /**
     * Получить все отклики на заказ
     * @param {number} orderId 
     * @returns {Promise<Array>}
     */
    static async getByOrderId(orderId) {
        return await query(
            `SELECT o.*, u.name as performer_name, u.email as performer_email 
             FROM order_responses o 
             LEFT JOIN users u ON o.performer_id = u.id 
             WHERE o.order_id = ? 
             ORDER BY o.created_at DESC`,
            [orderId]
        );
    }

    /**
     * Создать новый отклик
     * @param {Object} responseData 
     * @returns {Promise<Object>}
     */
    static async create({ orderId, performerId, message, price, countDays }) {
        const result = await query(
            'INSERT INTO order_responses (order_id, performer_id, message, price, count_days) VALUES (?, ?, ?, ?, ?)',
            [orderId, performerId, message, parseFloat(price), parseInt(countDays)]
        );

        return await this.findById(result.insertId);
    }

    /**
     * Найти отклик по ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return await queryOne(
            `SELECT o.*, u.name as performer_name, u.email as performer_email 
             FROM order_responses o 
             LEFT JOIN users u ON o.performer_id = u.id 
             WHERE o.id = ?`,
            [id]
        );
    }

    /**
     * Удалить отклик
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM order_responses WHERE id = ?', [id]);
    }

    /**
     * Проверить существование отклика
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async exists(id) {
        const response = await queryOne('SELECT id FROM order_responses WHERE id = ?', [id]);
        return response !== null;
    }

    /**
     * Получить отклики пользователя
     * @param {number} performerId 
     * @returns {Promise<Array>}
     */
    static async getByPerformerId(performerId) {
        return await query(
            `SELECT o.*, o.title as order_title, o.status as order_status 
             FROM order_responses o 
             LEFT JOIN orders o ON o.order_id = o.id 
             WHERE o.performer_id = ? 
             ORDER BY o.created_at DESC`,
            [performerId]
        );
    }

    /**
     * Проверить, откликался ли пользователь на заказ
     * @param {number} orderId 
     * @param {number} performerId 
     * @returns {Promise<boolean>}
     */
    static async hasUserResponded(orderId, performerId) {
        const response = await queryOne(
            'SELECT id FROM order_responses WHERE order_id = ? AND performer_id = ?',
            [orderId, performerId]
        );
        return response !== null;
    }
}

module.exports = OrderResponse;
