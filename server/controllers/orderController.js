const Order = require('../models/Order');

/**
 * GET /api/orders - Получение списка всех заказов
 */
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
};

/**
 * GET /api/orders/search - Поиск заказов с фильтрами
 */
exports.searchOrders = async (req, res) => {
    try {
        const { query: searchQuery, category, minBudget, maxBudget } = req.query;

        const orders = await Order.search({
            searchQuery,
            category,
            minBudget,
            maxBudget
        });

        res.json(orders);
    } catch (error) {
        console.error('Search orders error:', error);
        res.status(500).json({ error: 'Ошибка поиска заказов' });
    }
};

/**
 * GET /api/orders/:id - Получение конкретного заказа
 */
exports.getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Ошибка получения заказа' });
    }
};

/**
 * POST /api/orders - Создание нового заказа (для заказчика)
 */
exports.createOrder = async (req, res) => {
    try {
        const { title, description, category, budget } = req.body;

        // Валидация
        if (!title || !description || !category || !budget) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const customerId = req.auth_user?.id;

        const newOrder = await Order.create({
            title,
            description,
            category,
            budget,
            customerId
        });

        res.json({
            success: true,
            order: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Ошибка создания заказа' });
    }
};

/**
 * PUT /api/orders/:id - Редактирование заказа
 */
exports.updateOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { title, description, category, budget, status } = req.body;

        // Проверка существования заказа
        const orderExists = await Order.exists(orderId);
        
        if (!orderExists) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Обновление данных
        const updatedOrder = await Order.update(orderId, {
            title,
            description,
            category,
            budget,
            status
        });

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Ошибка обновления заказа' });
    }
};

/**
 * DELETE /api/orders/:id - Удаление заказа
 */
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        const orderExists = await Order.exists(orderId);
        
        if (!orderExists) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        await Order.delete(orderId);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Ошибка удаления заказа' });
    }
};

/**
 * GET /api/orders/user/:userId - Получение заказов конкретного пользователя
 */
exports.getUserOrders = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const orders = await Order.findByUserId(userId);

        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Ошибка получения заказов пользователя' });
    }
};

/**
 * GET /api/orders/performer/:performerId - Получение заказов исполнителя
 */
exports.getPerformerOrders = async (req, res) => {
    try {
        const performerId = parseInt(req.params.performerId);
        
        const orders = await Order.findByPerformerId(performerId);

        res.json(orders);
    } catch (error) {
        console.error('Get performer orders error:', error);
        res.status(500).json({ error: 'Ошибка получения заказов исполнителя' });
    }
};

/**
 * PUT /api/orders/:id/assign - Назначение исполнителя заказу
 */
exports.assignPerformer = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { performerId } = req.body;

        if (!performerId) {
            return res.status(400).json({ error: 'Не указан исполнитель' });
        }

        // Проверка существования заказа
        const orderExists = await Order.exists(orderId);
        
        if (!orderExists) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Назначение исполнителя и изменение статуса на "в работе"
        const updatedOrder = await Order.assignPerformer(orderId, performerId);

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Assign performer error:', error);
        res.status(500).json({ error: 'Ошибка назначения исполнителя' });
    }
};

/**
 * PUT /api/orders/:id/status - Обновление статуса заказа
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Не указан статус' });
        }

        // Валидация статуса
        const validStatuses = ['open', 'in_progress', 'pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Недопустимый статус' });
        }

        // Проверка существования заказа
        const orderExists = await Order.exists(orderId);
        
        if (!orderExists) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Обновление статуса
        const updatedOrder = await Order.update(orderId, { status });

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Ошибка обновления статуса заказа' });
    }
};