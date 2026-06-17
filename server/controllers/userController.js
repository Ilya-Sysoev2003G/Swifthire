const User = require('../models/User');
const { getAuthUser } = require('../utils/auth');

/**
 * GET /api/users/:id - Получение информации о пользователе
 */
exports.getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.user_type,
            skills: user.skills,
            created_at: user.created_at
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Ошибка получения пользователя' });
    }
};

/**
 * PUT /api/users/:id - Обновление профиля пользователя
 * Только авторизованный пользователь может редактировать свой профиль
 */
exports.updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, password, skills } = req.body;
        const authUser = getAuthUser(req);

        // Проверка авторизации
        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка прав доступа: пользователь может редактировать только свой профиль
        if (authUser.id !== userId) {
            return res.status(403).json({ error: 'Нет прав для редактирования этого профиля' });
        }

        // Проверка существования пользователя
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Обновление данных
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (password) updates.password = password;
        if (skills !== undefined) updates.skills = skills;

        await User.update(userId, updates);

        // Получение обновленных данных
        const updatedUser = await User.findById(userId);

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                userType: updatedUser.user_type,
                skills: updatedUser.skills
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Ошибка обновления пользователя' });
    }
};

/**
 * GET /api/users/:id/dashboard - Данные для личного кабинета
 * Только авторизованный пользователь может просматривать свой дашборд
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const authUser = getAuthUser(req);

        // Проверка авторизации
        if (!authUser) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Проверка прав доступа: пользователь может просматривать только свой дашборд
        if (authUser.id !== userId) {
            return res.status(403).json({ error: 'Нет прав для просмотра этого дашборда' });
        }

        // Получение данных пользователя
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Статистика зависит от типа пользователя
        let stats = {
            totalOrders: 0,
            activeOrders: 0,
            completedOrders: 0
        };

        if (user.user_type === 'customer') {
            // Статистика заказов для заказчика
            const orderStats = await User.getCustomerOrderStats(userId);
            stats = {
                totalOrders: orderStats.total,
                activeOrders: orderStats.active,
                completedOrders: orderStats.completed
            };
        } else if (user.user_type === 'performer') {
            // Статистика заказов для исполнителя (по performer_id)
            const orderStats = await User.getPerformerOrderStats(userId);
            stats = {
                totalOrders: orderStats.total,
                activeOrders: orderStats.active,
                completedOrders: orderStats.completed
            };
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.user_type
            },
            stats,
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Ошибка получения данных дашборда' });
    }
};

/**
 * Получить информацию о текущем пользователе
 */
exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.auth_user) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        
        const user = await User.findById(req.auth_user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};
