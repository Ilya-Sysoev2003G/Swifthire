const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");
// GET /api/orders - Получение списка всех заказов
router.get('/', orderController.getAllOrders);

// GET /api/orders/search - Поиск заказов с фильтрами
router.get('/search', orderController.searchOrders);

// GET /api/orders/user/:userId - Получение заказов пользователя
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/performer/:performerId - Получение заказов исполнителя
router.get('/performer/:performerId', orderController.getPerformerOrders);

// GET /api/orders/:id - Получение конкретного заказа
router.get('/:id', orderController.getOrderById);

// POST /api/orders - Создание нового заказа (для заказчика)
router.post('/', requiredAuthMiddleware, orderController.createOrder);

// PUT /api/orders/:id/assign - Назначение исполнителя заказу
router.put('/:id/assign', requiredAuthMiddleware, orderController.assignPerformer);

// PUT /api/orders/:id/status - Обновление статуса заказа
router.put('/:id/status', requiredAuthMiddleware, orderController.updateOrderStatus);

// PUT /api/orders/:id - Редактирование заказа
router.put('/:id', requiredAuthMiddleware, orderController.updateOrder);

// DELETE /api/orders/:id - Удаление заказа
router.delete('/:id', requiredAuthMiddleware, orderController.deleteOrder);

module.exports = router;

