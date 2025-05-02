import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
///import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import './ChatStyles.css';

const ChatList = () => {
  const { chats, fetchChats, loading, error } = useChat();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  
  if (loading) return <div className="loading">Loading chats...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  // Helper function to get the other participant
  const getOtherParticipant = (chat) => {
    return chat.participants.find(
      participant => participant._id !== user._id
    );
  };
  
  // Helper to get the last message
  const getLastMessage = (chat) => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 30 
      ? `${lastMsg.content.substring(0, 30)}...` 
      : lastMsg.content;
  };
  
  return (
    <div className="chat-list-container">
      <h2>Your Conversations</h2>
      
      {chats.length === 0 ? (
        <div className="no-chats">
          <p>You don't have any conversations yet.</p>
        </div>
      ) : (
        <div className="chat-list">
          {chats.map(chat => {
            const otherParticipant = getOtherParticipant(chat);
            return (
              <Link 
                to={`/chats/${chat._id}`} 
                key={chat._id} 
                className="chat-item"
              >
                <div className="chat-avatar">
                  {otherParticipant.profilePicture ? (
                    <img 
                      src={otherParticipant.profilePicture} 
                      alt={otherParticipant.name} 
                    />
                  ) : (
                    <div className="default-avatar">
                      {otherParticipant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <h3>{otherParticipant.name}</h3>
                    <span className="chat-time">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="last-message">{getLastMessage(chat)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;