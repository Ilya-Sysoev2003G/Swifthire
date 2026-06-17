const User = require('../models/User');
const Session = require('../models/Session');

/**
 * POST /api/auth/register - Регистрация нового пользователя
 */
exports.register = async (req, res) => {
    try {
        const { email, password, name, userType } = req.body;

        // Проверка, существует ли пользователь
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Создание нового пользователя (пароль автоматически хешируется в модели)
        const userId = await User.create({
            email,
            password,
            name,
            userType
        });

        // Создание сессии
        const sessionId = await Session.create(userId);

        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({
            success: true,
            user: {
                id: userId,
                email,
                name,
                userType
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
};

/**
 * POST /api/auth/login - Авторизация пользователя
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.authenticate(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Создание сессии
        const sessionId = await Session.create(user.id);

        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                userType: user.user_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка входа' });
    }
};

/**
 * POST /api/auth/logout - Выход из системы
 */
exports.logout = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (sessionId) {
            await Session.delete(sessionId);
        }
        
        res.clearCookie('sessionId');
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Ошибка выхода' });
    }
};

/**
 * GET /api/auth/me - Получение данных текущего пользователя
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (!sessionId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        const session = await Session.findBySessionId(sessionId);

        if (!session) {
            return res.status(401).json({ error: 'Сессия не найдена' });
        }

        const user = await User.findById(session.user_id);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.user_type
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Ошибка получения данных пользователя' });
    }
};
