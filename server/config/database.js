const mysql = require('mysql2/promise');
require('dotenv').config();

// Конфигурация подключения к БД
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'swifthire_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Создание пула соединений
const pool = mysql.createPool(dbConfig);

/**
 * Проверка подключения к базе данных
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        return false;
    }
}

/**
 * Инициализация базы данных
 */
async function initDatabase() {
    try {
        // Проверка подключения
        await testConnection();
        
        console.log('📊 Database initialized');
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}

/**
 * Выполнение SQL запроса
 */
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Получение одной записи
 */
async function queryOne(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows[0] || null;
    } catch (error) {
        console.error('Database queryOne error:', error);
        throw error;
    }
}

/**
 * Закрытие пула соединений
 */
async function closePool() {
    try {
        await pool.end();
        console.log('Database pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error);
    }
}

module.exports = {
    pool,
    query,
    queryOne,
    testConnection,
    initDatabase,
    closePool
};

