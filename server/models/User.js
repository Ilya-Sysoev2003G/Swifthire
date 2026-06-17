const { query, queryOne } = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Модель для работы с пользователями
 */
class User {
    /**
     * Найти пользователя по email
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        return await queryOne(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
    }

    /**
     * Найти пользователя по ID
     * @param {number} id 
     * @param {boolean} includePassword - включить ли пароль в результат
     * @returns {Promise<Object|null>}
     */
    static async findById(id, includePassword = false) {
        const fields = includePassword 
            ? 'id, email, name, user_type, skills, password, created_at'
            : 'id, email, name, user_type, skills, created_at';
            
        return await queryOne(
            `SELECT ${fields} FROM users WHERE id = ?`,
            [id]
        );
    }

    /**
     * Создать нового пользователя
     * @param {Object} userData 
     * @returns {Promise<number>} ID созданного пользователя
     */
    static async create({ email, password, name, userType }) {
        // Хешируем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const result = await query(
            'INSERT INTO users (email, password, name, user_type) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, userType]
        );
        return result.insertId;
    }

    /**
     * Аутентификация пользователя
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object|null>}
     */
    static async authenticate(email, password) {
        // Получаем пользователя с хешированным паролем
        const user = await queryOne(
            'SELECT id, email, name, user_type, password FROM users WHERE email = ?',
            [email]
        );
        
        if (!user) {
            return null;
        }
        
        // Сравниваем введенный пароль с хешированным
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return null;
        }
        
        // Возвращаем пользователя без пароля
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Обновить данные пользователя
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise<boolean>}
     */
    static async update(id, updates) {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.password) {
            // Хешируем новый пароль перед сохранением
            const hashedPassword = await bcrypt.hash(updates.password, SALT_ROUNDS);
            fields.push('password = ?');
            values.push(hashedPassword);
        }
        if (updates.skills !== undefined) {
            fields.push('skills = ?');
            values.push(updates.skills);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        await query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }

    /**
     * Получить статистику заказов для заказчика
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static async getCustomerOrderStats(userId) {
        const stats = await queryOne(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' OR status = 'in_progress' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM orders WHERE customer_id = ?`,
            [userId]
        );

        return {
            total: stats.total || 0,
            active: stats.active || 0,
            completed: stats.completed || 0
        };
    }

    /**
     * Получить статистику услуг для исполнителя
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static async getPerformerServiceStats(userId) {
        const stats = await queryOne(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM services WHERE performer_id = ?`,
            [userId]
        );

        return {
            total: stats.total || 0,
            active: stats.active || 0,
            completed: stats.completed || 0
        };
    }

    /**
     * Получить статистику заказов для исполнителя (по performer_id)
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static async getPerformerOrderStats(userId) {
        const stats = await queryOne(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_progress' OR status = 'pending' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM orders WHERE performer_id = ?`,
            [userId]
        );

        return {
            total: stats.total || 0,
            active: stats.active || 0,
            completed: stats.completed || 0
        };
    }

    /**
     * Удалить пользователя
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM users WHERE id = ?', [id]);
    }
}

module.exports = User;

