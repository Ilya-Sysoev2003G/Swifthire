/**
 * Получение авторизованного пользователя из запроса
 * @param {Object} req - объект запроса Express
 * @returns {Object|null} объект пользователя или null
 */
exports.getAuthUser = (req) => {
    return req.auth_user || null;
};

