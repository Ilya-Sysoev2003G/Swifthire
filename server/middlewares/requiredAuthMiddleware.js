exports.requiredAuthMiddleware = (req, res, next) => {
    try {
        if (!req.auth_user) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        next();
    } catch (error) {
        console.error('Required auth user error:', error);
        return res.status(500).json({ error: 'Ошибка требуемого пользователя' });
    }
};