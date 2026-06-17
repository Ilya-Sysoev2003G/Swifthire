const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', authController.register);

// POST /api/auth/login - Авторизация пользователя
router.post('/login', authController.login);

// POST /api/auth/logout - Выход из системы
router.post('/logout', requiredAuthMiddleware, authController.logout);

// GET /api/auth/me - Получение данных текущего пользователя
router.get('/me', requiredAuthMiddleware, authController.getCurrentUser);

module.exports = router;

