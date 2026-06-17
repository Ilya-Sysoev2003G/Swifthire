const Service = require('../models/Service');
const { getAuthUser } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Конфигурация multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/services');
        // Создаем папку, если её нет
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'service-' + uniqueSuffix + ext);
    }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый формат файла. Разрешены только: .png, .jpg, .jpeg, .webp'), false);
    }
};

// Multer middleware с ограничениями
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 МБ
    }
});

/**
 * GET /api/services - Получение списка всех услуг
 */
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.getAll();
        
        // Добавляем информацию о владельце для каждой услуги
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id; 
        const servicesWithOwnership = services.map(service => ({
            ...service,
            isOwner: service.performer_id === currentUserId
        }));
        
        res.json(servicesWithOwnership);
    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({ error: 'Ошибка получения услуг' });
    }
};

/**
 * GET /api/services/search - Поиск услуг с фильтрами
 */
exports.searchServices = async (req, res) => {
    try {
        const { query: searchQuery, category, minPrice, maxPrice } = req.query;

        const services = await Service.search({
            searchQuery,
            category,
            minPrice,
            maxPrice
        });

        // Добавляем информацию о владельце для каждой услуги
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id; 
        const servicesWithOwnership = services.map(service => ({
            ...service,
            isOwner: service.performer_id === currentUserId
        }));

        res.json(servicesWithOwnership);
    } catch (error) {
        console.error('Search services error:', error);
        res.status(500).json({ error: 'Ошибка поиска услуг' });
    }
};

/**
 * GET /api/services/:id - Получение конкретной услуги
 */
exports.getServiceById = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);
        
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        // Добавляем информацию о том, является ли текущий пользователь владельцем
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id;
        service.isOwner = service.performer_id === currentUserId;

        res.json(service);
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ error: 'Ошибка получения услуги' });
    }
};

/**
 * POST /api/services - Создание новой услуги (для исполнителя)
 */
exports.createService = async (req, res) => {
    try {
        const { title, description, category, price } = req.body;

        // Валидация
        if (!title || !description || !category || !price) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const performerId = req.auth_user?.id;

        // Формируем путь к изображению если оно загружено
        const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

        const newService = await Service.create({
            title,
            description,
            category,
            price,
            performerId,
            imageUrl
        });

        res.json({
            success: true,
            service: newService
        });
    } catch (error) {
        console.error('Create service error:', error);
        
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ error: 'Ошибка создания услуги' });
    }
};

/**
 * PUT /api/services/:id - Редактирование услуги
 */
exports.updateService = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);
        const { title, description, category, price } = req.body;

        // Проверка существования услуги
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        // Проверка прав доступа: только владелец может редактировать
        const authUser = req.auth_user;
        if (service.performer_id !== authUser?.id) {
            return res.status(403).json({ error: 'Нет прав для редактирования этой услуги' });
        }

        // Подготовка данных для обновления
        const updateData = {
            title,
            description,
            category,
            price
        };

        // Если загружен новый файл, обновляем изображение
        if (req.file) {
            updateData.imageUrl = `/uploads/services/${req.file.filename}`;
            
            // Удаляем старое изображение
            if (service.image_url && service.image_url.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../..', service.image_url);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
        }

        // Обновление данных
        const updatedService = await Service.update(serviceId, updateData);

        res.json({
            success: true,
            service: updatedService
        });
    } catch (error) {
        console.error('Update service error:', error);
        
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ error: 'Ошибка обновления услуги' });
    }
};

/**
 * DELETE /api/services/:id - Удаление услуги
 */
exports.deleteService = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);

        // Проверка существования услуги
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        // Проверка прав доступа: только владелец может удалить
        const authUser = req.auth_user;
        if (service.performer_id !== authUser?.id) {
            return res.status(403).json({ error: 'Нет прав для удаления этой услуги' });
        }

        // Удаляем изображение услуги, если оно есть
        if (service.image_url && service.image_url.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '../..', service.image_url);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting service image:', err);
            });
        }

        await Service.delete(serviceId);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Ошибка удаления услуги' });
    }
};

/**
 * PUT /api/services/:id/close - Закрытие услуги (изменение статуса)
 */
exports.closeService = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);

        // Проверка существования услуги
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        // Проверка прав доступа: только владелец может закрыть
        const authUser = req.auth_user;
        if (service.performer_id !== authUser?.id) {
            return res.status(403).json({ error: 'Нет прав для закрытия этой услуги' });
        }

        const updatedService = await Service.update(serviceId, {
            status: 'inactive'
        });

        res.json({
            success: true,
            service: updatedService
        });
    } catch (error) {
        console.error('Close service error:', error);
        res.status(500).json({ error: 'Ошибка закрытия услуги' });
    }
};

/**
 * PUT /api/services/:id/open - Открытие услуги (изменение статуса)
 */
exports.openService = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);

        // Проверка существования услуги
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        // Проверка прав доступа: только владелец может открыть
        const authUser = req.auth_user;
        if (service.performer_id !== authUser?.id) {
            return res.status(403).json({ error: 'Нет прав для открытия этой услуги' });
        }

        const updatedService = await Service.update(serviceId, {
            status: 'active'
        });

        res.json({
            success: true,
            service: updatedService
        });
    } catch (error) {
        console.error('Open service error:', error);
        res.status(500).json({ error: 'Ошибка открытия услуги' });
    }
};

/**
 * GET /api/services/user/:userId - Получение услуг конкретного пользователя
 */
exports.getUserServices = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const services = await Service.findByUserId(userId);

        // Добавляем информацию о владельце для каждой услуги
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id; 
        const servicesWithOwnership = services.map(service => ({
            ...service,
            isOwner: service.performer_id === currentUserId
        }));

        res.json(servicesWithOwnership);
    } catch (error) {
        console.error('Get user services error:', error);
        res.status(500).json({ error: 'Ошибка получения услуг пользователя' });
    }
};

// Экспортируем middleware для загрузки файлов
exports.uploadMiddleware = upload;