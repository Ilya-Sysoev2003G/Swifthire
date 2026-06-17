const { query, queryOne } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Модель для работы с заказами
 */
class Chat {
    /**
     * Получить все активные заказы
     * @returns {Promise<Array>}
     */
    static async getAll(currentId) {
        const chats = await query(
            `SELECT
                 c.id,
                 u.name AS user_name,
                 m.message,
                 m.has_attachments
             FROM chats c
                      JOIN users u
                           ON u.id = CASE
                                         WHEN c.user_1 = ? THEN c.user_2
                                         WHEN c.user_2 = ? THEN c.user_1
                                         ELSE NULL
                               END
                      JOIN messages m
                           ON m.id = (
                               SELECT m2.id
                               FROM messages m2
                               WHERE m2.chat_id = c.id
                               ORDER BY m2.created_at DESC
                 LIMIT 1
                 )
             WHERE c.user_1 = ? OR c.user_2 = ?; `
        , [currentId, currentId, currentId, currentId]);
        return chats.map(
            chat => ({
                id: chat.id,
                userName: chat.user_name,
                lastMessage: chat.message,
                hasAttachments: chat.has_attachments
            })
        )
    }

    static async getChatMessages(chatId, currentId) {
        const messages = await query(
            `SELECT 
                m.*, 
                u.name as sender_name,
                cf.id as file_id,
                cf.file_name,
                cf.original_name,
                cf.file_size,
                cf.file_type
            FROM messages m
                LEFT JOIN chats c ON c.id = m.chat_id
                LEFT JOIN users u ON u.id = m.sender_id
                LEFT JOIN chat_files cf ON cf.message_id = m.id
                WHERE c.id = ? AND (c.user_1 = ? OR c.user_2 = ?)
            ORDER BY m.created_at ASC;
            `
            , [chatId, currentId, currentId]);
        
        // Группируем сообщения с файлами
        const messagesMap = new Map();
        
        messages.forEach(row => {
            if (!messagesMap.has(row.id)) {
                messagesMap.set(row.id, {
                    id: row.id,
                    isOwn: row.sender_id === currentId,
                    senderId: row.sender_id,
                    senderName: row.sender_name,
                    text: row.message,
                    hasAttachments: row.has_attachments,
                    isRead: row.is_read,
                    timestamp: row.created_at,
                    chatId: row.chat_id,
                    files: []
                });
            }
            
            // Если есть файл, добавляем его
            if (row.file_id) {
                messagesMap.get(row.id).files.push({
                    id: row.file_id,
                    fileName: row.file_name,
                    originalName: row.original_name,
                    fileSize: row.file_size,
                    fileType: row.file_type
                });
            }
        });
        
        return Array.from(messagesMap.values());
    }

    /**
     * Проверить доступ пользователя к чату
     * @param {number} chatId - ID чата
     * @param {number} userId - ID пользователя
     * @returns {Promise<boolean>}
     */
    static async hasAccess(chatId, userId) {
        const chat = await queryOne(
            `SELECT id FROM chats WHERE id = ? AND (user_1 = ? OR user_2 = ?)`,
            [chatId, userId, userId]
        );
        return !!chat;
    }

    /**
     * Создать чат между двумя пользователями или найти существующий
     * @param {number} user1Id - ID первого пользователя
     * @param {number} user2Id - ID второго пользователя
     * @returns {Promise<Object>}
     */
    static async createOrGetChat(user1Id, user2Id) {
        // Проверяем, существует ли уже чат между этими пользователями
        const existingChat = await queryOne(
            `SELECT id FROM chats 
             WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)`,
            [user1Id, user2Id, user2Id, user1Id]
        );
        
        if (existingChat) {
            return { id: existingChat.id, isNew: false };
        }
        
        // Создаем новый чат
        const result = await query(
            `INSERT INTO chats (user_1, user_2) VALUES (?, ?)`,
            [user1Id, user2Id]
        );
        
        return { id: result.insertId, isNew: true };
    }

    /**
     * Отправить сообщение
     * @param {number} chatId - ID чата
     * @param {number} senderId - ID отправителя
     * @param {string} message - Текст сообщения
     * @param {Array} files - Массив файлов
     * @returns {Promise<Object>}
     */
    static async sendMessage(chatId, senderId, message, files = []) {
        const hasAttachments = files.length > 0;
        
        const result = await query(
            `INSERT INTO messages (chat_id, sender_id, message, has_attachments, is_read, created_at) 
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [chatId, senderId, message, hasAttachments]
        );
        
        const messageId = result.insertId;
        
        // Сохраняем файлы, если они есть
        const savedFiles = [];
        if (files.length > 0) {
            for (const file of files) {
                const fileResult = await query(
                    `INSERT INTO chat_files (chat_id, message_id, user_id, file_name, file_path, file_size, file_type, original_name)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [chatId, messageId, senderId, file.filename, file.path, file.size, file.mimetype, file.originalname]
                );
                
                savedFiles.push({
                    id: fileResult.insertId,
                    fileName: file.filename,
                    originalName: file.originalname,
                    fileSize: file.size,
                    fileType: file.mimetype
                });
            }
        }
        
        // Получаем только что созданное сообщение
        const newMessage = await queryOne(
            `SELECT m.*, u.name as sender_name FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [messageId]
        );
        
        return {
            id: newMessage.id,
            isOwn: true,
            senderId: newMessage.sender_id,
            senderName: newMessage.sender_name,
            text: newMessage.message,
            hasAttachments: newMessage.has_attachments,
            isRead: newMessage.is_read,
            timestamp: newMessage.created_at,
            chatId: newMessage.chat_id,
            files: savedFiles
        };
    }

    /**
     * Получить информацию о файле
     * @param {number} fileId - ID файла
     * @param {number} userId - ID пользователя (для проверки доступа)
     * @returns {Promise<Object|null>}
     */
    static async getFileInfo(fileId, userId) {
        const fileInfo = await queryOne(
            `SELECT cf.*, c.user_1, c.user_2 
             FROM chat_files cf
             JOIN chats c ON cf.chat_id = c.id
             WHERE cf.id = ? AND (c.user_1 = ? OR c.user_2 = ?)`,
            [fileId, userId, userId]
        );
        
        return fileInfo;
    }

    /**
     * Получить файлы сообщения
     * @param {number} messageId - ID сообщения
     * @returns {Promise<Array>}
     */
    static async getMessageFiles(messageId) {
        const files = await query(
            `SELECT * FROM chat_files WHERE message_id = ?`,
            [messageId]
        );
        
        return files.map(file => ({
            id: file.id,
            fileName: file.file_name,
            originalName: file.original_name,
            fileSize: file.file_size,
            fileType: file.file_type,
            filePath: file.file_path
        }));
    }

     /**
     * Отправить уведомление о ответе техподдержки
     * @param {number} userId 
     * @param {number} ticketId 
     * @param {string} response 
     * @returns {Promise<number>}
     */
    static async sendSupportResponse(userId, ticketId, response) {
        // Создаем системное сообщение от техподдержки
        const result = await query(
            `INSERT INTO messages (chat_id, sender_id, message, message_type, created_at) 
             VALUES (?, ?, ?, 'support_response', NOW())`,
            [null, null, `📋 Ответ техподдержки по заявке #${ticketId}:\n\n${response}`]
        );

        // Здесь можно добавить логику для создания уведомления
        // или отправки через WebSocket
        
        return result.insertId;
    }

    /**
     * Получить сообщения техподдержки для пользователя
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async getSupportMessages(userId) {
        return await query(
            `SELECT * FROM messages 
             WHERE message_type = 'support_response' 
             AND (sender_id = ? OR sender_id IS NULL)
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );
    }
}

module.exports = Chat;