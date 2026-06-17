const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с сессиями
 */
class Session {
    /**
     * Создать новую сессию
     * @param {number} userId 
     * @returns {Promise<string>} sessionId
     */
    static async create(userId) {
        const sessionId = Date.now().toString() + Math.random().toString(36);
        
        await query(
            'INSERT INTO sessions (session_id, user_id) VALUES (?, ?)',
            [sessionId, userId]
        );

        return sessionId;
    }

    /**
     * Найти сессию по sessionId
     * @param {string} sessionId 
     * @returns {Promise<Object|null>}
     */
    static async findBySessionId(sessionId) {
        return await queryOne(
            'SELECT user_id FROM sessions WHERE session_id = ?',
            [sessionId]
        );
    }

    /**
     * Удалить сессию
     * @param {string} sessionId 
     * @returns {Promise<void>}
     */
    static async delete(sessionId) {
        await query('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
    }

    /**
     * Удалить все сессии пользователя
     * @param {number} userId 
     * @returns {Promise<void>}
     */
    static async deleteAllByUserId(userId) {
        await query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    }

    /**
     * Проверить валидность сессии
     * @param {string} sessionId 
     * @returns {Promise<boolean>}
     */
    static async isValid(sessionId) {
        const session = await this.findBySessionId(sessionId);
        return session !== null;
    }
}

module.exports = Session;

