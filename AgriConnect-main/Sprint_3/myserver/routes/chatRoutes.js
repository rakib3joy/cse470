const express = require('express');
const router = express.Router();
const chatController = require('./chatController');
const authMiddleware = require('../middleware/auth'); // Assuming you have auth middleware

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Get all chats for current user
router.get('/', chatController.getUserChats);

// Get specific chat by ID
router.get('/:chatId', chatController.getChatById);

// Create a new chat
router.post('/', chatController.createChat);

// Send a message
router.post('/message', chatController.sendMessage);

module.exports = router;