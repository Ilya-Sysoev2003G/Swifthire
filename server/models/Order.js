const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с заказами
 */
class Order {
    /**
     * Получить все активные заказы
     * @returns {Promise<Array>}
     */
    static async getAll() {
        return await query(
            `SELECT o.*, u.name as customer_name 
             FROM orders o 
             LEFT JOIN users u ON o.customer_id = u.id 
             WHERE o.status IN ('open', 'in_progress')
             ORDER BY o.created_at DESC`
        );
    }

    /**
     * Поиск заказов с фильтрами
     * @param {Object} filters 
     * @returns {Promise<Array>}
     */
    static async search(filters = {}) {
        const { searchQuery, category, minBudget, maxBudget } = filters;

        let sql = `SELECT o.*, u.name as customer_name 
                   FROM orders o 
                   LEFT JOIN users u ON o.customer_id = u.id 
                   WHERE o.status IN ('open', 'in_progress')`;
        const params = [];

        // Фильтрация по поисковому запросу
        if (searchQuery) {
            sql += ` AND (o.title LIKE ? OR o.description LIKE ?)`;
            params.push(`%${searchQuery}%`, `%${searchQuery}%`);
        }

        // Фильтрация по категории
        if (category) {
            sql += ` AND o.category = ?`;
            params.push(category);
        }

        // Фильтрация по бюджету
        if (minBudget) {
            sql += ` AND o.budget >= ?`;
            params.push(parseFloat(minBudget));
        }
        if (maxBudget) {
            sql += ` AND o.budget <= ?`;
            params.push(parseFloat(maxBudget));
        }

        sql += ` ORDER BY o.created_at DESC`;

        return await query(sql, params);
    }

    /**
     * Найти заказ по ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return await queryOne(
            `SELECT o.*, 
                    customer.name as customer_name, 
                    customer.email as customer_email,
                    performer.name as performer_name,
                    performer.email as performer_email
             FROM orders o 
             LEFT JOIN users customer ON o.customer_id = customer.id 
             LEFT JOIN users performer ON o.performer_id = performer.id
             WHERE o.id = ?`,
            [id]
        );
    }

    /**
     * Создать новый заказ
     * @param {Object} orderData 
     * @returns {Promise<Object>}
     */
    static async create({ title, description, category, budget, customerId }) {
        const result = await query(
            'INSERT INTO orders (title, description, category, budget, customer_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, category, parseFloat(budget), customerId, 'open']
        );

        return await this.findById(result.insertId);
    }

    /**
     * Обновить заказ
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise<Object|null>}
     */
    static async update(id, updates) {
        const fields = [];
        const values = [];

        if (updates.title) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.description) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.category) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.budget) {
            fields.push('budget = ?');
            values.push(parseFloat(updates.budget));
        }
        if (updates.status) {
            fields.push('status = ?');
            values.push(updates.status);
        }
        if (updates.performerId !== undefined) {
            fields.push('performer_id = ?');
            values.push(updates.performerId);
        }

        if (fields.length === 0) {
            return await this.findById(id);
        }

        values.push(id);
        await query(
            `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await this.findById(id);
    }

    /**
     * Удалить заказ
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM orders WHERE id = ?', [id]);
    }

    /**
     * Проверить существование заказа
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async exists(id) {
        const order = await queryOne('SELECT id FROM orders WHERE id = ?', [id]);
        return order !== null;
    }

    /**
     * Получить заказы пользователя
     * @param {number} customerId 
     * @returns {Promise<Array>}
     */
    static async findByCustomerId(customerId) {
        return await query(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
            [customerId]
        );
    }

    /**
     * Получить заказы пользователя (алиас для findByCustomerId)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUserId(userId) {
        return await this.findByCustomerId(userId);
    }

    /**
     * Назначить исполнителя заказу
     * @param {number} orderId 
     * @param {number} performerId 
     * @returns {Promise<Object|null>}
     */
    static async assignPerformer(orderId, performerId) {
        await query(
            'UPDATE orders SET performer_id = ?, status = ? WHERE id = ?',
            [performerId, 'in_progress', orderId]
        );
        return await this.findById(orderId);
    }

    /**
     * Получить заказы, где пользователь является исполнителем
     * @param {number} performerId 
     * @returns {Promise<Array>}
     */
    static async findByPerformerId(performerId) {
        return await query(
            `SELECT o.*, customer.name as customer_name 
             FROM orders o 
             LEFT JOIN users customer ON o.customer_id = customer.id 
             WHERE o.performer_id = ? 
             ORDER BY o.created_at DESC`,
            [performerId]
        );
    }

    /**
     * Проверить, может ли заказ быть оценен (статус completed и есть исполнитель)
     * @param {number} orderId 
     * @returns {Promise<boolean>}
     */
    static async canBeReviewed(orderId) {
        const order = await queryOne(
            'SELECT status, performer_id FROM orders WHERE id = ?',
            [orderId]
        );
        return order && order.status === 'completed' && order.performer_id !== null;
    }
}

module.exports = Order;

