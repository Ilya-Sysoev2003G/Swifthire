const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");

// GET /api/reviews/user/:userId - Получение отзывов пользователя
router.get('/user/:userId', reviewController.getUserReviews);

// GET /api/reviews/order/:orderId - Получение отзывов по заказу
router.get('/order/:orderId', reviewController.getOrderReviews);

// GET /api/reviews/can-review/:orderId - Проверка возможности оставить отзыв
router.get('/can-review/:orderId', reviewController.canReview);

// POST /api/reviews - Создание нового отзыва
router.post('/', requiredAuthMiddleware, reviewController.createReview);

// PUT /api/reviews/:id - Редактирование отзыва
router.put('/:id', requiredAuthMiddleware, reviewController.updateReview);

// DELETE /api/reviews/:id - Удаление отзыва
router.delete('/:id', requiredAuthMiddleware, reviewController.deleteReview);

module.exports = router;

