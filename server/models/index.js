/**
 * Центральная точка экспорта всех моделей
 */

const User = require('./User');
const Session = require('./Session');
const Order = require('./Order');
const Service = require('./Service');

module.exports = {
    User,
    Session,
    Order,
    Service
};

