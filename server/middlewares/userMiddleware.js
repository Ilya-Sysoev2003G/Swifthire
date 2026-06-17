const Session = require("../models/Session");
const User = require("../models/User");

exports.userMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.cookies.sessionId;

        if (!sessionId) {
            req.auth_user = null;
            return next();
        }

        const session = await Session.findBySessionId(sessionId);
        if (!session) {
            req.auth_user = null;
            return next();
        }

        // Всегда загружаем свежие данные пользователя из БД
        const user = await User.findById(session.user_id);

        if (!user) {
            req.auth_user = null;
            return next();
        }

        req.auth_user = {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.user_type  // Это поле должно быть 'admin'
        };
        
        console.log('User authenticated:', req.auth_user); // Для отладки
        
        next();
    } catch (error) {
        console.error('Ошибка в userMiddleware:', error);
        req.auth_user = null;
        next();
    }
};