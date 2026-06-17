const express = require('express');
const router = express.Router();
const orderResponseController = require('../controllers/orderResponseController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");
// GET /api/orders/:orderId/responses - Получение откликов на заказ
router.get('/orders/:orderId/responses', orderResponseController.getOrderResponses);

// POST /api/orders/:orderId/responses - Создание отклика на заказ
router.post('/orders/:orderId/responses', requiredAuthMiddleware, orderResponseController.createResponse);

// DELETE /api/responses/:id - Удаление отклика
router.delete('/responses/:id', requiredAuthMiddleware, orderResponseController.deleteResponse);

// GET /api/users/:userId/responses - Получение откликов пользователя
router.get('/users/:userId/responses', requiredAuthMiddleware, orderResponseController.getUserResponses);

module.exports = router;
