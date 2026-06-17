const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с портфолио
 */
class Portfolio {
    /**
     * Получить все работы портфолио пользователя
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUserId(userId) {
        return await query(
            'SELECT * FROM portfolio WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
    }

    /**
     * Получить работу портфолио по ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return await queryOne(
            'SELECT * FROM portfolio WHERE id = ?',
            [id]
        );
    }

    /**
     * Создать новую работу в портфолио
     * @param {Object} portfolioData 
     * @returns {Promise<number>} ID созданной работы
     */
    static async create({ userId, title, description, imageUrl }) {
        const result = await query(
            'INSERT INTO portfolio (user_id, title, description, image_url) VALUES (?, ?, ?, ?)',
            [userId, title, description, imageUrl]
        );
        return result.insertId;
    }

    /**
     * Обновить работу в портфолио
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise<boolean>}
     */
    static async update(id, updates) {
        const fields = [];
        const values = [];

        if (updates.title) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.imageUrl) {
            fields.push('image_url = ?');
            values.push(updates.imageUrl);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        await query(
            `UPDATE portfolio SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }

    /**
     * Удалить работу из портфолио
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM portfolio WHERE id = ?', [id]);
    }

    /**
     * Проверить, принадлежит ли работа пользователю
     * @param {number} id 
     * @param {number} userId 
     * @returns {Promise<boolean>}
     */
    static async isOwner(id, userId) {
        const portfolio = await queryOne(
            'SELECT user_id FROM portfolio WHERE id = ?',
            [id]
        );
        return portfolio && portfolio.user_id === userId;
    }

    /**
     * Получить количество работ в портфолио пользователя
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static async getCount(userId) {
        const result = await queryOne(
            'SELECT COUNT(*) as count FROM portfolio WHERE user_id = ?',
            [userId]
        );
        return result ? result.count : 0;
    }
}

module.exports = Portfolio;

