const Review = require('../models/Review');
const Order = require('../models/Order');
const { getAuthUser } = require('../utils/auth');

/**
 * GET /api/reviews/user/:userId - Получение отзывов пользователя
 */
exports.getUserReviews = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const reviews = await Review.findByRevieweeId(userId);
        const rating = await Review.getAverageRating(userId);

        res.json({
            reviews,
            rating
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ error: 'Ошибка получения отзывов' });
    }
};

/**
 * GET /api/reviews/order/:orderId - Получение отзывов по заказу
 */
exports.getOrderReviews = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        
        const reviews = await Review.findByOrderId(orderId);

        res.json(reviews);
    } catch (error) {
        console.error('Get order reviews error:', error);
        res.status(500).json({ error: 'Ошибка получения отзывов' });
    }
};

/**
 * POST /api/reviews - Создание нового отзыва
 */
exports.createReview = async (req, res) => {
    try {
        const { orderId, revieweeId, rating, comment } = req.body;
        const authUser = getAuthUser(req);

        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Валидация
        if (!orderId || !revieweeId || !rating) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
        }

        // Проверка, что заказ завершен
        const canReview = await Order.canBeReviewed(orderId);
        if (!canReview) {
            return res.status(400).json({ error: 'Заказ не завершен или не имеет исполнителя' });
        }

        // Получаем информацию о заказе
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Проверяем, что пользователь является участником заказа
        if (order.customer_id !== authUser.id && order.performer_id !== authUser.id) {
            return res.status(403).json({ error: 'Вы не являетесь участником этого заказа' });
        }

        // Проверяем, что пользователь не оставляет отзыв сам себе
        if (authUser.id === revieweeId) {
            return res.status(400).json({ error: 'Нельзя оставить отзыв самому себе' });
        }

        // Проверяем, что пользователь еще не оставлял отзыв
        const hasReviewed = await Review.hasReviewed(orderId, authUser.id);
        if (hasReviewed) {
            return res.status(400).json({ error: 'Вы уже оставили отзыв по этому заказу' });
        }

        // Создаем отзыв
        const reviewId = await Review.create({
            orderId,
            reviewerId: authUser.id,
            revieweeId,
            rating: parseInt(rating),
            comment: comment || ''
        });

        const newReview = await Review.findById(reviewId);

        res.json({
            success: true,
            review: newReview
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Ошибка создания отзыва' });
    }
};

/**
 * PUT /api/reviews/:id - Редактирование отзыва
 */
exports.updateReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const authUser = getAuthUser(req);

        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка существования отзыва
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Отзыв не найден' });
        }

        // Проверка прав доступа
        const isOwner = await Review.isOwner(reviewId, authUser.id);
        if (!isOwner) {
            return res.status(403).json({ error: 'Нет прав для редактирования' });
        }

        // Валидация рейтинга
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
        }

        // Обновление отзыва
        await Review.update(reviewId, {
            rating: rating ? parseInt(rating) : undefined,
            comment
        });

        const updatedReview = await Review.findById(reviewId);

        res.json({
            success: true,
            review: updatedReview
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ error: 'Ошибка обновления отзыва' });
    }
};

/**
 * DELETE /api/reviews/:id - Удаление отзыва
 */
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const authUser = getAuthUser(req);

        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка существования отзыва
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Отзыв не найден' });
        }

        // Проверка прав доступа
        const isOwner = await Review.isOwner(reviewId, authUser.id);
        if (!isOwner) {
            return res.status(403).json({ error: 'Нет прав для удаления' });
        }

        await Review.delete(reviewId);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Ошибка удаления отзыва' });
    }
};

/**
 * GET /api/reviews/can-review/:orderId - Проверка возможности оставить отзыв
 */
exports.canReview = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const authUser = getAuthUser(req);

        if (!authUser) {
            return res.json({ canReview: false, reason: 'Требуется авторизация' });
        }

        // Проверяем, что заказ завершен
        const canReview = await Order.canBeReviewed(orderId);
        if (!canReview) {
            return res.json({ canReview: false, reason: 'Заказ не завершен' });
        }

        // Получаем информацию о заказе
        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ canReview: false, reason: 'Заказ не найден' });
        }

        // Проверяем, что пользователь является участником заказа
        if (order.customer_id !== authUser.id && order.performer_id !== authUser.id) {
            return res.json({ canReview: false, reason: 'Вы не участник заказа' });
        }

        // Проверяем, что пользователь еще не оставлял отзыв
        const hasReviewed = await Review.hasReviewed(orderId, authUser.id);
        if (hasReviewed) {
            return res.json({ canReview: false, reason: 'Отзыв уже оставлен' });
        }

        // Определяем, кому будет оставлен отзыв
        const revieweeId = order.customer_id === authUser.id 
            ? order.performer_id 
            : order.customer_id;

        const revieweeName = order.customer_id === authUser.id 
            ? order.performer_name 
            : order.customer_name;

        res.json({ 
            canReview: true, 
            revieweeId,
            revieweeName,
            orderId 
        });
    } catch (error) {
        console.error('Can review error:', error);
        res.status(500).json({ error: 'Ошибка проверки возможности отзыва' });
    }
};

