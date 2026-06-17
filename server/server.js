const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const routes = require('./routes/index');
const { initDatabase } = require('./config/database');
const { userMiddleware } = require('./middlewares/userMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(userMiddleware);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));
// Статический доступ к загруженным файлам
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Роутинг API
app.use('/api', routes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});

// Обработка всех остальных HTML страниц
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, `../public/pages/${req.params.page}`));
});

// Инициализация базы данных и запуск сервера
async function startServer() {
    try {
        // Инициализация БД
        await initDatabase();
        
        // Запуск сервера
        app.listen(PORT, () => {
            console.log(`🚀 SwiftHire server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

