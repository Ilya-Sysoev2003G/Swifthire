const Portfolio = require('../models/Portfolio');
const { getAuthUser } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Конфигурация multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/portfolio');
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
        cb(null, 'portfolio-' + uniqueSuffix + ext);
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
 * GET /api/portfolio/user/:userId - Получение портфолио пользователя
 */
exports.getUserPortfolio = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const portfolio = await Portfolio.findByUserId(userId);

        // Добавляем информацию о владельце для каждой работы
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id; 
        const portfolioWithOwnership = portfolio.map(item => ({
            ...item,
            isOwner: item.user_id === currentUserId
        }));

        res.json(portfolioWithOwnership);
    } catch (error) {
        console.error('Get user portfolio error:', error);
        res.status(500).json({ error: 'Ошибка получения портфолио' });
    }
};

/**
 * GET /api/portfolio/:id - Получение конкретной работы из портфолио
 */
exports.getPortfolioById = async (req, res) => {
    try {
        const portfolioId = parseInt(req.params.id);
        
        const portfolio = await Portfolio.findById(portfolioId);

        if (!portfolio) {
            return res.status(404).json({ error: 'Работа не найдена' });
        }

        // Добавляем информацию о том, является ли текущий пользователь владельцем
        const authUser = getAuthUser(req);
        const currentUserId = authUser?.id;
        portfolio.isOwner = portfolio.user_id === currentUserId;

        res.json(portfolio);
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ error: 'Ошибка получения работы' });
    }
};

/**
 * POST /api/portfolio - Создание новой работы в портфолио
 * Только авторизованный пользователь может создавать работы в своем портфолио
 */
exports.createPortfolio = async (req, res) => {
    try {
        const { title, description } = req.body;
        const authUser = getAuthUser(req);

        // Проверка авторизации
        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка наличия загруженного файла
        if (!req.file) {
            return res.status(400).json({ error: 'Изображение обязательно' });
        }

        // Валидация входных данных
        if (!title) {
            return res.status(400).json({ error: 'Название обязательно' });
        }

        // Формируем путь к изображению для сохранения в БД
        const imageUrl = `/uploads/portfolio/${req.file.filename}`;

        // Создание работы от имени текущего пользователя
        const portfolioId = await Portfolio.create({
            userId: authUser.id,
            title,
            description: description || '',
            imageUrl
        });

        const newPortfolio = await Portfolio.findById(portfolioId);

        res.json({
            success: true,
            portfolio: newPortfolio
        });
    } catch (error) {
        console.error('Create portfolio error:', error);
        
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ error: 'Ошибка создания работы' });
    }
};

/**
 * PUT /api/portfolio/:id - Редактирование работы в портфолио
 * Проверяет, что portfolio.user_id === currentUser.id перед обновлением
 */
exports.updatePortfolio = async (req, res) => {
    try {
        const portfolioId = parseInt(req.params.id);
        const { title, description } = req.body;
        const authUser = getAuthUser(req);

        // Проверка авторизации
        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка существования работы
        const portfolio = await Portfolio.findById(portfolioId);
        
        if (!portfolio) {
            return res.status(404).json({ error: 'Работа не найдена' });
        }

        // Проверка прав доступа: только владелец может редактировать
        if (portfolio.user_id !== authUser.id) {
            return res.status(403).json({ error: 'Нет прав для редактирования этой работы' });
        }

        // Подготовка данных для обновления
        const updateData = {
            title,
            description
        };

        // Если загружен новый файл, обновляем изображение
        if (req.file) {
            updateData.imageUrl = `/uploads/portfolio/${req.file.filename}`;
            
            // Удаляем старое изображение
            if (portfolio.image_url && portfolio.image_url.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../..', portfolio.image_url);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
        }

        // Обновление данных
        await Portfolio.update(portfolioId, updateData);

        const updatedPortfolio = await Portfolio.findById(portfolioId);

        res.json({
            success: true,
            portfolio: updatedPortfolio
        });
    } catch (error) {
        console.error('Update portfolio error:', error);
        
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ error: 'Ошибка обновления работы' });
    }
};

/**
 * DELETE /api/portfolio/:id - Удаление работы из портфолио
 * Проверяет, что portfolio.user_id === currentUser.id перед удалением
 */
exports.deletePortfolio = async (req, res) => {
    try {
        const portfolioId = parseInt(req.params.id);
        const authUser = getAuthUser(req);

        // Проверка авторизации
        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка существования работы
        const portfolio = await Portfolio.findById(portfolioId);
        
        if (!portfolio) {
            return res.status(404).json({ error: 'Работа не найдена' });
        }

        // Проверка прав доступа: только владелец может удалять
        if (portfolio.user_id !== authUser.id) {
            return res.status(403).json({ error: 'Нет прав для удаления этой работы' });
        }

        // Удаляем файл изображения
        if (portfolio.image_url && portfolio.image_url.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '../..', portfolio.image_url);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        await Portfolio.delete(portfolioId);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({ error: 'Ошибка удаления работы' });
    }
};

// Экспортируем middleware для загрузки файлов
exports.uploadMiddleware = upload;

