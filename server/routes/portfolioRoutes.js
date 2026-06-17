const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");

// GET /api/portfolio/user/:userId - Получение портфолио пользователя
router.get('/user/:userId', portfolioController.getUserPortfolio);

// GET /api/portfolio/:id - Получение конкретной работы
router.get('/:id', portfolioController.getPortfolioById);

// POST /api/portfolio - Создание новой работы в портфолио
router.post('/', 
    requiredAuthMiddleware, 
    portfolioController.uploadMiddleware.single('image'),
    portfolioController.createPortfolio
);

// PUT /api/portfolio/:id - Редактирование работы
router.put('/:id', 
    requiredAuthMiddleware,
    portfolioController.uploadMiddleware.single('image'),
    portfolioController.updatePortfolio
);

// DELETE /api/portfolio/:id - Удаление работы
router.delete('/:id', requiredAuthMiddleware, portfolioController.deletePortfolio);

module.exports = router;

