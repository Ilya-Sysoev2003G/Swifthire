const { query, queryOne } = require('../config/database');

/**
 * Модель для работы с отзывами
 */
class Review {
    /**
     * Создать новый отзыв
     * @param {Object} reviewData 
     * @returns {Promise<number>} ID созданного отзыва
     */
    static async create({ orderId, reviewerId, revieweeId, rating, comment }) {
        const result = await query(
            'INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [orderId, reviewerId, revieweeId, rating, comment || '']
        );
        return result.insertId;
    }

    /**
     * Получить отзыв по ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return await queryOne(
            `SELECT r.*, 
                    reviewer.name as reviewer_name,
                    reviewee.name as reviewee_name,
                    o.title as order_title
             FROM reviews r
             LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
             LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
             LEFT JOIN orders o ON r.order_id = o.id
             WHERE r.id = ?`,
            [id]
        );
    }

    /**
     * Получить все отзывы для пользователя (кому оставлены)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByRevieweeId(userId) {
        return await query(
            `SELECT r.*, 
                    reviewer.name as reviewer_name,
                    o.title as order_title
             FROM reviews r
             LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
             LEFT JOIN orders o ON r.order_id = o.id
             WHERE r.reviewee_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );
    }

    /**
     * Получить отзывы, оставленные пользователем
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByReviewerId(userId) {
        return await query(
            `SELECT r.*, 
                    reviewee.name as reviewee_name,
                    o.title as order_title
             FROM reviews r
             LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
             LEFT JOIN orders o ON r.order_id = o.id
             WHERE r.reviewer_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );
    }

    /**
     * Получить отзывы по заказу
     * @param {number} orderId 
     * @returns {Promise<Array>}
     */
    static async findByOrderId(orderId) {
        return await query(
            `SELECT r.*, 
                    reviewer.name as reviewer_name,
                    reviewee.name as reviewee_name
             FROM reviews r
             LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
             LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
             WHERE r.order_id = ?
             ORDER BY r.created_at DESC`,
            [orderId]
        );
    }

    /**
     * Проверить, оставил ли пользователь отзыв по заказу
     * @param {number} orderId 
     * @param {number} reviewerId 
     * @returns {Promise<boolean>}
     */
    static async hasReviewed(orderId, reviewerId) {
        const review = await queryOne(
            'SELECT id FROM reviews WHERE order_id = ? AND reviewer_id = ?',
            [orderId, reviewerId]
        );
        return !!review;
    }

    /**
     * Получить средний рейтинг пользователя
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    static async getAverageRating(userId) {
        const result = await queryOne(
            `SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as total_reviews
             FROM reviews
             WHERE reviewee_id = ?`,
            [userId]
        );
        
        return {
            averageRating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0,
            totalReviews: result.total_reviews || 0
        };
    }

    /**
     * Обновить отзыв
     * @param {number} id 
     * @param {Object} updates 
     * @returns {Promise<boolean>}
     */
    static async update(id, { rating, comment }) {
        const fields = [];
        const values = [];

        if (rating !== undefined) {
            fields.push('rating = ?');
            values.push(rating);
        }
        if (comment !== undefined) {
            fields.push('comment = ?');
            values.push(comment);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        await query(
            `UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }

    /**
     * Удалить отзыв
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM reviews WHERE id = ?', [id]);
    }

    /**
     * Проверить, является ли пользователь автором отзыва
     * @param {number} id 
     * @param {number} userId 
     * @returns {Promise<boolean>}
     */
    static async isOwner(id, userId) {
        const review = await queryOne(
            'SELECT reviewer_id FROM reviews WHERE id = ?',
            [id]
        );
        return review && review.reviewer_id === userId;
    }
}

module.exports = Review;

