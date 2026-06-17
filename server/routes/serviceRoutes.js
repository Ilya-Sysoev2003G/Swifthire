const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { requiredAuthMiddleware } = require("../middlewares/requiredAuthMiddleware");

// GET /api/services - Получение списка всех услуг
router.get('/', serviceController.getAllServices);

// GET /api/services/search - Поиск услуг с фильтрами
router.get('/search', serviceController.searchServices);

// GET /api/services/user/:userId - Получение услуг пользователя
router.get('/user/:userId', serviceController.getUserServices);

// GET /api/services/:id - Получение конкретной услуги
router.get('/:id', serviceController.getServiceById);

// POST /api/services - Создание новой услуги (для исполнителя)
router.post('/', requiredAuthMiddleware, serviceController.uploadMiddleware.single('image'), serviceController.createService);

// PUT /api/services/:id - Редактирование услуги
router.put('/:id', requiredAuthMiddleware, serviceController.uploadMiddleware.single('image'), serviceController.updateService);

// DELETE /api/services/:id - Удаление услуги
router.delete('/:id', requiredAuthMiddleware, serviceController.deleteService);

// PUT /api/services/:id/close - Закрытие услуги
router.put('/:id/close', requiredAuthMiddleware, serviceController.closeService);

// PUT /api/services/:id/open - Открытие услуги
router.put('/:id/open', requiredAuthMiddleware, serviceController.openService);

module.exports = router;

