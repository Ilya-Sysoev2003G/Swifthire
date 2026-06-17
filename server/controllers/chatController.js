const Chat = require('../models/Chat');
const { queryOne } = require('../config/database');
const { getAuthUser } = require('../utils/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/chat');
        
        // Создаем директорию, если она не существует
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    // Разрешаем только определенные типы файлов
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый тип файла. Разрешены: изображения, документы, PDF, архивы'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB максимальный размер файла
        files: 5 // Максимум 5 файлов за раз
    }
});

exports.getAllChats = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const chats = await Chat.getAll(user.id);
        res.json(chats);
    } catch (error) {
        console.error('Get all chats error:', error);
        res.status(500).json({ error: 'Ошибка получения чатов' });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const chatId = req.params.chatId;
        
        // Проверка доступа к чату
        const hasAccess = await Chat.hasAccess(chatId, user.id);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        const messages = await Chat.getChatMessages(chatId, user.id);
        res.json(messages);
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({ error: 'Ошибка получения сообщений' });
    }
};

exports.createChatWithService = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { serviceId } = req.body;
        
        if (!serviceId) {
            return res.status(400).json({ error: 'ID услуги обязателен' });
        }
        
        // Получаем информацию об услуге и её исполнителе
        const service = await queryOne(
            `SELECT s.*, u.id as performer_id, u.name as performer_name 
             FROM services s 
             JOIN users u ON s.performer_id = u.id 
             WHERE s.id = ?`,
            [serviceId]
        );
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }
        
        // Проверяем, что пользователь не пытается создать чат с самим собой
        if (user.id === service.performer_id) {
            return res.status(400).json({ error: 'Нельзя создать чат с самим собой' });
        }
        
        // Создаем или получаем существующий чат
        const chatResult = await Chat.createOrGetChat(user.id, service.performer_id);
        
        // Отправляем начальное сообщение
        const initialMessage = `Пишу по поводу услуги: ${service.title}`;
        const newMessage = await Chat.sendMessage(chatResult.id, user.id, initialMessage);
        
        res.status(201).json({
            chatId: chatResult.id,
            isNewChat: chatResult.isNew,
            message: newMessage,
            service: {
                id: service.id,
                title: service.title,
                performerName: service.performer_name
            }
        });
    } catch (error) {
        console.error('Create chat with service error:', error);
        res.status(500).json({ error: 'Ошибка создания чата' });
    }
};

exports.createChatWithOrderPerformer = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const { orderId, performerId } = req.body;
        
        if (!orderId || !performerId) {
            return res.status(400).json({ error: 'ID заказа и ID исполнителя обязательны' });
        }
        
        // Получаем информацию о заказе
        const order = await queryOne(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );
        
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        // Проверяем, что пользователь - владелец заказа
        if (user.id !== order.customer_id) {
            return res.status(403).json({ error: 'Только владелец заказа может создать чат с исполнителем' });
        }
        
        // Проверяем, что пользователь не пытается создать чат с самим собой
        if (user.id === performerId) {
            return res.status(400).json({ error: 'Нельзя создать чат с самим собой' });
        }
        
        // Получаем информацию об исполнителе
        const performer = await queryOne(
            'SELECT id, name FROM users WHERE id = ?',
            [performerId]
        );
        
        if (!performer) {
            return res.status(404).json({ error: 'Исполнитель не найден' });
        }
        
        // Создаем или получаем существующий чат
        const chatResult = await Chat.createOrGetChat(user.id, performerId);
        
        // Отправляем начальное сообщение
        const initialMessage = `Пишу насчет заказа: ${order.title}`;
        const newMessage = await Chat.sendMessage(chatResult.id, user.id, initialMessage);
        
        res.status(201).json({
            chatId: chatResult.id,
            isNewChat: chatResult.isNew,
            message: newMessage,
            order: {
                id: order.id,
                title: order.title,
                performerName: performer.name
            }
        });
    } catch (error) {
        console.error('Create chat with order performer error:', error);
        res.status(500).json({ error: 'Ошибка создания чата' });
    }
};

// Middleware для загрузки файлов
exports.uploadFiles = upload.array('files', 5);

exports.sendMessage = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const chatId = req.params.chatId;
        const { message } = req.body;
        const files = req.files || [];
        
        if ((!message || !message.trim()) && files.length === 0) {
            return res.status(400).json({ error: 'Сообщение не может быть пустым без файлов' });
        }
        
        // Проверка доступа к чату
        const hasAccess = await Chat.hasAccess(chatId, user.id);
        if (!hasAccess) {
            // Удаляем загруженные файлы, если доступ запрещен
            files.forEach(file => {
                fs.unlinkSync(file.path);
            });
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        
        const newMessage = await Chat.sendMessage(chatId, user.id, message ? message.trim() : '', files);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Send message error:', error);
        
        // Удаляем загруженные файлы в случае ошибки
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({ error: 'Ошибка отправки сообщения' });
    }
};

/**
 * Скачать файл из чата
 */
exports.downloadFile = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const fileId = req.params.fileId;
        
        // Получаем информацию о файле
        const fileInfo = await Chat.getFileInfo(fileId, user.id);
        
        if (!fileInfo) {
            return res.status(404).json({ error: 'Файл не найден или доступ запрещен' });
        }
        
        const filePath = path.join(__dirname, '../../uploads/chat', fileInfo.file_name);
        
        // Проверяем существование файла
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Файл не найден на сервере' });
        }
        
        // Отправляем файл
        res.download(filePath, fileInfo.original_name, (err) => {
            if (err) {
                console.error('File download error:', err);
                res.status(500).json({ error: 'Ошибка скачивания файла' });
            }
        });
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({ error: 'Ошибка получения файла' });
    }
};

/**
 * Получить информацию о файле
 */
exports.getFileInfo = async (req, res) => {
    try {
        const user = getAuthUser(req);
        const fileId = req.params.fileId;
        
        const fileInfo = await Chat.getFileInfo(fileId, user.id);
        
        if (!fileInfo) {
            return res.status(404).json({ error: 'Файл не найден или доступ запрещен' });
        }
        
        // Убираем путь к файлу из ответа для безопасности
        const safeFileInfo = {
            id: fileInfo.id,
            fileName: fileInfo.file_name,
            originalName: fileInfo.original_name,
            fileSize: fileInfo.file_size,
            fileType: fileInfo.file_type,
            createdAt: fileInfo.created_at
        };
        
        res.json(safeFileInfo);
    } catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({ error: 'Ошибка получения информации о файле' });
    }
};