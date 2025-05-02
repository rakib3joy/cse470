import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import './ChatStyles.css';

const ChatButton = ({ userId, userName }) => {
  const { createChat } = useChat();
  const navigate = useNavigate();
  
  const handleStartChat = async () => {
    const chat = await createChat(userId);
    if (chat) {
      navigate(`/chats/${chat._id}`);
    }
  };
  
  return (
    <button 
      onClick={handleStartChat} 
      className="chat-button"
      title={`Chat with ${userName}`}
    >
      <FiMessageSquare />
      <span>Chat</span>
    </button>
  );
};

export default ChatButton;