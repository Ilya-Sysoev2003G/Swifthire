const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с услугами
 */
class Service {
    /**
     * Получить все активные услуги
     * @returns {Promise<Array>}
     */
    static async getAll() {
        return await query(
            `SELECT s.*, u.name as performer_name 
             FROM services s 
             LEFT JOIN users u ON s.performer_id = u.id 
             WHERE s.status = 'active'
             ORDER BY s.created_at DESC`
        );
    }

    /**
     * Поиск услуг с фильтрами
     * @param {Object} filters 
     * @returns {Promise<Array>}
     */
    static async search(filters = {}) {
        const { searchQuery, category, minPrice, maxPrice } = filters;

        let sql = `SELECT s.*, u.name as performer_name 
                   FROM services s 
                   LEFT JOIN users u ON s.performer_id = u.id 
                   WHERE s.status = 'active'`;
        const params = [];

        // Фильтрация по поисковому запросу
        if (searchQuery) {
            sql += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
            params.push(`%${searchQuery}%`, `%${searchQuery}%`);
        }

        // Фильтрация по категории
        if (category) {
            sql += ` AND s.category = ?`;
            params.push(category);
        }

        // Фильтрация по цене
        if (minPrice) {
            sql += ` AND s.price >= ?`;
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            sql += ` AND s.price <= ?`;
            params.push(parseFloat(maxPrice));
        }

        sql += ` ORDER BY s.created_at DESC`;

        return await query(sql, params);
    }

    /**
     * Найти услугу по ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return await queryOne(
            `SELECT s.*, u.name as performer_name, u.email as performer_email 
             FROM services s 
             LEFT JOIN users u ON s.performer_id = u.id 
             WHERE s.id = ?`,
            [id]
        );
    }

    /**
     * Создать новую услугу
     * @param {Object} serviceData 
     * @returns {Promise<Object>}
     */
    static async create({ title, description, category, price, performerId, imageUrl }) {
        const result = await query(
            'INSERT INTO services (title, description, category, price, performer_id, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, category, parseFloat(price), performerId, 'active', imageUrl || null]
        );

        return await this.findById(result.insertId);
    }

    /**
     * Обновить услугу
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
        if (updates.price) {
            fields.push('price = ?');
            values.push(parseFloat(updates.price));
        }
        if (updates.status) {
            fields.push('status = ?');
            values.push(updates.status);
        }
        if (updates.imageUrl !== undefined) {
            fields.push('image_url = ?');
            values.push(updates.imageUrl);
        }

        if (fields.length === 0) {
            return await this.findById(id);
        }

        values.push(id);
        await query(
            `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await this.findById(id);
    }

    /**
     * Удалить услугу
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM services WHERE id = ?', [id]);
    }

    /**
     * Проверить существование услуги
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async exists(id) {
        const service = await queryOne('SELECT id FROM services WHERE id = ?', [id]);
        return service !== null;
    }

    /**
     * Получить услуги исполнителя
     * @param {number} performerId 
     * @returns {Promise<Array>}
     */
    static async findByPerformerId(performerId) {
        return await query(
            'SELECT * FROM services WHERE performer_id = ? ORDER BY created_at DESC',
            [performerId]
        );
    }

    /**
     * Получить услуги пользователя (алиас для findByPerformerId)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUserId(userId) {
        return await this.findByPerformerId(userId);
    }
}

module.exports = Service;

