const Chat = require('../models/Chat');
const User = require('../models/User'); // Assuming you have a User model

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated
    
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name profilePicture userType')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

// Get a specific chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    })
    .populate('participants', 'name profilePicture userType')
    .populate('messages.sender', 'name profilePicture userType');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] }
    });
    
    if (existingChat) {
      return res.status(200).json(existingChat);
    }
    
    // Create new chat
    const newChat = new Chat({
      participants: [userId, participantId],
      messages: []
    });
    
    await newChat.save();
    
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name profilePicture userType');
    
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if sender is a participant
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    
    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    await chat.save();
    
    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name profilePicture userType')
      .populate('messages.sender', 'name profilePicture userType');
    
    res.status(201).json(updatedChat);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};