const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requiredAuthMiddleware } = require('../middlewares/requiredAuthMiddleware');


// Получить текущего пользователя
router.get('/me', requiredAuthMiddleware, userController.getCurrentUser);
// GET /api/users/:id - Получение информации о пользователе
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Обновление профиля пользователя
router.put('/:id', userController.updateUser);

// GET /api/users/:id/dashboard - Данные для личного кабинета
router.get('/:id/dashboard', userController.getDashboard);

router.get('/me', userController.getCurrentUser);

module.exports = router;

