const OrderResponse = require('../models/OrderResponse');

/**
 * GET /api/orders/:orderId/responses - Получение откликов на заказ
 */
exports.getOrderResponses = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const responses = await OrderResponse.getByOrderId(orderId);
        res.json(responses);
    } catch (error) {
        console.error('Get order responses error:', error);
        res.status(500).json({ error: 'Ошибка получения откликов' });
    }
};

/**
 * POST /api/orders/:orderId/responses - Создание отклика на заказ
 */
exports.createResponse = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { message, price, countDays } = req.body;

        // Валидация
        if (!message || !price || !countDays) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const performerId = req.auth_user?.id;

        // Проверка, не откликался ли уже пользователь
        const hasResponded = await OrderResponse.hasUserResponded(orderId, performerId);
        if (hasResponded) {
            return res.status(400).json({ error: 'Вы уже откликались на этот заказ' });
        }

        const newResponse = await OrderResponse.create({
            orderId,
            performerId,
            message,
            price,
            countDays
        });

        res.json({
            success: true,
            response: newResponse
        });
    } catch (error) {
        console.error('Create response error:', error);
        res.status(500).json({ error: 'Ошибка создания отклика' });
    }
};

/**
 * DELETE /api/responses/:id - Удаление отклика
 */
exports.deleteResponse = async (req, res) => {
    try {
        const responseId = parseInt(req.params.id);

        const responseExists = await OrderResponse.exists(responseId);
        if (!responseExists) {
            return res.status(404).json({ error: 'Отклик не найден' });
        }

        await OrderResponse.delete(responseId);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete response error:', error);
        res.status(500).json({ error: 'Ошибка удаления отклика' });
    }
};

/**
 * GET /api/users/:userId/responses - Получение откликов пользователя
 */
exports.getUserResponses = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const responses = await OrderResponse.getByPerformerId(userId);
        res.json(responses);
    } catch (error) {
        console.error('Get user responses error:', error);
        res.status(500).json({ error: 'Ошибка получения откликов пользователя' });
    }
};
