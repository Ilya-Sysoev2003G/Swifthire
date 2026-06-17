const express = require('express');
const router = express.Router();

// Подключение роутов
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');
const orderRoutes = require('./orderRoutes');
const orderResponseRoutes = require('./orderResponseRoutes');
const chatRoutes = require('./chatRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const reviewRoutes = require('./reviewRoutes');
const { userMiddleware } = require("../middlewares/userMiddleware");
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");
const supportRoutes = require('./supportRoutes');

router.use(userMiddleware)

// Использование роутов
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Убрали requiredAuthMiddleware для доступа к просмотру профилей
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/', orderResponseRoutes);
router.use('/chats', requiredAuthMiddleware, chatRoutes);
router.use('/portfolio', portfolioRoutes); // Портфолио доступно для просмотра всем
router.use('/reviews', reviewRoutes);
router.use('/support', supportRoutes);

// Проверка работы API
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'SwiftHire API is running' });
});

module.exports = router;

