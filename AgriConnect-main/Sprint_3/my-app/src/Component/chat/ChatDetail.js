import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import moment from 'moment';
import { useChat } from '../../context/ChatContext';
//import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import './ChatStyles.css';

const ChatDetail = () => {
  const { chatId } = useParams();
  const { currentChat, fetchChatById, sendMessage, loading, error } = useChat();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (chatId) {
      fetchChatById(chatId);
    }
  }, [chatId, fetchChatById]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;
    
    sendMessage(chatId, messageText.trim());
    setMessageText('');
  };
  
  if (loading) return <div className="loading">Loading chat...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!currentChat) return <div className="loading">Loading chat...</div>;
  
  // Get the other participant
  const otherParticipant = currentChat.participants.find(
    participant => participant._id !== user._id
  );
  
  return (
    <div className="chat-detail-container">
      <div className="chat-header">
        <Link to="/chats" className="back-button">
          <FiArrowLeft />
        </Link>
        <div className="chat-user-info">
          {otherParticipant.profilePicture ? (
            <img 
              src={otherParticipant.profilePicture} 
              alt={otherParticipant.name}
              className="chat-avatar" 
            />
          ) : (
            <div className="default-avatar">
              {otherParticipant.name.charAt(0)}
            </div>
          )}
          <div>
            <h3>{otherParticipant.name}</h3>
            <span className="user-type">{otherParticipant.userType}</span>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {currentChat.messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {currentChat.messages.map((msg, index) => {
              const isSender = msg.sender._id === user._id;
              return (
                <div 
                  key={index}
                  className={`message ${isSender ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {moment(msg.timestamp).format('h:mm A')}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button" disabled={!messageText.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatDetail;