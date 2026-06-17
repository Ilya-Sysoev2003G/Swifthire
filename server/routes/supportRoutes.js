const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { requiredAuthMiddleware } = require('../middlewares/requiredAuthMiddleware'); // Исправлено название

// Все роуты требуют авторизации
router.use(requiredAuthMiddleware);

// Пользовательские роуты
router.post('/tickets', supportController.createTicket);
router.get('/tickets/my', supportController.getUserTickets);
router.get('/tickets/:ticketId', supportController.getTicketDetails);

// Админские роуты
router.get('/admin/tickets', supportController.getAllTickets);
router.get('/admin/stats', supportController.getStats);
router.put('/admin/tickets/:ticketId/respond', supportController.respondToTicket);
router.patch('/admin/tickets/:ticketId/status', supportController.updateTicketStatus);

module.exports = router;