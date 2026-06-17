const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/chats - Получение списка всех чатов
router.get('/', chatController.getAllChats);
router.get('/:chatId', chatController.getChatMessages);

// POST /api/chats/create-with-service - Создание чата с исполнителем услуги
router.post('/create-with-service', chatController.createChatWithService);

// POST /api/chats/create-with-order-performer - Создание чата с исполнителем заказа
router.post('/create-with-order-performer', chatController.createChatWithOrderPerformer);

// POST /api/chats/:chatId/messages - Отправка сообщения с файлами
router.post('/:chatId/messages', chatController.uploadFiles, chatController.sendMessage);

// GET /api/chats/files/:fileId/download - Скачать файл
router.get('/files/:fileId/download', chatController.downloadFile);

// GET /api/chats/files/:fileId - Получить информацию о файле
router.get('/files/:fileId', chatController.getFileInfo);

module.exports = router;